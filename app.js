const people = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Ian', 'Jane', 'Kyle', 'Laura', 'Max', 'Nina', 'Oscar', 'Polly', 'Quinn', 'Ruth', 'Steve', 'Tina'];
const drinks = [
    { name: 'Beer', price: 5 },
    { name: 'Wine', price: 7 },
    { name: 'Cocktail', price: 10 },
    { name: 'Soda', price: 2 },
    { name: 'Whiskey', price: 8 },
    { name: 'Tequila', price: 9 },
    { name: 'Rum', price: 6 },
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
    button.textContent = person;
    button.classList.add(`color-${(index % 20) + 1}`);
    button.onclick = () => selectPerson(person);
    document.getElementById('personScreen').appendChild(button);
});

function selectPerson(person) {
    document.getElementById('currentPerson').textContent = person;
    document.getElementById('personScreen').style.display = 'none';
    document.getElementById('drinkScreen').style.display = 'flex';
    updateDrinks();
    updateCurrentTab();
}

function updateDrinks() {
    const drinksContainer = document.getElementById('drinksContainer');
    drinksContainer.innerHTML = '';
    drinks.forEach((drink, index) => {
        const button = document.createElement('button');
        button.innerHTML = `<div class="drink-name">${drink.name}</div><div class="drink-price">€${drink.price}</div>`;
        button.classList.add(`color-${(index % 20) + 1}`);
        button.onclick = () => addDrink(drink.name, drink.price);
        drinksContainer.appendChild(button);
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
}

function updateCurrentTab() {
    const person = document.getElementById('currentPerson').textContent;
    const tabInfo = tabs[person] || { drinks: [], total: 0 };
    document.getElementById('currentTab').textContent = tabInfo.drinks.join(', ') + " | Total: €" + tabInfo.total;
}

function goBack() {
    document.getElementById('drinkScreen').style.display = 'none';
    document.getElementById('personScreen').style.display = 'flex';
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
            break;
        default:
            console.error("Unrecognized action type:", lastAction.type);
            return;
    }
    localStorage.setItem('tabs', JSON.stringify(tabs));
    updateCurrentTab();
}

function settleUp() {
    const person = document.getElementById('currentPerson').textContent;
    if (tabs[person]) {
        tabs[person] = { drinks: [], total: 0 };  // Settles the tab by resetting the person's drinks and total
        localStorage.setItem('tabs', JSON.stringify(tabs));
        actionHistory.push({ type: 'settle', person: person, amount: tabs[person].total }); // Log this action for potential undo functionality
        updateCurrentTab();  // Refresh the tab display
        alert(`${person}'s tab has been settled.`);
    } else {
        alert(`No tab to settle for ${person}.`);
    }
}
