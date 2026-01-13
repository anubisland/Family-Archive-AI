import { connectDB, getDB } from './src/config/db.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const initializeDatabase = async () => {
  try {
    console.log('🗄️  Initializing Family Archive AI Database...');
    
    // Connect to database
    await connectDB();
    const db = getDB();
    
    // Read schema file
    const schemaPath = join(__dirname, 'src', 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await db.query(schema);
    
    console.log('✅ Database schema created successfully!');
    console.log('📊 Tables created:');
    console.log('   - Persons');
    console.log('   - Family_Relationships');
    console.log('   - Documents');
    console.log('   - Photos');
    console.log('   - Events');
    console.log('   - Auto_CV');
    console.log('');
    console.log('🚀 Your Family Archive AI database is ready!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:');
    console.error(error.message);
    console.log('');
    console.log('💡 Make sure:');
    console.log('   1. PostgreSQL is running');
    console.log('   2. Database "family_archive_ai" exists');
    console.log('   3. Database credentials in .env are correct');
    console.log('');
    console.log('📝 To create database manually:');
    console.log('   createdb family_archive_ai');
    
    process.exit(1);
  }
};

initializeDatabase();
