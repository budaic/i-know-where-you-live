const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function debugRevampedSearch() {
  console.log('🔍 Starting Revamped Search Debug...\n');

  try {
    // Test subject
    const testSubject = {
      name: "John Doe",
      hardContext: "Software Engineer at Google",
      softContext: "Machine Learning, Python, AI"
    };

    console.log('📋 Test Subject:', testSubject);
    console.log('🚀 Starting revamped search with debug...\n');

    // Start the search
    const response = await axios.post(`${API_BASE_URL}/profiles/create/revamped/debug`, {
      subjects: [testSubject]
    });

    console.log('✅ Search completed!');
    console.log('📊 Response:', {
      profilesCount: response.data.profiles?.length || 0,
      debugDataCount: response.data.debugData?.length || 0
    });

    if (response.data.profiles && response.data.profiles.length > 0) {
      const profile = response.data.profiles[0];
      console.log('\n📋 Profile Details:');
      console.log('- Name:', profile.name);
      console.log('- Sources Count:', profile.sources?.length || 0);
      console.log('- Generated Context Length:', profile.generatedContext?.additionalFindings?.[0]?.length || 0);
      
      if (profile.sources && profile.sources.length > 0) {
        console.log('\n🔗 Sources:');
        profile.sources.forEach((source, index) => {
          console.log(`  ${index + 1}. ${source.url}`);
          console.log(`     Summary: ${source.siteSummary?.substring(0, 100)}...`);
          console.log(`     Confidence: ${source.confidence}`);
          console.log(`     Relevancy Score: ${source.relevancyScore}`);
        });
      }

      if (profile.generatedContext?.additionalFindings?.[0]) {
        console.log('\n📝 Generated Context Preview:');
        const context = profile.generatedContext.additionalFindings[0];
        console.log(context.substring(0, 500) + (context.length > 500 ? '...' : ''));
      }
    }

    if (response.data.debugData && response.data.debugData.length > 0) {
      const debugData = response.data.debugData[0];
      console.log('\n🔍 Debug Data:');
      console.log('- Total Results Collected:', debugData.totalResultsCollected);
      console.log('- Total Results Processed:', debugData.totalResultsProcessed);
      console.log('- Total Results Valid:', debugData.totalResultsValid);
      console.log('- Total Context Points:', debugData.totalContextPoints);
      console.log('- Overall Confidence:', debugData.overallConfidence);
      console.log('- Rounds:', debugData.rounds?.length || 0);
      
      if (debugData.rounds && debugData.rounds.length > 0) {
        debugData.rounds.forEach((round, index) => {
          console.log(`\n  Round ${index + 1}:`);
          console.log(`    - Results Collected: ${round.resultsCollected}`);
          console.log(`    - Results Processed: ${round.resultsProcessed}`);
          console.log(`    - Results Valid: ${round.resultsValid}`);
          console.log(`    - Context Points: ${round.contextPointsGenerated}`);
          console.log(`    - Average Confidence: ${round.averageConfidence}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error during debug:', error.response?.data || error.message);
  }
}

async function testDatabaseRetrieval() {
  console.log('\n🗄️ Testing Database Retrieval...\n');

  try {
    // Get all profiles
    const response = await axios.get(`${API_BASE_URL}/profiles`);
    
    console.log('📊 Database Profiles:');
    console.log('- Total Profiles:', response.data.length);
    
    if (response.data.length > 0) {
      const latestProfile = response.data[0];
      console.log('\n📋 Latest Profile:');
      console.log('- ID:', latestProfile.id);
      console.log('- Name:', latestProfile.name);
      console.log('- Sources Count:', latestProfile.sources?.length || 0);
      console.log('- Created At:', latestProfile.createdAt);
      
      if (latestProfile.sources && latestProfile.sources.length > 0) {
        console.log('\n🔗 Database Sources:');
        latestProfile.sources.forEach((source, index) => {
          console.log(`  ${index + 1}. ${source.url}`);
          console.log(`     ID: ${source.id}`);
          console.log(`     Profile ID: ${source.profileId}`);
          console.log(`     Summary: ${source.siteSummary?.substring(0, 100)}...`);
          console.log(`     Confidence: ${source.confidence}`);
          console.log(`     Relevancy Score: ${source.relevancyScore}`);
          console.log(`     Created At: ${source.createdAt}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error retrieving from database:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Starting Comprehensive Debug Session...\n');
  
  await debugRevampedSearch();
  await testDatabaseRetrieval();
  
  console.log('\n✅ Debug session completed!');
}

main().catch(console.error);
