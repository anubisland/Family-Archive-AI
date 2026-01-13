import { getDB } from '../config/sqlite-db.js';
import { v4 as uuidv4 } from 'uuid';

class Photo {
  constructor(data) {
    this.photo_id = data.photo_id || uuidv4();
    this.person_id = data.person_id || null;
    this.file_path = data.file_path;
    this.original_filename = data.original_filename;
    this.event_name = data.event_name || null;
    this.date_taken = data.date_taken || null;
    this.detected_faces = data.detected_faces || 0;
    this.file_size = data.file_size || 0;
    this.width = data.width || null;
    this.height = data.height || null;
    this.created_at = data.created_at || new Date().toISOString();
  }

  // Create a new photo
  static async create(photoData) {
    const db = getDB();
    const photo = new Photo(photoData);
    
    const stmt = `
      INSERT INTO Photos (
        photo_id, person_id, file_path, original_filename, 
        event_name, date_taken, detected_faces, file_size, 
        width, height, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.run(stmt, [
      photo.photo_id,
      photo.person_id,
      photo.file_path,
      photo.original_filename,
      photo.event_name,
      photo.date_taken,
      photo.detected_faces,
      photo.file_size,
      photo.width,
      photo.height,
      photo.created_at
    ]);

    if (result.changes === 0) {
      throw new Error('Failed to create photo record');
    }

    return photo;
  }

  // Get all photos with pagination
  static async findAll(page = 1, limit = 20) {
    const db = getDB();
    const offset = (page - 1) * limit;
    
    const stmt = `
      SELECT 
        p.*,
        per.full_name as person_name
      FROM Photos p
      LEFT JOIN Persons per ON p.person_id = per.person_id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const photos = await db.all(stmt, [limit, offset]);
    
    // Get total count
    const { count } = await db.get('SELECT COUNT(*) as count FROM Photos');

    return {
      photos,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  // Find photo by ID
  static async findById(id) {
    const db = getDB();
    const stmt = `
      SELECT 
        p.*,
        per.full_name as person_name
      FROM Photos p
      LEFT JOIN Persons per ON p.person_id = per.person_id
      WHERE p.photo_id = ?
    `;

    return await db.get(stmt, [id]);
  }

  // Find photos by person ID
  static async findByPersonId(personId) {
    const db = getDB();
    const stmt = `
      SELECT p.*
      FROM Photos p
      WHERE p.person_id = ?
      ORDER BY p.created_at DESC
    `;

    return await db.all(stmt, [personId]);
  }

  // Search photos by filename or event name
  static async search(query, page = 1, limit = 20) {
    const db = getDB();
    const offset = (page - 1) * limit;
    const searchTerm = `%${query}%`;
    
    const stmt = `
      SELECT 
        p.*,
        per.full_name as person_name
      FROM Photos p
      LEFT JOIN Persons per ON p.person_id = per.person_id
      WHERE p.original_filename LIKE ? 
         OR p.event_name LIKE ?
         OR per.full_name LIKE ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const photos = await db.all(stmt, [searchTerm, searchTerm, searchTerm, limit, offset]);
    
    // Get total count for search
    const countStmt = `
      SELECT COUNT(*) as count 
      FROM Photos p
      LEFT JOIN Persons per ON p.person_id = per.person_id
      WHERE p.original_filename LIKE ? 
         OR p.event_name LIKE ?
         OR per.full_name LIKE ?
    `;
    const { count } = await db.get(countStmt, [searchTerm, searchTerm, searchTerm]);

    return {
      photos,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  // Update photo
  static async update(id, updates) {
    const db = getDB();
    const allowedFields = [
      'person_id', 'event_name', 'date_taken', 
      'detected_faces', 'width', 'height'
    ];
    
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(id);
    
    const stmt = `
      UPDATE Photos 
      SET ${fields.join(', ')}
      WHERE photo_id = ?
    `;

    const result = await db.run(stmt, values);
    
    if (result.changes === 0) {
      throw new Error('Photo not found or no changes made');
    }

    return this.findById(id);
  }

  // Delete photo
  static async delete(id) {
    const db = getDB();
    const stmt = 'DELETE FROM Photos WHERE photo_id = ?';
    const result = await db.run(stmt, [id]);
    
    if (result.changes === 0) {
      throw new Error('Photo not found');
    }
    
    return { deleted: true, photo_id: id };
  }

  // Get photos by date range
  static async findByDateRange(startDate, endDate, page = 1, limit = 20) {
    const db = getDB();
    const offset = (page - 1) * limit;
    
    const stmt = `
      SELECT 
        p.*,
        per.full_name as person_name
      FROM Photos p
      LEFT JOIN Persons per ON p.person_id = per.person_id
      WHERE p.date_taken BETWEEN ? AND ?
      ORDER BY p.date_taken DESC
      LIMIT ? OFFSET ?
    `;

    const photos = await db.all(stmt, [startDate, endDate, limit, offset]);
    
    const countStmt = `
      SELECT COUNT(*) as count 
      FROM Photos 
      WHERE date_taken BETWEEN ? AND ?
    `;
    const { count } = await db.get(countStmt, [startDate, endDate]);

    return {
      photos,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  // Get photo statistics
  static async getStats() {
    const db = getDB();
    const { count: totalPhotos } = await db.get('SELECT COUNT(*) as count FROM Photos');
    const { count: photosWithPerson } = await db.get('SELECT COUNT(*) as count FROM Photos WHERE person_id IS NOT NULL');

    const recentPhotos = await db.all(`
      SELECT 
        p.*,
        per.full_name as person_name
      FROM Photos p
      LEFT JOIN Persons per ON p.person_id = per.person_id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    return {
      totalPhotos,
      photosWithPerson,
      photosWithoutPerson: totalPhotos - photosWithPerson,
      recentPhotos
    };
  }
}

export default Photo;
