import { connectDB, getDB } from './src/config/sqlite-db.js';
import path from 'path';
import fs from 'fs';

async function debugPhotos() {
  try {
    console.log('🔍 Debugging photo display issue...\n');
    
    // Connect to database
    await connectDB();
    const db = getDB();
    
    // Get all photos from database
    const photos = await db.all('SELECT * FROM Photos ORDER BY created_at DESC');
    console.log(`📊 Found ${photos.length} photos in database:\n`);
    
    for (const photo of photos) {
      console.log(`📸 Photo: ${photo.original_filename}`);
      console.log(`   - Database file_path: ${photo.file_path}`);
      console.log(`   - Photo ID: ${photo.photo_id}`);
      
      // Check if file exists on disk
      if (photo.file_path.startsWith('/uploads/')) {
        // Relative path - construct full path
        const fullPath = path.join(process.cwd(), 'uploads', 'photos', photo.file_path.split('/').pop());
        const exists = fs.existsSync(fullPath);
        console.log(`   - Full file path: ${fullPath}`);
        console.log(`   - File exists: ${exists ? '✅' : '❌'}`);
        
        if (exists) {
          const stats = fs.statSync(fullPath);
          console.log(`   - File size: ${Math.round(stats.size / 1024)} KB`);
        }
      } else {
        // Absolute path
        const exists = fs.existsSync(photo.file_path);
        console.log(`   - File exists: ${exists ? '✅' : '❌'}`);
      }
      
      // Construct expected URL
      const expectedUrl = `http://localhost:3001${photo.file_path}`;
      console.log(`   - Expected URL: ${expectedUrl}`);
      console.log('   ---');
    }
    
    // Check uploads directory structure
    console.log('\n📁 Checking uploads directory structure:');
    const uploadsPath = path.join(process.cwd(), 'uploads', 'photos');
    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath);
      console.log(`   - Directory exists: ✅`);
      console.log(`   - Files in directory: ${files.length}`);
      files.forEach(file => {
        const filePath = path.join(uploadsPath, file);
        const stats = fs.statSync(filePath);
        console.log(`     • ${file} (${Math.round(stats.size / 1024)} KB)`);
      });
    } else {
      console.log(`   - Directory exists: ❌`);
    }
    
  } catch (error) {
    console.error('❌ Error debugging photos:', error);
  }
}

debugPhotos();
