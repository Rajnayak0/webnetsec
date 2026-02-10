// Background script for WebNet
// Handles traffic monitoring and protection logic

let tabTraffic = {};

let settings = {
  antivirusEnabled: false,
  botBlockerEnabled: false,
  trackerBlockerEnabled: false
};

// Load initial protection state
chrome.storage.local.get(['antivirusEnabled', 'botBlockerEnabled', 'trackerBlockerEnabled'], (result) => {
  settings.antivirusEnabled = result.antivirusEnabled || false;
  settings.botBlockerEnabled = result.botBlockerEnabled || false;
  settings.trackerBlockerEnabled = result.trackerBlockerEnabled || false;
  updateProtectionRules();
});

// Watch for storage changes
chrome.storage.onChanged.addListener((changes) => {
  let needsUpdate = false;
  if (changes.antivirusEnabled) {
    settings.antivirusEnabled = changes.antivirusEnabled.newValue;
    needsUpdate = true;
  }
  if (changes.botBlockerEnabled) {
    settings.botBlockerEnabled = changes.botBlockerEnabled.newValue;
    needsUpdate = true;
  }
  if (changes.trackerBlockerEnabled) {
    settings.trackerBlockerEnabled = changes.trackerBlockerEnabled.newValue;
    needsUpdate = true;
  }
  if (needsUpdate) updateProtectionRules();
});

function updateProtectionRules() {
  const addRules = [];
  const removeRuleIds = [1, 2, 3]; // Rule IDs for AV, Bots, Trackers

  if (settings.antivirusEnabled) {
    addRules.push({
      id: 1,
      priority: 1,
      action: { type: "block" },
      condition: { urlFilter: "*scam*|*malware*|*virus*|*phishing*", resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"] }
    });
  }

  if (settings.botBlockerEnabled) {
    addRules.push({
      id: 2,
      priority: 1,
      action: { type: "block" },
      condition: { urlFilter: "*bot*|*spider*|*crawl*|*scraper*", resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"] }
    });
  }

  if (settings.trackerBlockerEnabled) {
    addRules.push({
      id: 3,
      priority: 1,
      action: { type: "block" },
      condition: { urlFilter: "*track*|*analytics*|*telemetry*|*pixel*", resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest", "image"] }
    });
  }

  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: addRules,
    removeRuleIds: removeRuleIds
  });
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const { tabId, url, type } = details;
    if (tabId < 0) return;

    if (!tabTraffic[tabId]) {
      tabTraffic[tabId] = {
        requests: 0,
        resources: []
      };
    }

    tabTraffic[tabId].requests++;
    tabTraffic[tabId].resources.push({ url, type, timestamp: Date.now() });

    if (tabTraffic[tabId].resources.length > 50) {
      tabTraffic[tabId].resources.shift();
    }

    chrome.runtime.sendMessage({
      type: 'TRAFFIC_UPDATE',
      tabId: tabId,
      data: tabTraffic[tabId]
    }).catch(() => { });
  },
  { urls: ["<all_urls>"] }
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_TRAFFIC') {
    sendResponse(tabTraffic);
  } else if (message.type === 'CHECK_SECURITY') {
    // Enhanced security check heuristic
    const url = new URL(message.url);
    const results = {
      isSafe: true,
      signals: []
    };

    if (url.protocol !== 'https:') {
      results.isSafe = false;
      results.signals.push('Insecure Protocol (HTTP)');
    }
    if (url.hostname.length > 40) {
      results.isSafe = false;
      results.signals.push('Extremely Long Domain (Suspicious)');
    }
    if (/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(url.hostname)) {
      results.isSafe = false;
      results.signals.push('IP Address as Hostname');
    }
    if (url.hostname.includes('scam') || url.hostname.includes('free') && url.hostname.includes('gift')) {
      results.isSafe = false;
      results.signals.push('Keyword Flagged as Malicious');
    }

    sendResponse(results);
  }
  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabTraffic[tabId];
});

