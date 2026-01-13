import express from 'express';
import { getDB } from '../config/sqlite-db.js';

const router = express.Router();

// Get family tree data for a specific person
router.get('/person/:personId', async (req, res) => {
  try {
    const { personId } = req.params;
    const db = getDB();

    // Get the main person
    const person = await db.get('SELECT * FROM Persons WHERE person_id = ?', [personId]);
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Get all relationships for this person and their relatives
    const relationships = await db.all(`
      SELECT 
        fr.relation_id,
        fr.person_id,
        fr.relative_id,
        fr.relation_type,
        p1.full_name as person_name,
        p1.birth_date as person_birth_date,
        p1.death_date as person_death_date,
        p1.gender as person_gender,
        p1.avatar_url as person_avatar,
        p2.full_name as relative_name,
        p2.birth_date as relative_birth_date,
        p2.death_date as relative_death_date,
        p2.gender as relative_gender,
        p2.avatar_url as relative_avatar
      FROM Family_Relationships fr
      JOIN Persons p1 ON fr.person_id = p1.person_id
      JOIN Persons p2 ON fr.relative_id = p2.person_id
      WHERE fr.person_id = ? OR fr.relative_id = ?
    `, [personId, personId]);

    res.json({
      person,
      relationships,
      success: true
    });
  } catch (error) {
    console.error('Error fetching family tree:', error);
    res.status(500).json({ error: 'Failed to fetch family tree data' });
  }
});

// Get full family tree with all persons and relationships
router.get('/full', async (req, res) => {
  try {
    const db = getDB();

    console.log('Fetching all persons...');
    // Get all persons
    const persons = await db.all('SELECT * FROM Persons ORDER BY full_name');
    console.log(`Found ${persons.length} persons`);
    
    console.log('Fetching all relationships...');
    // Get all relationships
    const relationships = await db.all(`
      SELECT 
        fr.relation_id,
        fr.person_id,
        fr.relative_id,
        fr.relation_type,
        p1.full_name as person_name,
        p1.birth_date as person_birth_date,
        p1.death_date as person_death_date,
        p1.gender as person_gender,
        p1.avatar_url as person_avatar,
        p2.full_name as relative_name,
        p2.birth_date as relative_birth_date,
        p2.death_date as relative_death_date,
        p2.gender as relative_gender,
        p2.avatar_url as relative_avatar
      FROM Family_Relationships fr
      JOIN Persons p1 ON fr.person_id = p1.person_id
      JOIN Persons p2 ON fr.relative_id = p2.person_id
      ORDER BY p1.full_name, p2.full_name
    `);
    console.log(`Found ${relationships.length} relationships`);

    console.log('Building tree structure...');
    // Build tree structure
    const treeData = buildFamilyTree(persons, relationships);
    console.log(`Built tree with ${treeData.length} root nodes`);

    res.json({
      persons,
      relationships,
      tree: treeData,
      success: true
    });
  } catch (error) {
    console.error('Error fetching full family tree:', error);
    res.status(500).json({ error: 'Failed to fetch family tree data', details: error.message });
  }
});

// Add a new relationship
router.post('/relationship', async (req, res) => {
  try {
    const { personId, relativeId, relationType } = req.body;
    
    if (!personId || !relativeId || !relationType) {
      return res.status(400).json({ error: 'Missing required fields: personId, relativeId, relationType' });
    }

    const db = getDB();

    // Check if persons exist
    const person = await db.get('SELECT * FROM Persons WHERE person_id = ?', [personId]);
    const relative = await db.get('SELECT * FROM Persons WHERE person_id = ?', [relativeId]);
    
    if (!person || !relative) {
      return res.status(404).json({ error: 'One or both persons not found' });
    }

    // Insert the relationship
    const result = await db.run(`
      INSERT INTO Family_Relationships (person_id, relative_id, relation_type)
      VALUES (?, ?, ?)
    `, [personId, relativeId, relationType]);

    // Also add the reciprocal relationship
    const reciprocalType = getReciprocalRelationType(relationType);
    if (reciprocalType) {
      await db.run(`
        INSERT INTO Family_Relationships (person_id, relative_id, relation_type)
        VALUES (?, ?, ?)
      `, [relativeId, personId, reciprocalType]);
    }

    res.json({
      relationId: result.lastID,
      message: 'Relationship added successfully',
      success: true
    });
  } catch (error) {
    console.error('Error adding relationship:', error);
    res.status(500).json({ error: 'Failed to add relationship' });
  }
});

