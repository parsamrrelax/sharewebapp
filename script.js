let people = [];
let items = [];

function addPerson() {
    const personName = document.getElementById('personName').value;
    if (personName.trim() !== '') {
        people.push(personName);
        updateDisplay();
        document.getElementById('personName').value = '';
    }
}

function addItem() {
    const itemName = document.getElementById('itemName').value;
    const itemPrice = parseFloat(document.getElementById('itemPrice').value);

    if (itemName.trim() !== '' && !isNaN(itemPrice) && itemPrice > 0) {
        items.push({ name: itemName, price: itemPrice, participants: [] });
        updateDisplay();
        document.getElementById('itemName').value = '';
        document.getElementById('itemPrice').value = '';
    }
}

function calculate() {
    for (const item of items) {
        const checkboxes = document.querySelectorAll(`input[name="${item.name}"]:checked`);
        const numParticipants = checkboxes.length;

        if (numParticipants > 0) {
            const pricePerPerson = item.price / numParticipants;

            checkboxes.forEach((checkbox) => {
                const personName = checkbox.value;
                const personIndex = people.indexOf(personName);

                if (personIndex !== -1) {
                    people.splice(personIndex, 1);
                }

                item.participants.push({ name: personName, share: pricePerPerson });
            });
        }
    }

    displayResult();
}

function updateDisplay() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    people.forEach((person) => {
        resultDiv.innerHTML += `<div>${person}</div>`;
    });

    items.forEach((item) => {
        resultDiv.innerHTML += `
            <div class="item-card">
                <div>${item.name}: ${item.price}</div>
                <div class="checkbox-container">
                    ${people.map(person => `
                        <label>
                            <input type="checkbox" name="${item.name}" value="${person}">
                            ${person}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    });
}

function displayResult() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    items.forEach((item) => {
        resultDiv.innerHTML += `<div>${item.name}: ${item.price}</div>`;

        item.participants.forEach((participant) => {
            resultDiv.innerHTML += `<div>${participant.name} owes ${participant.share}</div>`;
        });
    });

    const totalOwes = {};
    items.forEach((item) => {
        item.participants.forEach((participant) => {
            if (!totalOwes[participant.name]) {
                totalOwes[participant.name] = 0;
            }
            totalOwes[participant.name] += participant.share;
        });
    });

    resultDiv.innerHTML += '<div><strong>Total Owes:</strong></div>';
    Object.keys(totalOwes).forEach((person) => {
        resultDiv.innerHTML += `<div>${person}: ${totalOwes[person]}</div>`;
    });

    // Return the results as JSON
    console.log(getResultsAsJson());
    sendToTelegram();
}

function getResultsAsJson() {
    const results = {
        people: people,
        items: items
    };
    return JSON.stringify(results, null, 2);
}

function sendToTelegram() {
    Telegram.WebApp.ready();
    Telegram.WebApp.MainButton.setText('Price Calculate').show().onClick(function () {
        Telegram.WebApp.sendData(getResultsAsJson());
        Telegram.WebApp.close();
    });
}