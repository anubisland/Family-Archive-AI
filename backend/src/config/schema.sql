-- Family Archive AI Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension for face embeddings (optional)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Persons Table
CREATE TABLE IF NOT EXISTS Persons (
    person_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    birth_date DATE,
    death_date DATE,
    biography TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Family Relationships Table
CREATE TABLE IF NOT EXISTS Family_Relationships (
    relation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL,
    relative_id UUID NOT NULL,
    relation_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_person
        FOREIGN KEY (person_id) REFERENCES Persons(person_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_relative
        FOREIGN KEY (relative_id) REFERENCES Persons(person_id)
        ON DELETE CASCADE,

    -- Prevent duplicate relationships
    CONSTRAINT unique_relationship UNIQUE (person_id, relative_id, relation_type)
);

-- 3. Documents Table
CREATE TABLE IF NOT EXISTS Documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID,
    file_path TEXT NOT NULL,
    original_filename TEXT,
    document_type VARCHAR(50) DEFAULT 'unknown',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    extracted_text TEXT,
    clean_text TEXT,
    confidence_score FLOAT DEFAULT 0,
    tags TEXT[],
    file_size INTEGER,
    mime_type VARCHAR(100),

    CONSTRAINT fk_document_person
        FOREIGN KEY (person_id) REFERENCES Persons(person_id)
        ON DELETE SET NULL
);

-- 4. Photos Table
CREATE TABLE IF NOT EXISTS Photos (
    photo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID,
    file_path TEXT NOT NULL,
    original_filename TEXT,
    event_name TEXT,
    date_taken DATE,
    detected_faces INTEGER DEFAULT 0,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_photo_person
        FOREIGN KEY (person_id) REFERENCES Persons(person_id)
        ON DELETE SET NULL
);

-- 5. Events Table
CREATE TABLE IF NOT EXISTS Events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_date DATE,
    description TEXT,
    document_id UUID,
    photo_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_person
        FOREIGN KEY (person_id) REFERENCES Persons(person_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_event_document
        FOREIGN KEY (document_id) REFERENCES Documents(document_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_event_photo
        FOREIGN KEY (photo_id) REFERENCES Photos(photo_id)
        ON DELETE SET NULL
);

-- 6. Auto CV Table
CREATE TABLE IF NOT EXISTS Auto_CV (
    cv_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID UNIQUE NOT NULL,
    generated_cv TEXT,
    summary TEXT,
    last_generated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cv_person
        FOREIGN KEY (person_id) REFERENCES Persons(person_id)
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_persons_name ON Persons(full_name);
CREATE INDEX IF NOT EXISTS idx_persons_birth_date ON Persons(birth_date);
CREATE INDEX IF NOT EXISTS idx_documents_person ON Documents(person_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON Documents(document_type);
CREATE INDEX IF NOT EXISTS idx_photos_person ON Photos(person_id);
CREATE INDEX IF NOT EXISTS idx_events_person ON Events(person_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON Events(event_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for Persons table
CREATE TRIGGER update_persons_updated_at
    BEFORE UPDATE ON Persons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
