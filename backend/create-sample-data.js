import { connectDB, getDB } from './src/config/sqlite-db.js';

const sampleData = [
  {
    full_name: 'أحمد محمد العلي',
    gender: 'male',
    birth_date: '1985-03-15',
    biography: 'مهندس برمجيات ومؤرخ العائلة. يعمل في مجال التقنية منذ أكثر من 15 عامًا.'
  },
  {
    full_name: 'فاطمة أحمد العلي',
    gender: 'female', 
    birth_date: '1987-07-22',
    biography: 'طبيبة أطفال في مستشفى الملك فيصل. متخصصة في طب الأطفال حديثي الولادة.'
  },
  {
    full_name: 'عبدالله أحمد العلي',
    gender: 'male',
    birth_date: '2015-12-10',
    biography: 'طالب في المرحلة الابتدائية. يحب الرسم والقراءة.'
  },
  {
    full_name: 'Sara Ahmed Al-Ali',
    gender: 'female',
    birth_date: '2018-05-18',
    biography: 'Pre-school student who loves playing with toys and learning colors.'
  }
];

const createSampleData = async () => {
  try {
    console.log('🗄️ Connecting to database...');
    await connectDB();
    const db = getDB();
    
    console.log('👥 Creating sample family members...');
    
    for (const person of sampleData) {
      const personId = crypto.randomUUID();
      
      await db.run(`
        INSERT INTO Persons (person_id, full_name, gender, birth_date, biography)
        VALUES (?, ?, ?, ?, ?)
      `, [personId, person.full_name, person.gender, person.birth_date, person.biography]);
      
      console.log(`✅ Created: ${person.full_name}`);
      
      // Create a sample event for each person
      const eventId = crypto.randomUUID();
      await db.run(`
        INSERT INTO Events (event_id, person_id, event_type, event_date, description)
        VALUES (?, ?, ?, ?, ?)
      `, [eventId, personId, 'birth', person.birth_date, `Birth of ${person.full_name}`]);
    }
    
    // Create family relationships
    console.log('👨‍👩‍👧‍👦 Creating family relationships...');
    const persons = await db.all('SELECT * FROM Persons ORDER BY birth_date ASC');
    
    if (persons.length >= 4) {
      const father = persons[0]; // أحمد
      const mother = persons[1]; // فاطمة
      const child1 = persons[2]; // عبدالله
      const child2 = persons[3]; // Sara
      
      // Father-Mother relationship
      await db.run(`
        INSERT INTO Family_Relationships (relation_id, person_id, relative_id, relation_type)
        VALUES (?, ?, ?, ?)
      `, [crypto.randomUUID(), father.person_id, mother.person_id, 'spouse']);
      
      await db.run(`
        INSERT INTO Family_Relationships (relation_id, person_id, relative_id, relation_type)
        VALUES (?, ?, ?, ?)
      `, [crypto.randomUUID(), mother.person_id, father.person_id, 'spouse']);
      
      // Parent-Child relationships
      for (const child of [child1, child2]) {
        await db.run(`
          INSERT INTO Family_Relationships (relation_id, person_id, relative_id, relation_type)
          VALUES (?, ?, ?, ?)
        `, [crypto.randomUUID(), father.person_id, child.person_id, 'child']);
        
        await db.run(`
          INSERT INTO Family_Relationships (relation_id, person_id, relative_id, relation_type)
          VALUES (?, ?, ?, ?)
        `, [crypto.randomUUID(), mother.person_id, child.person_id, 'child']);
        
        await db.run(`
          INSERT INTO Family_Relationships (relation_id, person_id, relative_id, relation_type)
          VALUES (?, ?, ?, ?)
        `, [crypto.randomUUID(), child.person_id, father.person_id, 'parent']);
        
        await db.run(`
          INSERT INTO Family_Relationships (relation_id, person_id, relative_id, relation_type)
          VALUES (?, ?, ?, ?)
        `, [crypto.randomUUID(), child.person_id, mother.person_id, 'parent']);
      }
      
      // Sibling relationships
      await db.run(`
        INSERT INTO Family_Relationships (relation_id, person_id, relative_id, relation_type)
        VALUES (?, ?, ?, ?)
      `, [crypto.randomUUID(), child1.person_id, child2.person_id, 'sibling']);
      
      await db.run(`
        INSERT INTO Family_Relationships (relation_id, person_id, relative_id, relation_type)
        VALUES (?, ?, ?, ?)
      `, [crypto.randomUUID(), child2.person_id, child1.person_id, 'sibling']);
    }
    
    console.log('🎉 Sample data created successfully!');
    console.log('');
    console.log('📊 Summary:');
    
    const totalPersons = await db.get('SELECT COUNT(*) as count FROM Persons');
    const totalRelationships = await db.get('SELECT COUNT(*) as count FROM Family_Relationships');
    const totalEvents = await db.get('SELECT COUNT(*) as count FROM Events');
    
    console.log(`   👥 Family Members: ${totalPersons.count}`);
    console.log(`   👨‍👩‍👧‍👦 Relationships: ${totalRelationships.count}`);
    console.log(`   📅 Events: ${totalEvents.count}`);
    console.log('');
    console.log('🚀 Ready to test the Family Archive AI!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
};

createSampleData();
