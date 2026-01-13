import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;

export const connectDB = async () => {
  try {
    const dbPath = join(__dirname, '..', 'family_archive.db');
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create tables
    await initializeTables();
    
    console.log('✅ SQLite Database Connected Successfully');
    return db;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const initializeTables = async () => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS Persons (
      person_id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      gender TEXT CHECK (gender IN ('male', 'female', 'other')),
      birth_date DATE,
      death_date DATE,
      biography TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS Family_Relationships (
      relation_id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      relative_id TEXT NOT NULL,
      relation_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (person_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
      FOREIGN KEY (relative_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
      UNIQUE(person_id, relative_id, relation_type)
    )`,
    
    `CREATE TABLE IF NOT EXISTS Documents (
      document_id TEXT PRIMARY KEY,
      person_id TEXT,
      file_path TEXT NOT NULL,
      original_filename TEXT,
      document_type TEXT DEFAULT 'unknown',
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      extracted_text TEXT,
      clean_text TEXT,
      confidence_score REAL DEFAULT 0,
      tags TEXT,
      file_size INTEGER,
      mime_type TEXT,
      FOREIGN KEY (person_id) REFERENCES Persons(person_id) ON DELETE SET NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS Photos (
      photo_id TEXT PRIMARY KEY,
      person_id TEXT,
      file_path TEXT NOT NULL,
      original_filename TEXT,
      event_name TEXT,
      date_taken DATE,
      detected_faces INTEGER DEFAULT 0,
      file_size INTEGER,
      width INTEGER,
      height INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (person_id) REFERENCES Persons(person_id) ON DELETE SET NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS Events (
      event_id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_date DATE,
      description TEXT,
      document_id TEXT,
      photo_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (person_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
      FOREIGN KEY (document_id) REFERENCES Documents(document_id) ON DELETE SET NULL,
      FOREIGN KEY (photo_id) REFERENCES Photos(photo_id) ON DELETE SET NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS Auto_CV (
      cv_id TEXT PRIMARY KEY,
      person_id TEXT UNIQUE NOT NULL,
      generated_cv TEXT,
      summary TEXT,
      last_generated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (person_id) REFERENCES Persons(person_id) ON DELETE CASCADE
    )`
  ];

  for (const table of tables) {
    await db.exec(table);
  }

  // Create indexes
  await db.exec('CREATE INDEX IF NOT EXISTS idx_persons_name ON Persons(full_name)');
  await db.exec('CREATE INDEX IF NOT EXISTS idx_documents_person ON Documents(person_id)');
  await db.exec('CREATE INDEX IF NOT EXISTS idx_photos_person ON Photos(person_id)');
  await db.exec('CREATE INDEX IF NOT EXISTS idx_events_person ON Events(person_id)');
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

export { db };
