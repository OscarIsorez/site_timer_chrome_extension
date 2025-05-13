// You will need to add logic here to manage rules for chrome.declarativeNetRequest
// For example, listening to storage changes and updating rules:

chrome.runtime.onInstalled.addListener(() => {
  console.log("URL Blocker by Time installed.");
  // Initialize or update rules here if needed
  updateBlockingRules();
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.rules) {
    console.log("Rules changed, updating declarativeNetRequest rules.");
    updateBlockingRules();
  }
});

async function updateBlockingRules() {
  const { rules } = await chrome.storage.sync.get('rules');
  if (!rules || rules.length === 0) {
    // Remove all existing dynamic rules if no rules are set
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: (await chrome.declarativeNetRequest.getDynamicRules()).map(rule => rule.id) });
    console.log("No rules defined. All dynamic blocking rules cleared.");
    return;
  }

  const newRules = rules.map((rule, index) => {
    // declarativeNetRequest rules require a unique ID
    // We can use the index for simplicity, but a more robust ID generation might be needed
    const ruleId = index + 1; // IDs must be >= 1

    // The declarativeNetRequest API does not directly support time-based conditions within a single rule.
    // You would typically enable/disable rules based on time, or use more complex rule conditions if available.
    // For simplicity, this example will block the URL regardless of time if it's in the list.
    // Time-based logic would need to be handled by adding/removing rules dynamically via alarms.

    return {
      id: ruleId,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: `*${rule.url}*`, // Basic wildcard matching. Adjust as needed.
        resourceTypes: [
          "main_frame", "sub_frame", "script", "stylesheet", "image", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"
        ]
      }
    };
  });

  // Get existing rule IDs to remove them before adding new ones
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map(rule => rule.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeRuleIds,
    addRules: newRules
  });
  console.log("DeclarativeNetRequest rules updated.", newRules);

  // For actual time-based blocking with declarativeNetRequest, you'd need to:
  // 1. Store your time-based rules in chrome.storage.
  // 2. Use chrome.alarms to periodically check the current time.
  // 3. When an alarm fires, check which rules should be active.
  // 4. Update the declarativeNetRequest ruleset by adding/removing rules based on the current time and your stored schedules.
  // This means a rule to block "example.com" from 9 AM to 5 PM would be ADDED at 9 AM and REMOVED at 5 PM.
}

// Call updateBlockingRules on startup as well
updateBlockingRules();