// Delete a relationship
router.delete('/relationship/:relationId', async (req, res) => {
  try {
    const { relationId } = req.params;
    const db = getDB();

    // Get the relationship to find reciprocal
    const relationship = await db.get(`
      SELECT * FROM Family_Relationships WHERE relation_id = ?
    `, [relationId]);

    if (!relationship) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    // Delete the relationship
    await db.run('DELETE FROM Family_Relationships WHERE relation_id = ?', [relationId]);

    // Delete reciprocal relationship
    const reciprocalType = getReciprocalRelationType(relationship.relation_type);
    if (reciprocalType) {
      await db.run(`
        DELETE FROM Family_Relationships 
        WHERE person_id = ? AND relative_id = ? AND relation_type = ?
      `, [relationship.relative_id, relationship.person_id, reciprocalType]);
    }

    res.json({
      message: 'Relationship deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting relationship:', error);
    res.status(500).json({ error: 'Failed to delete relationship' });
  }
});

// Get relationship statistics
router.get('/stats', async (req, res) => {
  try {
    const db = getDB();

    const stats = await db.get(`
      SELECT 
        COUNT(DISTINCT person_id) as total_persons,
        COUNT(*) as total_relationships,
        COUNT(CASE WHEN relation_type = 'parent' THEN 1 END) as parent_relationships,
        COUNT(CASE WHEN relation_type = 'child' THEN 1 END) as child_relationships,
        COUNT(CASE WHEN relation_type = 'spouse' THEN 1 END) as spouse_relationships,
        COUNT(CASE WHEN relation_type = 'sibling' THEN 1 END) as sibling_relationships
      FROM Family_Relationships
    `);

    res.json({
      stats,
      success: true
    });
  } catch (error) {
    console.error('Error fetching relationship stats:', error);
    res.status(500).json({ error: 'Failed to fetch relationship statistics' });
  }
});

// Helper function to build family tree structure
function buildFamilyTree(persons, relationships) {
  const personMap = {};
  const tree = [];

  // Initialize person objects with only IDs to avoid circular references
  persons.forEach(person => {
    personMap[person.person_id] = {
      person_id: person.person_id,
      full_name: person.full_name,
      gender: person.gender,
      birth_date: person.birth_date,
      death_date: person.death_date,
      avatar_url: person.avatar_url,
      children: [],
      parents: [],
      spouses: [],
      siblings: []
    };
  });

  // Build relationships using only IDs to avoid circular references
  relationships.forEach(rel => {
    const person = personMap[rel.person_id];
    const relative = personMap[rel.relative_id];

    if (person && relative) {
      switch (rel.relation_type) {
        case 'parent':
          // Add child ID to parent's children array
          if (!person.children.find(c => c.person_id === rel.relative_id)) {
            person.children.push({
              person_id: relative.person_id,
              full_name: relative.full_name,
              gender: relative.gender,
              birth_date: relative.birth_date,
              death_date: relative.death_date
            });
          }
          break;
        case 'child':
          // Add parent ID to child's parents array
          if (!person.parents.find(p => p.person_id === rel.relative_id)) {
            person.parents.push({
              person_id: relative.person_id,
              full_name: relative.full_name,
              gender: relative.gender,
              birth_date: relative.birth_date,
              death_date: relative.death_date
            });
          }
          break;
        case 'spouse':
          if (!person.spouses.find(s => s.person_id === rel.relative_id)) {
            person.spouses.push({
              person_id: relative.person_id,
              full_name: relative.full_name,
              gender: relative.gender,
              birth_date: relative.birth_date,
              death_date: relative.death_date
            });
          }
          break;
        case 'sibling':
          if (!person.siblings.find(s => s.person_id === rel.relative_id)) {
            person.siblings.push({
              person_id: relative.person_id,
              full_name: relative.full_name,
              gender: relative.gender,
              birth_date: relative.birth_date,
              death_date: relative.death_date
            });
          }
          break;
      }
    }
  });

  // Find root persons (those without parents)
  persons.forEach(person => {
    const personNode = personMap[person.person_id];
    if (personNode.parents.length === 0) {
      tree.push(personNode);
    }
  });

  return tree;
}

// Helper function to get reciprocal relationship types
function getReciprocalRelationType(relationType) {
  const reciprocals = {
    'parent': 'child',
    'child': 'parent',
    'spouse': 'spouse',
    'sibling': 'sibling'
  };
  return reciprocals[relationType] || null;
}

export default router;