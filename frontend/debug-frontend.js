// Frontend Debug Script - Run this in browser console

function debugFrontendData() {
  console.log('🔍 Frontend Debug - Checking Data Flow...\n');

  // Check if we can access the React app data
  const appElement = document.querySelector('#root');
  if (!appElement) {
    console.error('❌ React app not found');
    return;
  }

  console.log('✅ React app found');

  // Check for profile data in localStorage or sessionStorage
  const sessionId = localStorage.getItem('currentSearchSessionId');
  if (sessionId) {
    console.log('📋 Current Session ID:', sessionId);
  }

  // Check for any stored profile data
  const storedProfiles = localStorage.getItem('profiles');
  if (storedProfiles) {
    try {
      const profiles = JSON.parse(storedProfiles);
      console.log('📊 Stored Profiles:', profiles.length);
      if (profiles.length > 0) {
        const latestProfile = profiles[0];
        console.log('📋 Latest Profile:');
        console.log('- Name:', latestProfile.name);
        console.log('- Sources Count:', latestProfile.sources?.length || 0);
        console.log('- Generated Context Length:', latestProfile.generatedContext?.additionalFindings?.[0]?.length || 0);
        
        if (latestProfile.sources && latestProfile.sources.length > 0) {
          console.log('\n🔗 Frontend Sources:');
          latestProfile.sources.forEach((source, index) => {
            console.log(`  ${index + 1}. ${source.url}`);
            console.log(`     Summary: ${source.siteSummary?.substring(0, 100)}...`);
            console.log(`     Confidence: ${source.confidence}`);
          });
        }
      }
    } catch (error) {
      console.error('❌ Error parsing stored profiles:', error);
    }
  }

  // Check for search logs
  const searchLogs = localStorage.getItem('searchLogs');
  if (searchLogs) {
    try {
      const logs = JSON.parse(searchLogs);
      console.log('📋 Search Logs:', logs.length);
      logs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.phase}: ${log.resultsFound} results, ${log.validatedResults?.length || 0} validated`);
      });
    } catch (error) {
      console.error('❌ Error parsing search logs:', error);
    }
  }

  // Check for debug data
  const debugData = localStorage.getItem('debugData');
  if (debugData) {
    try {
      const debug = JSON.parse(debugData);
      console.log('🔍 Debug Data:');
      console.log('- Total Results:', debug.totalResultsValid);
      console.log('- Context Points:', debug.totalContextPoints);
      console.log('- Rounds:', debug.rounds?.length || 0);
    } catch (error) {
      console.error('❌ Error parsing debug data:', error);
    }
  }
}

function checkGeneratedContextDisplay() {
  console.log('\n📝 Checking Generated Context Display...\n');

  // Look for generated context elements
  const contextElements = document.querySelectorAll('[class*="context"], [class*="generated"]');
  console.log('🔍 Found context elements:', contextElements.length);

  contextElements.forEach((element, index) => {
    console.log(`  ${index + 1}. Element:`, element.tagName, element.className);
    console.log(`     Text length: ${element.textContent?.length || 0}`);
    console.log(`     Text preview: ${element.textContent?.substring(0, 200)}...`);
  });

  // Check for any truncated text
  const truncatedElements = document.querySelectorAll('*');
  let foundTruncation = false;
  
  truncatedElements.forEach(element => {
    if (element.textContent && element.textContent.includes('...')) {
      console.log('⚠️ Found truncated text:', element.textContent.substring(0, 100));
      foundTruncation = true;
    }
  });

  if (!foundTruncation) {
    console.log('✅ No truncated text found');
  }
}

function checkSearchLogsDisplay() {
  console.log('\n📋 Checking Search Logs Display...\n');

  // Look for search log elements
  const logElements = document.querySelectorAll('[class*="log"], [class*="search"]');
  console.log('🔍 Found log elements:', logElements.length);

  logElements.forEach((element, index) => {
    console.log(`  ${index + 1}. Element:`, element.tagName, element.className);
    console.log(`     Text: ${element.textContent?.substring(0, 200)}...`);
  });

  // Check for phase elements
  const phaseElements = document.querySelectorAll('[class*="phase"], [class*="round"]');
  console.log('🔍 Found phase elements:', phaseElements.length);

  phaseElements.forEach((element, index) => {
    console.log(`  ${index + 1}. Phase Element:`, element.textContent?.substring(0, 100));
  });
}

function main() {
  console.log('🚀 Starting Frontend Debug...\n');
  
  debugFrontendData();
  checkGeneratedContextDisplay();
  checkSearchLogsDisplay();
  
  console.log('\n✅ Frontend debug completed!');
}

// Run the debug
main();
