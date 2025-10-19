const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function quickTest1() {
  console.log('🧪 Quick Test 1: Simple Revamped Search...\n');

  try {
    const testSubject = {
      name: "Jane Smith",
      hardContext: "Data Scientist at Microsoft",
      softContext: "Machine Learning, Python"
    };

    console.log('📋 Test Subject:', testSubject);

    const response = await axios.post(`${API_BASE_URL}/profiles/create/revamped`, {
      subjects: [testSubject]
    });

    console.log('✅ Test 1 Results:');
    console.log('- Profiles Created:', response.data.profiles?.length || 0);
    
    if (response.data.profiles && response.data.profiles.length > 0) {
      const profile = response.data.profiles[0];
      console.log('- Sources Found:', profile.sources?.length || 0);
      console.log('- Generated Context Length:', profile.generatedContext?.additionalFindings?.[0]?.length || 0);
      
      if (profile.sources && profile.sources.length > 0) {
        console.log('- First Source:', profile.sources[0].url);
        console.log('- First Source Confidence:', profile.sources[0].confidence);
      }
    }

  } catch (error) {
    console.error('❌ Test 1 Error:', error.response?.data?.error || error.message);
  }
}

async function quickTest2() {
  console.log('\n🧪 Quick Test 2: Database Retrieval...\n');

  try {
    const response = await axios.get(`${API_BASE_URL}/profiles`);
    
    console.log('✅ Test 2 Results:');
    console.log('- Total Profiles in DB:', response.data.length);
    
    if (response.data.length > 0) {
      const latestProfile = response.data[0];
      console.log('- Latest Profile Name:', latestProfile.name);
      console.log('- Latest Profile Sources:', latestProfile.sources?.length || 0);
      console.log('- Latest Profile Created:', latestProfile.createdAt);
      
      if (latestProfile.sources && latestProfile.sources.length > 0) {
        console.log('- First DB Source:', latestProfile.sources[0].url);
        console.log('- First DB Source ID:', latestProfile.sources[0].id);
      }
    }

  } catch (error) {
    console.error('❌ Test 2 Error:', error.response?.data?.error || error.message);
  }
}

async function main() {
  console.log('🚀 Quick Debug Tests (2 tests only)...\n');
  
  await quickTest1();
  await quickTest2();
  
  console.log('\n✅ Quick debug completed!');
}

main().catch(console.error);
