// Helper function to check if current time is within a rule's active period
function isTimeWithinRange(now, startTimeStr, endTimeStr) {
  const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
  const [endHours, endMinutes] = endTimeStr.split(':').map(Number);

  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  const ruleStartMinutes = startHours * 60 + startMinutes;
  const ruleEndMinutes = endHours * 60 + endMinutes;

  // Case: Rule is for the entire day (00:00 to 00:00)
  // Note: If start is 00:00 and end is 00:00, it implies the entire 24-hour period.
  if (ruleStartMinutes === 0 && ruleEndMinutes === 0) {
    return true;
  }

  // Case: Rule has zero duration (e.g., 09:00 to 09:00), should not block.
  if (ruleStartMinutes === ruleEndMinutes) {
    return false;
  }

  if (ruleStartMinutes < ruleEndMinutes) {
    // Normal case: Start time is before end time (e.g., 09:00 - 17:00)
    return currentTimeInMinutes >= ruleStartMinutes && currentTimeInMinutes < ruleEndMinutes;
  } else {
    // Overnight case: End time is before start time (e.g., 22:00 - 02:00)
    return currentTimeInMinutes >= ruleStartMinutes || currentTimeInMinutes < ruleEndMinutes;
  }
}

// Main function to update declarativeNetRequest rules based on current time and stored rules
async function updateBlockingRules() {
  const { rules = [] } = await chrome.storage.sync.get('rules');
  const now = new Date();

  const rulesToApply = rules.filter(rule => {
    if (!rule || typeof rule.id !== 'string' || typeof rule.url !== 'string' ||
      typeof rule.start !== 'string' || typeof rule.end !== 'string') {
      console.warn('Skipping malformed rule (structure): ', rule);
      return false;
    }
    // Validate time format "HH:MM"
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timePattern.test(rule.start) || !timePattern.test(rule.end)) {
      console.warn('Skipping rule with invalid time format:', rule.start, rule.end, rule);
      return false;
    }
    return isTimeWithinRange(now, rule.start, rule.end);
  });

  const activeDnrRules = rulesToApply.map((storageRule, index) => {
    const dnrRuleId = index + 1; // Generate DNR-compliant ID (integer >= 1)
    return {
      id: dnrRuleId, // Use the new, simple integer ID
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: `*${storageRule.url}*`, // Using wildcard matching
        resourceTypes: [
          "main_frame", "sub_frame", "script", "stylesheet", "image", "object",
          "xmlhttprequest", "ping", "csp_report", "media", "websocket",
          "webtransport", "webbundle", "other"
        ]
      }
    };
  });

  try {
    const existingDnrRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingDnrRules.map(r => r.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: removeRuleIds,
      addRules: activeDnrRules
    });
    // console.log('DeclarativeNetRequest rules updated. Active rules:', activeDnrRules.length, 'Total stored rules:', rules.length);
  } catch (error) {
    console.error("Error updating declarativeNetRequest rules:", error, "Attempted to add:", activeDnrRules);
  }
}

// --- Setup Alarms and Listeners ---

chrome.runtime.onInstalled.addListener((details) => {
  console.log("URL Blocker by Time installed/updated. Reason:", details.reason);
  // Create an alarm that fires every minute to check time-based rules.
  // delayInMinutes: 0 makes it fire soon after setup for immediate effect.
  chrome.alarms.create('timeCheckAlarm', { delayInMinutes: 0, periodInMinutes: 1 });
  updateBlockingRules(); // Initial update
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.rules) {
    console.log("Stored rules changed, re-evaluating and updating declarativeNetRequest rules.");
    updateBlockingRules();
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'timeCheckAlarm') {
    // console.log("Time check alarm triggered. Updating blocking rules."); // Can be verbose
    await updateBlockingRules();
  }
});

// Ensure the alarm is set up when the service worker starts (e.g., after browser restart)
// and perform an initial rule update.
(async () => {
  try {
    const alarm = await chrome.alarms.get('timeCheckAlarm');
    if (!alarm) {
      console.log("Alarm 'timeCheckAlarm' not found on startup, creating it.");
      chrome.alarms.create('timeCheckAlarm', { delayInMinutes: 0, periodInMinutes: 1 });
    }
    // console.log("Service worker started. Initial rule update check."); // Can be verbose
    await updateBlockingRules();
  } catch (error) {
    console.error("Error during service worker startup routine:", error);
  }
})();