# WebNetSec - Browser Security & Visibility Extension

WebNetSec is a lightweight, privacy-focused browser extension designed to give you real-time visibility into your browser's traffic and provide essential security protections against bots, trackers, and malicious sites.


<img width="433" height="745" alt="image" src="https://github.com/user-attachments/assets/e3c3b03a-61f4-4c2c-b1e8-963c4798f9c9" />


## 🛡️ Key Features

### 1. **Protection Suite**
Toggle these protections on or off individually based on your needs:
*   **Anti-Virus**: vivid blocking of domains associated with malware, scams, and phishing attempts using heuristic pattern matching.
*   **Bot Blocker**: Prevents known bots, spiders, and scrapers from accessing your browsing session.
*   **Tracker Blocker**: Stops analytics scripts, tracking pixels, and telemetry data collection to protect your privacy.

### 2. **Deep Security Scan**
*   **Instant Analysis**: Perform a quick security check on your current active tab.
*   **Visual Feedback**:
    *   **Safe (Green)**: No immediate threats detected.
    *   **Risk Detected (Red)**: Flags insecure protocols (HTTP), suspicious IP-based hostnames, or known malicious keywords.

### 3. **Active Traffic Monitoring**
*   **Real-Time List**: See exactly which tabs are generating the most network traffic.
*   **Sorted View**: Tabs are automatically sorted by request count (High -> Low).
*   **Safety Indicators**:
    *   **🔴 Red Indicator**: Potentially unsafe or high-risk connection.
    *   **🟢 Green Indicator**: Secure connection.

---

## 🚀 How to Install

Since this is a developer extension, you can install it directly into Chrome, Edge, or Brave without using a web store.

1.  **Download/Clone** this repository to a folder on your computer.
2.  Open your browser and navigate to the Extensions page:
    *   **Chrome**: `chrome://extensions`
    *   **Edge**: `edge://extensions`
    *   **Brave**: `brave://extensions`
3.  **Enable Developer Mode**: Look for a toggle switch (usually in the top right corner) and turn it **ON**.
4.  **Load Unpacked**:
    *   Click the **"Load unpacked"** button that appears.
    *   Select the folder where you saved these files (the folder containing `manifest.json`).
5.  **Done!** The WebNetSec icon will appear in your toolbar.

## 📖 How to Use

1.  Click the **WebNetSec Icon** in your browser toolbar to open the popup.
2.  **Enable Protection**: Switch on the toggles for Anti-Virus, Bot Blocker, or Tracker Blocker.
3.  **Scan a Page**: Navigate to any website and click **"Start Deep Scan"** to check its reputation.
4.  **Monitor Traffic**: Scroll down to the "Active Traffic Monitoring" section to see which of your open tabs are active.

---

## 🔒 Privacy

WebNetSec operates entirely locally on your device.
*   No browsing history is sent to external servers.
*   Traffic analysis happens within your browser.

