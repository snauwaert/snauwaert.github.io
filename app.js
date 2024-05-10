const people = ['Alice', 'Bob', 'Charlie', 'Diana'];
const tabs = JSON.parse(localStorage.getItem('tabs')) || {};
const actionHistory = []; // To keep track of actions for undo functionality

people.forEach(person => {
    const button = document.createElement('button');
    button.textContent = person;
    button.onclick = () => selectPerson(person);
    document.getElementById('personScreen').appendChild(button);
});

function selectPerson(person) {
    document.getElementById('currentPerson').textContent = person;
    document.getElementById('personScreen').style.display = 'none';
    document.getElementById('drinkScreen').style.display = 'block';
    updateCurrentTab();
}

function addDrink(drink, price) {
    const person = document.getElementById('currentPerson').textContent;
    if (!tabs[person]) {
        tabs[person] = { drinks: [], total: 0 };
    }
    tabs[person].drinks.push(drink);
    tabs[person].total += price;
    localStorage.setItem('tabs', JSON.stringify(tabs));
    actionHistory.push({type: 'add', person: person, drink: drink, price: price});
    updateCurrentTab();
}

function settleUp() {
    const person = document.getElementById('currentPerson').textContent;
    if (tabs[person]) {
        actionHistory.push({type: 'settle', person: person, amount: tabs[person].total});
        tabs[person] = { drinks: [], total: 0 }; // Reset tab
        localStorage.setItem('tabs', JSON.stringify(tabs));
        updateCurrentTab();
        alert(`Total due for ${person} is cleared`);
    }
}

function undoLastAction() {
    const lastAction = actionHistory.pop();
    if (!lastAction) return;

    const {type, person, drink, price, amount} = lastAction;

    switch (type) {
        case 'add':
            const drinks = tabs[person].drinks;
            if (drinks.length > 0) {
                drinks.pop(); // Remove last added drink
                tabs[person].total -= price; // Subtract the price
            }
            break;
        case 'settle':
            tabs[person].total = amount; // Restore the settled amount
            break;
    }
    localStorage.setItem('tabs', JSON.stringify(tabs));
    updateCurrentTab();
}

function updateCurrentTab() {
    const person = document.getElementById('currentPerson').textContent;
    const tabInfo = tabs[person] || { drinks: [], total: 0 };
    document.getElementById('currentTab').textContent = tabInfo.drinks.join(', ') + " | Total: $" + tabInfo.total;
}

function goBack() {
    document.getElementById('drinkScreen').style.display = 'none';
    document.getElementById('personScreen').style.display = 'block';
}
