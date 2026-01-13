import fetch from 'node-fetch';

const testAPI = async () => {
  try {
    console.log('🧪 Testing Family Archive AI API...');
    
    // Test health endpoint
    console.log('📋 Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);
    
    // Test get all persons
    console.log('\n👥 Testing persons endpoint...');
    const personsResponse = await fetch('http://localhost:3001/api/persons');
    const personsData = await personsResponse.json();
    console.log('✅ Persons found:', personsData.data?.length || 0);
    
    if (personsData.data?.length > 0) {
      console.log('\n📄 Sample person data:');
      const firstPerson = personsData.data[0];
      console.log(`   Name: ${firstPerson.full_name}`);
      console.log(`   Gender: ${firstPerson.gender}`);
      console.log(`   Birth Date: ${firstPerson.birth_date}`);
      
      // Test search
      console.log('\n🔍 Testing search...');
      const searchResponse = await fetch(`http://localhost:3001/api/persons/search?q=أحمد`);
      const searchData = await searchResponse.json();
      console.log('✅ Search results:', searchData.data?.length || 0);
    }
    
    console.log('\n🎉 API test completed successfully!');
    console.log('🌐 Backend is ready for frontend connection');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('💡 Make sure the backend server is running on port 3001');
  }
};

testAPI();
