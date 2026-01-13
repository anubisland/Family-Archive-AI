import { connectDB, getDB } from './src/config/sqlite-db.js';
import { v4 as uuidv4 } from 'uuid';

const createSamplePhotos = async () => {
  try {
    await connectDB();
    const db = getDB();
    console.log('📷 Creating sample photos...');

    // First, get some person IDs from the database
    const persons = await db.all('SELECT person_id, full_name FROM Persons LIMIT 4');
    
    if (persons.length === 0) {
      console.log('⚠️  No persons found. Please run create-sample-data.js first.');
      return;
    }

    // Sample photos data
    const samplePhotos = [
      {
        photo_id: uuidv4(),
        person_id: persons[0]?.person_id,
        file_path: '/uploads/photos/sample-photo-1.jpg',
        original_filename: 'family_gathering_2023.jpg',
        event_name: 'Family Reunion 2023',
        date_taken: '2023-07-15',
        detected_faces: 1,
        file_size: 2456789,
        width: 1920,
        height: 1080,
        created_at: new Date().toISOString()
      },
      {
        photo_id: uuidv4(),
        person_id: persons[1]?.person_id,
        file_path: '/uploads/photos/sample-photo-2.jpg',
        original_filename: 'graduation_day.jpg',
        event_name: 'Graduation Ceremony',
        date_taken: '2022-06-10',
        detected_faces: 1,
        file_size: 3123456,
        width: 1600,
        height: 1200,
        created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        photo_id: uuidv4(),
        person_id: persons[2]?.person_id,
        file_path: '/uploads/photos/sample-photo-3.jpg',
        original_filename: 'birthday_celebration.jpg',
        event_name: 'Birthday Party',
        date_taken: '2023-03-20',
        detected_faces: 1,
        file_size: 1876543,
        width: 1440,
        height: 960,
        created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        photo_id: uuidv4(),
        person_id: persons[0]?.person_id,
        file_path: '/uploads/photos/sample-photo-4.jpg',
        original_filename: 'wedding_anniversary.jpg',
        event_name: 'Wedding Anniversary',
        date_taken: '2023-09-12',
        detected_faces: 2,
        file_size: 4234567,
        width: 2000,
        height: 1500,
        created_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      },
      {
        photo_id: uuidv4(),
        person_id: null, // Photo not linked to any specific person
        file_path: '/uploads/photos/sample-photo-5.jpg',
        original_filename: 'vacation_landscape.jpg',
        event_name: 'Summer Vacation 2023',
        date_taken: '2023-08-05',
        detected_faces: 0,
        file_size: 3456789,
        width: 1800,
        height: 1200,
        created_at: new Date(Date.now() - 345600000).toISOString() // 4 days ago
      }
    ];

    // Insert sample photos
    for (const photo of samplePhotos) {
      await db.run(`
        INSERT INTO Photos (
          photo_id, person_id, file_path, original_filename, 
          event_name, date_taken, detected_faces, file_size, 
          width, height, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
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
      
      console.log(`✅ Added photo: ${photo.original_filename} (linked to: ${persons.find(p => p.person_id === photo.person_id)?.full_name || 'No one'})`);
    }

    console.log('\n📊 Photo Statistics:');
    const totalPhotos = await db.get('SELECT COUNT(*) as count FROM Photos');
    const photosWithPersons = await db.get('SELECT COUNT(*) as count FROM Photos WHERE person_id IS NOT NULL');
    
    console.log(`   Total photos: ${totalPhotos.count}`);
    console.log(`   Photos with people: ${photosWithPersons.count}`);
    console.log(`   Photos without people: ${totalPhotos.count - photosWithPersons.count}`);

    console.log('\n🎉 Sample photos created successfully!');
    console.log('💡 You can now test the photo upload feature and see these samples in the UI.');
    
  } catch (error) {
    console.error('❌ Error creating sample photos:', error);
  }
};

createSamplePhotos();
