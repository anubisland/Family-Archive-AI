import { getDB } from '../config/sqlite-db.js';
import { v4 as uuidv4 } from 'uuid';

class Document {
  constructor(data) {
    this.document_id = data.document_id;
    this.person_id = data.person_id;
    this.file_path = data.file_path;
    this.original_filename = data.original_filename;
    this.document_type = data.document_type;
    this.upload_date = data.upload_date;
    this.extracted_text = data.extracted_text;
    this.clean_text = data.clean_text;
    this.confidence_score = data.confidence_score;
    this.tags = data.tags;
    this.file_size = data.file_size;
    this.mime_type = data.mime_type;
  }

  // Create a new document
  static async create(documentData) {
    const db = getDB();
    const {
      person_id,
      file_path,
      original_filename,
      document_type,
      extracted_text,
      clean_text,
      confidence_score,
      tags,
      file_size,
      mime_type
    } = documentData;
    
    const document_id = uuidv4();

    const query = `
      INSERT INTO Documents (
        document_id, person_id, file_path, original_filename, document_type,
        extracted_text, clean_text, confidence_score, tags, file_size, mime_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      document_id, person_id, file_path, original_filename, document_type,
      extracted_text, clean_text, confidence_score, tags, file_size, mime_type
    ];

    try {
      await db.run(query, values);
      const result = await db.get('SELECT * FROM Documents WHERE document_id = ?', [document_id]);
      return new Document(result);
    } catch (error) {
      throw new Error(`Error creating document: ${error.message}`);
    }
  }

  // Find document by ID
  static async findById(documentId) {
    const db = getDB();
    const query = 'SELECT * FROM Documents WHERE document_id = ?';

    try {
      const result = await db.get(query, [documentId]);
      return result ? new Document(result) : null;
    } catch (error) {
      throw new Error(`Error finding document: ${error.message}`);
    }
  }

  // Find all documents with pagination
  static async findAll(limit = 20, offset = 0) {
    const db = getDB();
    const query = `
      SELECT d.*, p.full_name as person_name
      FROM Documents d
      LEFT JOIN Persons p ON d.person_id = p.person_id
      ORDER BY d.upload_date DESC
      LIMIT ? OFFSET ?
    `;

    try {
      const result = await db.all(query, [limit, offset]);
      return result.map(row => ({
        ...new Document(row),
        person_name: row.person_name
      }));
    } catch (error) {
      throw new Error(`Error fetching documents: ${error.message}`);
    }
  }

  // Find documents by person
  static async findByPerson(personId) {
    const db = getDB();
    const query = `
      SELECT * FROM Documents 
      WHERE person_id = ?
      ORDER BY upload_date DESC
    `;

    try {
      const result = await db.all(query, [personId]);
      return result.map(row => new Document(row));
    } catch (error) {
      throw new Error(`Error fetching person documents: ${error.message}`);
    }
  }

  // Search documents by text content
  static async searchByText(searchTerm) {
    const db = getDB();
    const query = `
      SELECT d.*, p.full_name as person_name
      FROM Documents d
      LEFT JOIN Persons p ON d.person_id = p.person_id
      WHERE d.extracted_text LIKE ? OR d.clean_text LIKE ? OR d.original_filename LIKE ?
      ORDER BY d.upload_date DESC
    `;

    const searchPattern = `%${searchTerm}%`;

    try {
      const result = await db.all(query, [searchPattern, searchPattern, searchPattern]);
      return result.map(row => ({
        ...new Document(row),
        person_name: row.person_name
      }));
    } catch (error) {
      throw new Error(`Error searching documents: ${error.message}`);
    }
  }

  // Update document
  static async update(documentId, updateData) {
    const db = getDB();
    const {
      person_id,
      document_type,
      extracted_text,
      clean_text,
      confidence_score,
      tags
    } = updateData;

    const query = `
      UPDATE Documents 
      SET person_id = ?, document_type = ?, extracted_text = ?, 
          clean_text = ?, confidence_score = ?, tags = ?
      WHERE document_id = ?
    `;

    const values = [person_id, document_type, extracted_text, clean_text, confidence_score, tags, documentId];

    try {
      await db.run(query, values);
      const result = await db.get('SELECT * FROM Documents WHERE document_id = ?', [documentId]);
      return result ? new Document(result) : null;
    } catch (error) {
      throw new Error(`Error updating document: ${error.message}`);
    }
  }

  // Delete document
  static async delete(documentId) {
    const db = getDB();
    const query = 'DELETE FROM Documents WHERE document_id = ?';

    try {
      const result = await db.run(query, [documentId]);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Error deleting document: ${error.message}`);
    }
  }

  // Get documents by type
  static async findByType(documentType) {
    const db = getDB();
    const query = `
      SELECT d.*, p.full_name as person_name
      FROM Documents d
      LEFT JOIN Persons p ON d.person_id = p.person_id
      WHERE d.document_type = ?
      ORDER BY d.upload_date DESC
    `;

    try {
      const result = await db.all(query, [documentType]);
      return result.map(row => ({
        ...new Document(row),
        person_name: row.person_name
      }));
    } catch (error) {
      throw new Error(`Error fetching documents by type: ${error.message}`);
    }
  }
}

export default Document;
