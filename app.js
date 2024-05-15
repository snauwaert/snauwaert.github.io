const people = ['Sven', 'Kris & Sucky', 'Luc & Anja', 'Dirk & Sabine', 'Tom Nuyts', 'Tom De Backer', 'Ann', 'Nico & Anne', 'Arno', 'Petrus', 'Matthias', 'Bjorn', 'Dave', 'Frank & Petra', 'Joris & Joyce', 'Sam', 'Extra1', 'Extra2'];
const drinks = [
    { name: 'Boerke', price: 5 },
    { name: 'Pintje', price: 7 },
    { name: 'Wijn', price: 10 },
    { name: 'Hoegaarden', price: 2 },
    { name: 'Tripel dAnvers', price: 8 },
    { name: 'Ice Tea', price: 9 },
    { name: 'Cola', price: 6 },
    { name: 'Vodka', price: 7 },
    { name: 'Gin', price: 8 },
    { name: 'Champagne', price: 11 },
    { name: 'Espresso', price: 3 },
    { name: 'Iced Tea', price: 3 },
    { name: 'Lemonade', price: 3 },
    { name: 'Juice', price: 4 },
    { name: 'Milkshake', price: 5 },
    { name: 'Smoothie', price: 5 },
    { name: 'Water', price: 1 },
    { name: 'Cider', price: 7 },
    { name: 'Sangria', price: 8 },
    { name: 'Mojito', price: 9 }
];
const tabs = JSON.parse(localStorage.getItem('tabs')) || {};
const actionHistory = [];

people.forEach((person, index) => {
    const button = document.createElement('button');
    button.innerHTML = `<div class="person-name">${person}</div>`;
    button.classList.add(`color-${(index % 20) + 1}`);
    
    // Check if the person has an unsettled tab and add a class if so
    if (tabs[person] && tabs[person].total > 0) {
        button.classList.add('unsettled-tab');
    }

    button.onclick = () => selectPerson(person);
    document.getElementById('peopleContainer').appendChild(button);
});


// When initializing the tabs from localStorage or updating them, call updateTotalDue
document.addEventListener('DOMContentLoaded', function () {
    // Initial call to display the total due when the page loads
    updateTotalDue();
});

function selectPerson(person) {
    document.getElementById('currentPerson').textContent = person;
    document.getElementById('personScreen').style.display = 'none';
    document.getElementById('drinkScreen').style.display = 'flex';
    updateDrinks();
    updateCurrentTab();
    // Show the buttons when drinkScreen is active
    document.getElementById('backButton').style.display = 'inline-block';
    document.getElementById('settleUpButton').style.display = 'inline-block';
}

function goBack() {
    document.getElementById('drinkScreen').style.display = 'none';
    document.getElementById('personScreen').style.display = 'flex';
    // Hide the buttons when personScreen is active
    document.getElementById('backButton').style.display = 'none';
    document.getElementById('settleUpButton').style.display = 'none';
}


function updateDrinks() {
    const drinksContainer = document.getElementById('drinksContainer');
    drinksContainer.innerHTML = '';
    drinks.forEach((drink, index) => {
        const button = document.createElement('button');
        button.innerHTML = `<div class="drink-name">${drink.name}</div><div class="drank prijs">€${drink.price}</div>`;
        button.classList.add(`color-${(index % 20) + 1}`);
        button.onclick = () => addDrink(drink.name, drink.price);
        drinksContainer.appendChild(button);
    });
}

function updateButtonStyles() {
    const buttons = document.querySelectorAll('#peopleContainer button');
    buttons.forEach(button => {
        const personName = button.textContent;
        if (tabs[personName] && tabs[personName].total > 0) {
            button.classList.add('unsettled-tab');
        } else {
            button.classList.remove('unsettled-tab');
        }
    });
}

function addDrink(drink, price) {
    const person = document.getElementById('currentPerson').textContent;
    if (!tabs[person]) {
        tabs[person] = { drinks: [], total: 0 };
    }
    tabs[person].drinks.push(drink);
    tabs[person].total += price;
    localStorage.setItem('tabs', JSON.stringify(tabs));
    actionHistory.push({ type: 'add', person: person, drink: drink, price: price });
    updateCurrentTab();
    updateTotalDue();
    updateButtonStyles();  // Update button styles to reflect changes
}



function updateCurrentTab() {
    const person = document.getElementById('currentPerson').textContent;
    const tabInfo = tabs[person] || { drinks: [], total: 0 };

    // Create an object to count the drinks
    const drinkCounts = tabInfo.drinks.reduce((acc, drink) => {
        acc[drink] = (acc[drink] || 0) + 1;
        return acc;
    }, {});

    // Format the display of each drink with its count
    const drinkDisplay = Object.entries(drinkCounts).map(([drink, count]) => {
        return `${drink} x${count}`;
    }).join(', ');

    document.getElementById('currentTab').textContent = drinkDisplay + " | Totaal: €" + tabInfo.total;
}


function goBack() {
    document.getElementById('drinkScreen').style.display = 'none';
    document.getElementById('personScreen').style.display = 'flex';
    // Hide the buttons when personScreen is active
    document.getElementById('backButton').style.display = 'none';
    document.getElementById('settleUpButton').style.display = 'none';
}

function updateTotalDue() {
    const totalDue = Object.values(tabs).reduce((acc, tab) => acc + tab.total, 0);
    document.getElementById('totalDue').textContent = `Totaal bedrag: €${totalDue}`;
}

function undoLastAction() {
    if (actionHistory.length === 0) {
        alert("No actions to undo.");
        return;
    }
    const lastAction = actionHistory.pop();
    const person = lastAction.person;

    switch (lastAction.type) {
        case 'add':
            const drinkList = tabs[person].drinks;
            if (drinkList.length > 0) {
                drinkList.pop();  // Remove last added drink
                tabs[person].total -= lastAction.price;  // Subtract the price
            }
            break;
        case 'settle':
            // Assuming we saved the settled amount in actionHistory
            tabs[person].total = lastAction.amount;  // Restore the settled amount
            tabs[person] = lastAction.list            
            break;
        default:
            console.error("Unrecognized action type:", lastAction.type);
            return;
    }
    localStorage.setItem('tabs', JSON.stringify(tabs));
    updateTotalDue();
    updateCurrentTab();
    updateButtonStyles();
}



function settleUp() {
    const person = document.getElementById('currentPerson').textContent;
    if (tabs[person]) {
        alert(`De rekening van ${person} bedroeg €${tabs[person].total} en is afgerekend.`);
        actionHistory.push({ type: 'settle', person: person, amount: tabs[person].total, list: tabs[person]});
        tabs[person] = { drinks: [], total: 0 };  // Reset the person's tab
        localStorage.setItem('tabs', JSON.stringify(tabs));
        
        updateCurrentTab();
        updateTotalDue();
        updateButtonStyles()
    } else {
        alert(`Geen openstaande rekening voor ${person}.`);
    }
}



function resetAllTabs() {
    if (confirm("Ben je zeker dat je alle rekeningen wilt resetten. Dit kan niet ongedaan gemaakt worden.")) {
        // Clear the tabs object
        for (let person in tabs) {
            tabs[person] = { drinks: [], total: 0 };
        }
        // Update local storage
        localStorage.setItem('tabs', JSON.stringify(tabs));
        // Clear any action history
        actionHistory.length = 0;
        // Update UI elements
        updateTotalDue();
        updateButtonStyles();
        if (document.getElementById('drinkScreen').style.display !== 'none') {
            updateCurrentTab();  // Only update if the drink screen is visible
        }
        alert("Alle rekeningen zijn gereset.");
    }
}

