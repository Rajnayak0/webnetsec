// Popup UI Logic for WebNet

document.addEventListener('DOMContentLoaded', () => {
    // Protection Toggles
    const antivirusToggle = document.getElementById('antivirusToggle');
    const botBlockerToggle = document.getElementById('botBlockerToggle');
    const trackerBlockerToggle = document.getElementById('trackerBlockerToggle');

    // Security Scan
    const scanBtn = document.getElementById('scanBtn');
    const scanResults = document.getElementById('scanResults');
    const trustText = document.getElementById('trustText');
    const trustIndicator = document.getElementById('trustIndicator');

    // Traffic List
    const trafficList = document.getElementById('trafficList');

    // --- Load Initial State ---
    chrome.storage.local.get([
        'antivirusEnabled',
        'botBlockerEnabled',
        'trackerBlockerEnabled'
    ], (result) => {
        antivirusToggle.checked = result.antivirusEnabled || false;
        botBlockerToggle.checked = result.botBlockerEnabled || false;
        trackerBlockerToggle.checked = result.trackerBlockerEnabled || false;
    });

    // --- Event Listeners ---

    // Toggle Protection
    antivirusToggle.addEventListener('change', () => {
        chrome.storage.local.set({ antivirusEnabled: antivirusToggle.checked });
    });

    botBlockerToggle.addEventListener('change', () => {
        chrome.storage.local.set({ botBlockerEnabled: botBlockerToggle.checked });
    });

    trackerBlockerToggle.addEventListener('change', () => {
        chrome.storage.local.set({ trackerBlockerEnabled: trackerBlockerToggle.checked });
    });

    // --- Security Scan Logic ---
    scanBtn.addEventListener('click', async () => {
        scanResults.style.display = 'block';
        trustText.innerText = 'Scanning...';
        trustIndicator.className = 'indicator active';

        // Reset Styles
        scanResults.style.background = 'transparent';
        scanResults.style.border = 'none';
        scanResults.innerHTML = `
        <div class="tab-item">
          <span id="trustIndicator" class="indicator active"></span>
          <span id="trustText">Scanning...</span>
        </div>`;

        // Re-reference elements after innerHTML wipe
        const newTrustText = document.getElementById('trustText');
        const newTrustIndicator = document.getElementById('trustIndicator');

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];

            chrome.runtime.sendMessage({ type: 'CHECK_SECURITY', url: activeTab.url }, (results) => {
                setTimeout(() => { // Small delay for UX feel
                    newTrustIndicator.className = 'indicator';
                    scanResults.innerHTML = ''; // Clear previous

                    if (results.isSafe) {
                        // GREEN STATE
                        scanResults.style.background = 'rgba(76, 175, 80, 0.1)';
                        scanResults.style.border = '1px solid #4caf50';
                        scanResults.style.borderRadius = '8px';
                        scanResults.style.padding = '12px';
                        scanResults.style.textAlign = 'center';

                        scanResults.innerHTML = `
                            <div style="font-size: 1.5rem; margin-bottom: 4px;">✅</div>
                            <h3 style="color: #4caf50; margin-bottom: 2px; font-size: 1rem;">SAFE</h3>
                            <div style="color: #66bb6a; font-size: 0.8rem;">No threats found</div>
                        `;
                    } else {
                        // RED STATE
                        scanResults.style.background = 'rgba(255, 77, 77, 0.1)';
                        scanResults.style.border = '1px solid #ef5350';
                        scanResults.style.borderRadius = '8px';
                        scanResults.style.padding = '12px';
                        scanResults.style.textAlign = 'center';

                        scanResults.innerHTML = `
                             <div style="font-size: 1.5rem; margin-bottom: 4px;">⚠️</div>
                             <h3 style="color: #ef5350; margin-bottom: 2px; font-size: 1rem;">RISK DETECTED</h3>
                             <div style="color: #e57373; font-size: 0.8rem;">${results.signals.join(', ')}</div>
                        `;
                    }
                }, 800);
            });
        });
    });


    // --- Traffic Monitoring & Safety Check ---

    // Heuristic Safety Check (Client-side mainly for UI color)
    const checkSafety = (url) => {
        if (!url) return 'neutral';
        if (url.startsWith('chrome://')) return 'neutral';

        let score = 0; // Negative is bad
        const u = new URL(url);

        if (u.protocol === 'http:') score -= 5;
        if (u.hostname.length > 50) score -= 2;
        if (/\d+\.\d+\.\d+\.\d+/.test(u.hostname)) score -= 5; // IP address

        if (score < -3) return 'unsafe';
        return 'safe';
    };

    const updateTrafficUI = (trafficData) => {
        chrome.tabs.query({}, (tabs) => {
            trafficList.innerHTML = '';

            // Map tabs to data and sort
            const tabList = tabs.map(tab => {
                const data = trafficData[tab.id];
                const reqCount = data ? data.requests : 0;
                return { tab, reqCount };
            });

            // Sort: High traffic first
            tabList.sort((a, b) => b.reqCount - a.reqCount);

            if (tabList.length === 0) {
                trafficList.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">No active tabs.</p>';
                return;
            }

            tabList.forEach(item => {
                const { tab, reqCount } = item;
                const safetyClass = checkSafety(tab.url);

                const tabEl = document.createElement('div');
                tabEl.className = `tab-item ${safetyClass}`;

                tabEl.innerHTML = `
                  <div class="indicator ${reqCount > 0 ? 'active' : ''}"></div>
                  <div style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${tab.title || tab.url}
                  </div>
                  <span class="status-badge">${reqCount} reqs</span>
                `;
                trafficList.appendChild(tabEl);
            });
        });
    };

    // Initial traffic load
    chrome.runtime.sendMessage({ type: 'GET_TRAFFIC' }, (response) => {
        if (response) updateTrafficUI(response);
    });

    // Listen for real-time updates
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'TRAFFIC_UPDATE') {
            chrome.runtime.sendMessage({ type: 'GET_TRAFFIC' }, (response) => {
                if (response) updateTrafficUI(response);
            });
        }
    });

});
