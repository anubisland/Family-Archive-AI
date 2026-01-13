import { connectDB, getDB } from './src/config/sqlite-db.js';

async function updatePhotoPaths() {
  try {
    await connectDB();
    const db = getDB();
    
    console.log('Updating photo file paths...');
    
    // Get all photos with absolute paths
    const photos = await db.all('SELECT photo_id, file_path FROM Photos WHERE file_path NOT LIKE \'/uploads/%\'');
    console.log(`Found ${photos.length} photos to update`);
    
    for (const photo of photos) {
      try {
        // Extract filename from absolute path
        const filename = photo.file_path.split(/[/\\]/).pop();
        const relativePath = `/uploads/photos/${filename}`;
        
        // Update the record
        const result = await db.run('UPDATE Photos SET file_path = ? WHERE photo_id = ?', [relativePath, photo.photo_id]);
        
        if (result.changes > 0) {
          console.log(`✅ Updated: ${filename}`);
        } else {
          console.log(`❌ Failed to update: ${filename}`);
        }
      } catch (error) {
        console.error(`Error updating photo ${photo.photo_id}:`, error);
      }
    }
    
    // Verify the update
    const updatedPhotos = await db.all('SELECT photo_id, file_path, original_filename FROM Photos');
    console.log('\n📊 Current photos in database:');
    updatedPhotos.forEach(photo => {
      console.log(`- ${photo.original_filename}: ${photo.file_path}`);
    });
    
    console.log('\n🎉 Photo path update complete!');
    
  } catch (error) {
    console.error('❌ Error updating photo paths:', error);
  }
}

updatePhotoPaths();
