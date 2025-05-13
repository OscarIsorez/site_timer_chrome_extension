// Handles adding, displaying, and deleting rules in the popup

document.addEventListener('DOMContentLoaded', async () => {
    const ruleForm = document.getElementById('ruleForm');
    const rulesList = document.getElementById('rulesList');
    // const startHourSelect = document.getElementById('start-hour'); // Not needed
    // const startMinSelect = document.getElementById('start-min');   // Not needed
    // const endHourSelect = document.getElementById('end-hour');     // Not needed
    // const endMinSelect = document.getElementById('end-min');       // Not needed

    // Function to populate select elements for time (REMOVED)
    // function populateTimeSelects() { ... }

    // populateTimeSelects(); // Call the function to populate time pickers (REMOVED)

    // Load and display rules on popup open
    await displayRules();

    ruleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = document.getElementById('url').value.trim();

        // Get custom time picker values and pad with leading zero if necessary
        const startHour = document.getElementById('start-hour').value.padStart(2, '0');
        const startMin = document.getElementById('start-min').value.padStart(2, '0');
        const endHour = document.getElementById('end-hour').value.padStart(2, '0');
        const endMin = document.getElementById('end-min').value.padStart(2, '0');

        const start = `${startHour}:${startMin}`;
        const end = `${endHour}:${endMin}`;

        // Basic validation for time values (optional, but good practice)
        if (!url || !startHour || !startMin || !endHour || !endMin) {
            console.error("All fields including time must be filled.");
            return; // Or show a user-friendly error
        }
        if (parseInt(startHour) < 0 || parseInt(startHour) > 23 ||
            parseInt(startMin) < 0 || parseInt(startMin) > 59 ||
            parseInt(endHour) < 0 || parseInt(endHour) > 23 ||
            parseInt(endMin) < 0 || parseInt(endMin) > 59) {
            console.error("Invalid time value entered.");
            return; // Or show a user-friendly error
        }

        const { rules = [] } = await chrome.storage.sync.get('rules');
        rules.push({ url, start, end });
        await chrome.storage.sync.set({ rules });
        ruleForm.reset();
        await displayRules();
    });

    async function displayRules() {
        const { rules = [] } = await chrome.storage.sync.get('rules');
        rulesList.innerHTML = '';
        if (rules.length === 0) {
            rulesList.innerHTML = '<li style="color: #888;">Aucune règle définie.</li>';
            return;
        }
        rules.forEach((rule, idx) => {
            const li = document.createElement('li');
            li.className = 'rule-item';
            li.innerHTML = `
        <span class="rule-url">${rule.url}</span>
        <span class="rule-time">${rule.start} - ${rule.end}</span>
      `;
            rulesList.appendChild(li);
        });
        ;
    }
});

// --- DEBUG FUNCTION --- //
// To use: 
// 1. Open the extension popup.
// 2. Open the browser's developer console (usually F12), select the popup's context.
// 3. Type `deleteAllRulesDebug()` in the console and press Enter.
// OR: Uncomment the line below in `DOMContentLoaded` to run it on popup open.
async function deleteAllRulesDebug() {
    await chrome.storage.sync.set({ rules: [] });
    console.warn('DEBUG: All rules have been deleted from storage.');
    // We need to access displayRules, ensure it's available or pass it if needed
    // For simplicity, assuming displayRules is accessible in the global scope of the popup
    // or that this function is defined where displayRules is in scope.
    if (typeof displayRules === 'function') {
        await displayRules();
    } else {
        // If displayRules is not directly accessible, you might need to reload the popup
        // or call it in a way that it can be accessed from the global scope if popup.js is structured differently.
        // For this setup, it should be fine as displayRules is in the same scope or accessible.
        console.warn('displayRules function not found in this context, UI may not update immediately.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const ruleForm = document.getElementById('ruleForm');
    const rulesList = document.getElementById('rulesList');

    // To clear all rules on popup open for debugging, uncomment the next line:
    // await deleteAllRulesDebug();

    // Load and display rules on popup open
    await displayRules();

    ruleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = document.getElementById('url').value.trim();

        // Get custom time picker values and pad with leading zero if necessary
        const startHour = document.getElementById('start-hour').value.padStart(2, '0');
        const startMin = document.getElementById('start-min').value.padStart(2, '0');
        const endHour = document.getElementById('end-hour').value.padStart(2, '0');
        const endMin = document.getElementById('end-min').value.padStart(2, '0');

        const start = `${startHour}:${startMin}`;
        const end = `${endHour}:${endMin}`;

        // Basic validation for time values (optional, but good practice)
        if (!url || !startHour || !startMin || !endHour || !endMin) {
            console.error("All fields including time must be filled.");
            return; // Or show a user-friendly error
        }
        if (parseInt(startHour) < 0 || parseInt(startHour) > 23 ||
            parseInt(startMin) < 0 || parseInt(startMin) > 59 ||
            parseInt(endHour) < 0 || parseInt(endHour) > 23 ||
            parseInt(endMin) < 0 || parseInt(endMin) > 59) {
            console.error("Invalid time value entered.");
            return; // Or show a user-friendly error
        }

        const { rules = [] } = await chrome.storage.sync.get('rules');
        rules.push({ url, start, end });
        await chrome.storage.sync.set({ rules });
        ruleForm.reset();
        await displayRules();
    });

    async function displayRules() {
        const { rules = [] } = await chrome.storage.sync.get('rules');
        rulesList.innerHTML = '';
        if (rules.length === 0) {
            rulesList.innerHTML = '<li style="color: #888;">Aucune règle définie.</li>';
            return;
        }
        rules.forEach((rule, idx) => {
            const li = document.createElement('li');
            li.className = 'rule-item';
            li.innerHTML = `
        <span class="rule-url">${rule.url}</span>
        <span class="rule-time">${rule.start} - ${rule.end}</span>
      `;
            rulesList.appendChild(li);
        });
        ;
    }
});
