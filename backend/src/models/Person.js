import { getDB } from '../config/sqlite-db.js';
import { v4 as uuidv4 } from 'uuid';

class Person {
  constructor(data) {
    this.person_id = data.person_id;
    this.full_name = data.full_name;
    this.gender = data.gender;
    this.birth_date = data.birth_date;
    this.death_date = data.death_date;
    this.biography = data.biography;
    this.avatar_url = data.avatar_url;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new person
  static async create(personData) {
    const db = getDB();
    const { full_name, gender, birth_date, death_date, biography, avatar_url } = personData;
    const person_id = uuidv4();

    const query = `
      INSERT INTO Persons (person_id, full_name, gender, birth_date, death_date, biography, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [person_id, full_name, gender, birth_date, death_date, biography, avatar_url];

    try {
      await db.run(query, values);
      const result = await db.get('SELECT * FROM Persons WHERE person_id = ?', [person_id]);
      return new Person(result);
    } catch (error) {
      throw new Error(`Error creating person: ${error.message}`);
    }
  }

  // Find person by ID
  static async findById(personId) {
    const db = getDB();
    const query = 'SELECT * FROM Persons WHERE person_id = ?';

    try {
      const result = await db.get(query, [personId]);
      return result ? new Person(result) : null;
    } catch (error) {
      throw new Error(`Error finding person: ${error.message}`);
    }
  }

  // Find all persons with pagination
  static async findAll(limit = 20, offset = 0) {
    const db = getDB();
    const query = `
      SELECT * FROM Persons 
      ORDER BY full_name ASC 
      LIMIT ? OFFSET ?
    `;

    try {
      const result = await db.all(query, [limit, offset]);
      return result.map(row => new Person(row));
    } catch (error) {
      throw new Error(`Error fetching persons: ${error.message}`);
    }
  }

  // Search persons by name
  static async searchByName(searchTerm) {
    const db = getDB();
    const query = `
      SELECT * FROM Persons 
      WHERE full_name LIKE ? 
      ORDER BY full_name ASC
    `;

    try {
      const result = await db.all(query, [`%${searchTerm}%`]);
      return result.map(row => new Person(row));
    } catch (error) {
      throw new Error(`Error searching persons: ${error.message}`);
    }
  }

  // Update person
  static async update(personId, updateData) {
    const db = getDB();
    const { full_name, gender, birth_date, death_date, biography, avatar_url } = updateData;

    const query = `
      UPDATE Persons 
      SET full_name = ?, gender = ?, birth_date = ?, death_date = ?, 
          biography = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE person_id = ?
    `;

    const values = [full_name, gender, birth_date, death_date, biography, avatar_url, personId];

    try {
      await db.run(query, values);
      const result = await db.get('SELECT * FROM Persons WHERE person_id = ?', [personId]);
      return result ? new Person(result) : null;
    } catch (error) {
      throw new Error(`Error updating person: ${error.message}`);
    }
  }

  // Delete person
  static async delete(personId) {
    const db = getDB();
    const query = 'DELETE FROM Persons WHERE person_id = ?';

    try {
      const result = await db.run(query, [personId]);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Error deleting person: ${error.message}`);
    }
  }

  // Get person's family relationships
  static async getFamilyRelationships(personId) {
    const db = getDB();
    const query = `
      SELECT 
        fr.relation_type,
        p.person_id,
        p.full_name,
        p.avatar_url
      FROM Family_Relationships fr
      JOIN Persons p ON fr.relative_id = p.person_id
      WHERE fr.person_id = ?
      ORDER BY fr.relation_type, p.full_name
    `;

    try {
      const result = await db.all(query, [personId]);
      return result;
    } catch (error) {
      throw new Error(`Error fetching family relationships: ${error.message}`);
    }
  }

  // Get person's timeline (events)
  static async getTimeline(personId) {
    const db = getDB();
    const query = `
      SELECT 
        e.event_id,
        e.event_type,
        e.event_date,
        e.description,
        d.file_path as document_path,
        p.file_path as photo_path
      FROM Events e
      LEFT JOIN Documents d ON e.document_id = d.document_id
      LEFT JOIN Photos p ON e.photo_id = p.photo_id
      WHERE e.person_id = ?
      ORDER BY e.event_date ASC
    `;

    try {
      const result = await db.all(query, [personId]);
      return result;
    } catch (error) {
      throw new Error(`Error fetching timeline: ${error.message}`);
    }
  }
}

export default Person;
