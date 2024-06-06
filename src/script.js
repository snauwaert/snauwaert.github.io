var people = ['Ann', 'Arno', 'Bjorn en Caroline', 'Dave', 'Dirk & Sabine', 'Frank & Petra', 'Joris & Joyce', 'Kris & Sucky', 'Luc & Anja', 'Matthias', 'Nico & Anne', 'Petrus', 'Sam', 'Sven', 'Tom De Backer', 'Tom Nuyts'].sort();

var drinks = [
    { name: 'Aquarius', price: 350 },
    { name: 'Boerke', price: 280 },
    { name: 'Cava', price: 450 },
    { name: 'Cecemel', price: 350 },
    { name: 'Chouffe', price: 420 },
    { name: 'Duvel', price: 450 },
    { name: 'Gemberthee', price: 500 },
    { name: 'Hoegaarden', price: 290 },
    { name: 'IceTea', price: 290 },
    { name: 'Koffie', price: 290 },
    { name: 'Pintje 33cl', price: 300 },
    { name: 'Tripel d\'Anvers', price: 450 },
    { name: 'Water', price: 290 },
    { name: 'Wijn', price: 400 }
].sort(function(a, b) {
    return a.name.localeCompare(b.name);
});

var tabs = JSON.parse(localStorage.getItem('tabs')) || {};
var actionHistory = [];
var settledAmount = 0;

people.forEach(function(person, index) {
    var button = document.createElement('button');
    button.innerHTML = '<div class="person-name">' + person + '</div>';
    button.classList.add('color-' + ((index % 20) + 1));
    
    if (tabs[person] && tabs[person].total > 0) {
        button.classList.add('unsettled-tab');
    }

    button.onclick = function() {
        selectPerson(person);
    };
    document.getElementById('peopleContainer').appendChild(button);
});

document.addEventListener('DOMContentLoaded', function () {
    updateTotalDue();
    updateRestDue();
});

function selectPerson(person) {
    document.getElementById('currentPerson').textContent = person;
    document.getElementById('personScreen').style.display = 'none';
    document.getElementById('drinkScreen').style.display = 'flex';
    updateDrinks();
    updateCurrentTab();
    document.getElementById('backButton').style.display = 'inline-block';
    document.getElementById('settleUpButton').style.display = 'inline-block';
}

function goBack() {
    document.getElementById('drinkScreen').style.display = 'none';
    document.getElementById('personScreen').style.display = 'flex';
    document.getElementById('backButton').style.display = 'none';
    document.getElementById('settleUpButton').style.display = 'none';
}

function updateDrinks() {
    var drinksContainer = document.getElementById('drinksContainer');
    drinksContainer.innerHTML = '';
    drinks.forEach(function(drink, index) {
        var button = document.createElement('button');
        var displayed_price = (drink.price / 100).toFixed(2);
        button.innerHTML = '<div class="drink-name">' + drink.name + '</div><div class="drank prijs">€' + displayed_price + '</div>';
        button.classList.add('color-' + ((index % 20) + 1));
        button.onclick = function() {
            addDrink(drink.name, drink.price);
        };
        drinksContainer.appendChild(button);
    });
}

function updateButtonStyles() {
    var buttons = document.querySelectorAll('#peopleContainer button');
    buttons.forEach(function(button) {
        var personName = button.textContent;
        if (tabs[personName] && tabs[personName].total > 0) {
            button.classList.add('unsettled-tab');
        } else {
            button.classList.remove('unsettled-tab');
        }
    });
}

function addDrink(drink, price) {
    var person = document.getElementById('currentPerson').textContent;
    if (!tabs[person]) {
        tabs[person] = { drinks: [], total: 0 };
    }
    tabs[person].drinks.push(drink);
    tabs[person].total += price;
    localStorage.setItem('tabs', JSON.stringify(tabs));
    actionHistory.push({ type: 'add', person: person, drink: drink, price: price });
    updateCurrentTab();
    updateTotalDue();
    updateRestDue();
    updateButtonStyles();
}

function updateCurrentTab() {
    var person = document.getElementById('currentPerson').textContent;
    var tabInfo = tabs[person] || { drinks: [], total: 0 };
    var drinkCounts = tabInfo.drinks.reduce(function(acc, drink) {
        acc[drink] = (acc[drink] || 0) + 1;
        return acc;
    }, {});
    var drinkDisplay = Object.keys(drinkCounts).map(function(drink) {
        return drink + ' x' + drinkCounts[drink];
    }).join(', ');
    var displayed_price = (tabInfo.total / 100).toFixed(2);
    document.getElementById('currentTab').textContent = drinkDisplay + " | Totaal: €" + displayed_price;
}

