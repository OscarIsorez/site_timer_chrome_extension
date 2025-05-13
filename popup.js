// Handles adding, displaying, and deleting rules in the popup

document.addEventListener('DOMContentLoaded', async () => {
    const ruleForm = document.getElementById('ruleForm');
    const rulesList = document.getElementById('rulesList');
    const addRuleButton = document.getElementById('addRuleButton'); // Get the button by its new ID

    await displayRules();

    ruleForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Start animation
        addRuleButton.classList.add('animating');
        addRuleButton.disabled = true;

        const urlInput = document.getElementById('url');
        const startHourInput = document.getElementById('start-hour');
        const startMinInput = document.getElementById('start-min');
        const endHourInput = document.getElementById('end-hour');
        const endMinInput = document.getElementById('end-min');

        const url = urlInput.value.trim();
        const startHourValue = startHourInput.value;
        const startMinValue = startMinInput.value;
        const endHourValue = endHourInput.value;
        const endMinValue = endMinInput.value;

        // Basic validation for empty fields
        if (!url || !startHourValue || !startMinValue || !endHourValue || !endMinValue) {
            // console.warn('All fields are required.'); // Optional: for debugging
            // alert('Please fill in all fields.'); // Optional: user feedback
            addRuleButton.classList.remove('animating'); // Revert button
            addRuleButton.disabled = false;
            return;
        }

        const startHour = startHourValue.padStart(2, '0');
        const startMin = startMinValue.padStart(2, '0');
        const endHour = endHourValue.padStart(2, '0');
        const endMin = endMinValue.padStart(2, '0');

        const start = `${startHour}:${startMin}`;
        const end = `${endHour}:${endMin}`;

        // Detailed time validation (ensure numbers are within valid ranges)
        if (parseInt(startHour) < 0 || parseInt(startHour) > 23 ||
            parseInt(startMin) < 0 || parseInt(startMin) > 59 ||
            parseInt(endHour) < 0 || parseInt(endHour) > 23 ||
            parseInt(endMin) < 0 || parseInt(endMin) > 59) {
            // console.warn('Invalid time value entered.'); // Optional: for debugging
            // alert('Invalid time range. Please check HH (0-23) and MM (0-59).'); // Optional: user feedback
            addRuleButton.classList.remove('animating'); // Revert button
            addRuleButton.disabled = false;
            return;
        }

        const newRule = { url, start, end, id: Date.now().toString() }; // Added unique ID

        try {
            const data = await chrome.storage.sync.get('rules');
            const rules = data.rules || [];
            rules.push(newRule);
            await chrome.storage.sync.set({ rules });

            ruleForm.reset();
            await displayRules();

            // Animation complete - revert button after a delay
            // The delay should be longer than the CSS animation/transition duration
            setTimeout(() => {
                addRuleButton.classList.remove('animating');
                addRuleButton.disabled = false;
            }, 800); // e.g., 400ms for button shape + 200ms for icon fade + buffer
        } catch (error) {
            console.error("Error saving rule:", error);
            // alert('Failed to save rule. See console for details.'); // Optional: user feedback
            addRuleButton.classList.remove('animating'); // Revert button on error
            addRuleButton.disabled = false;
        }
    });

    async function displayRules() {
        rulesList.innerHTML = ''; // Clear existing rules
        try {
            const data = await chrome.storage.sync.get('rules');
            const rules = data.rules || [];
            rules.forEach(rule => {
                const li = document.createElement('li');
                li.className = 'rule-item'; // Assuming you have styles for .rule-item

                const urlSpan = document.createElement('span');
                urlSpan.className = 'rule-url';
                urlSpan.textContent = rule.url;

                const timeSpan = document.createElement('span');
                timeSpan.className = 'rule-time';
                timeSpan.textContent = ` (${rule.start} - ${rule.end})`;

                li.appendChild(urlSpan);
                li.appendChild(timeSpan);
                rulesList.appendChild(li);
            });
        } catch (error) {
            console.error("Error displaying rules:", error);
        }
    }
    // Ensure deleteAllRulesDebug is defined if called, or handle its definition
    // The second DOMContentLoaded listener from the original file is not included here
    // as its content is minimal and functionality is covered/better placed in this primary listener.
});