function updateTotalDue() {
    var totalDue = Object.values(tabs).reduce(function(acc, tab) {
        return acc + tab.total;
    }, 0) + settledAmount;
    var displayed_price = (totalDue / 100).toFixed(2);
    document.getElementById('totalDue').textContent = 'Totaal: €' + displayed_price;
}

function updateRestDue() {
    var restDue = Object.values(tabs).reduce(function(acc, tab) {
        return acc + tab.total;
    }, 0);
    var displayed_price = (restDue / 100).toFixed(2);
    document.getElementById('restDue').textContent = 'Nog te betalen: €' + displayed_price;
}

function undoLastAction() {
    if (actionHistory.length === 0) {
        alert("No actions to undo.");
        return;
    }
    var lastAction = actionHistory.pop();
    var person = lastAction.person;

    switch (lastAction.type) {
        case 'add':
            var drinkList = tabs[person].drinks;
            if (drinkList.length > 0) {
                drinkList.pop();
                tabs[person].total -= lastAction.price;
            }
            break;
        case 'settle':
            tabs[person].total = lastAction.amount;
            settledAmount -= lastAction.amount;
            tabs[person] = lastAction.list;
            break;
        default:
            console.error("Unrecognized action type:", lastAction.type);
            return;
    }
    localStorage.setItem('tabs', JSON.stringify(tabs));
    updateTotalDue();
    updateCurrentTab();
    updateRestDue();
    updateButtonStyles();
}

function settleUp() {
    var person = document.getElementById('currentPerson').textContent;
    if (tabs[person]) {
        var displayed_price = (tabs[person].total / 100).toFixed(2);
        alert('De rekening van ' + person + ' bedroeg €' + displayed_price + ' en is afgerekend.');
        actionHistory.push({ type: 'settle', person: person, amount: tabs[person].total, list: tabs[person]});
        settledAmount += tabs[person].total;
        tabs[person] = { drinks: [], total: 0 };
        localStorage.setItem('tabs', JSON.stringify(tabs));
        updateCurrentTab();
        updateTotalDue();
        updateRestDue();
        updateButtonStyles();
    } else {
        alert('Geen openstaande rekening voor ' + person);
    }
}

function resetAllTabs() {
    if (confirm("Ben je zeker dat je alle rekeningen wilt resetten. Dit kan niet ongedaan gemaakt worden.")) {
        for (var person in tabs) {
            tabs[person] = { drinks: [], total: 0 };
        }
        localStorage.setItem('tabs', JSON.stringify(tabs));
        actionHistory.length = 0;
        settledAmount = 0;
        updateTotalDue();
        updateRestDue();
        updateButtonStyles();
        if (document.getElementById('drinkScreen').style.display !== 'none') {
            updateCurrentTab();
        }
        alert("Alle rekeningen zijn gereset.");
    }
}

function viewTabDetails() {
    var person = document.getElementById('currentPerson').textContent;
    document.getElementById('modalPersonName').textContent = person;
    updateTabDetails();
    document.getElementById('tabDetailsModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('tabDetailsModal').style.display = 'none';
}

function updateTabDetails() {
    var person = document.getElementById('currentPerson').textContent;
    var tabInfo = tabs[person] || { drinks: [], total: 0 };
    var tabDetailsContainer = document.getElementById('tabDetailsContainer');
    tabDetailsContainer.innerHTML = '';

    tabInfo.drinks.forEach(function(drink, index) {
        var drinkItem = document.createElement('div');
        drinkItem.textContent = drink;
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() {
            deleteDrink(person, index);
        };
        drinkItem.appendChild(deleteButton);
        tabDetailsContainer.appendChild(drinkItem);
    });
}

function deleteDrink(person, drinkIndex) {
    var drinkName = tabs[person].drinks[drinkIndex];
    var drinkPrice = drinks.find(function(drink) {
        return drink.name === drinkName;
    }).price;

    tabs[person].drinks.splice(drinkIndex, 1);
    tabs[person].total -= drinkPrice;

    if (tabs[person].total < 0) {
        tabs[person].total = 0;
    }

    localStorage.setItem('tabs', JSON.stringify(tabs));
    updateCurrentTab();
    updateTotalDue();
    updateRestDue();
    updateButtonStyles();
    updateTabDetails();
}

// Event listener to close the modal when clicking outside of it
window.onclick = function(event) {
    var modal = document.getElementById('tabDetailsModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

