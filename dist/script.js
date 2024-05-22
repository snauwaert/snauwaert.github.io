"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var people = ['Sven', 'Kris & Sucky', 'Luc & Anja', 'Dirk & Sabine', 'Tom Nuyts', 'Tom De Backer', 'Ann', 'Nico & Anne', 'Arno', 'Petrus', 'Matthias', 'Bjorn en Caroline', 'Dave', 'Frank & Petra', 'Joris & Joyce', 'Sam'].sort();
var drinks = [{
  name: 'Boerke',
  price: 280
},
// prices in cents
{
  name: 'Pintje 33cl',
  price: 300
}, {
  name: 'Hoegaarden',
  price: 290
}, {
  name: 'Tripel d\'Anvers',
  price: 450
}, {
  name: 'Chouffe',
  price: 420
}, {
  name: 'Duvel',
  price: 450
}, {
  name: 'Cava',
  price: 450
}, {
  name: 'IceTea',
  price: 290
}, {
  name: 'Water',
  price: 290
}, {
  name: 'Koffie',
  price: 290
}, {
  name: 'Aquarius',
  price: 350
}, {
  name: 'Cecemel',
  price: 350
}, {
  name: 'Wijn',
  price: 400
}, {
  name: 'Gemberthee',
  price: 500
}].sort(function (a, b) {
  return a.name.localeCompare(b.name);
});
var tabs = JSON.parse(localStorage.getItem('tabs')) || {};
var actionHistory = [];
var settledAmount = 0;
people.forEach(function (person, index) {
  var button = document.createElement('button');
  button.innerHTML = "<div class=\"person-name\">".concat(person, "</div>");
  button.classList.add("color-".concat(index % 20 + 1));

  // Check if the person has an unsettled tab and add a class if so
  if (tabs[person] && tabs[person].total > 0) {
    button.classList.add('unsettled-tab');
  }
  button.onclick = function () {
    return selectPerson(person);
  };
  document.getElementById('peopleContainer').appendChild(button);
});

// When initializing the tabs from localStorage or updating them, call updateTotalDue
document.addEventListener('DOMContentLoaded', function () {
  // Initial call to display the total due when the page loads
  updateTotalDue();
  updateRestDue();
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
  var drinksContainer = document.getElementById('drinksContainer');
  drinksContainer.innerHTML = '';
  drinks.forEach(function (drink, index) {
    var button = document.createElement('button');
    var displayed_price = (drink.price / 100).toFixed(2);
    button.innerHTML = "<div class=\"drink-name\">".concat(drink.name, "</div><div class=\"drank prijs\">\u20AC").concat(displayed_price, "</div>");
    button.classList.add("color-".concat(index % 20 + 1));
    button.onclick = function () {
      return addDrink(drink.name, drink.price);
    };
    drinksContainer.appendChild(button);
  });
}
function updateButtonStyles() {
  var buttons = document.querySelectorAll('#peopleContainer button');
  buttons.forEach(function (button) {
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
    tabs[person] = {
      drinks: [],
      total: 0
    };
  }
  tabs[person].drinks.push(drink);
  tabs[person].total += price;
  localStorage.setItem('tabs', JSON.stringify(tabs));
  actionHistory.push({
    type: 'add',
    person: person,
    drink: drink,
    price: price
  });
  updateCurrentTab();
  updateTotalDue();
  updateRestDue();
  updateButtonStyles(); // Update button styles to reflect changes
}
function updateCurrentTab() {
  var person = document.getElementById('currentPerson').textContent;
  var tabInfo = tabs[person] || {
    drinks: [],
    total: 0
  };

  // Create an object to count the drinks
  var drinkCounts = tabInfo.drinks.reduce(function (acc, drink) {
    acc[drink] = (acc[drink] || 0) + 1;
    return acc;
  }, {});

  // Format the display of each drink with its count
  var drinkDisplay = Object.entries(drinkCounts).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      drink = _ref2[0],
      count = _ref2[1];
    return "".concat(drink, " x").concat(count);
  }).join(', ');
  var displayed_price = (tabInfo.total / 100).toFixed(2);
  document.getElementById('currentTab').textContent = drinkDisplay + " | Totaal: €" + displayed_price;
}
function updateTotalDue() {
  var totalDue = Object.values(tabs).reduce(function (acc, tab) {
    return acc + tab.total;
  }, 0) + settledAmount;
  var displayed_price = (totalDue / 100).toFixed(2);
  document.getElementById('totalDue').textContent = "Totaal bedrag: \u20AC".concat(displayed_price);
}
function updateRestDue() {
  var restDue = Object.values(tabs).reduce(function (acc, tab) {
    return acc + tab.total;
  }, 0);
  var displayed_price = (restDue / 100).toFixed(2);
  document.getElementById('restDue').textContent = "Nog te betalen bedrag: \u20AC".concat(displayed_price);
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
        drinkList.pop(); // Remove last added drink
        tabs[person].total -= lastAction.price; // Subtract the price
      }
      break;
    case 'settle':
      // Assuming we saved the settled amount in actionHistory
      tabs[person].total = lastAction.amount; // Restore the settled amount
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
    alert("De rekening van ".concat(person, " bedroeg \u20AC").concat(displayed_price, " en is afgerekend."));
    actionHistory.push({
      type: 'settle',
      person: person,
      amount: tabs[person].total,
      list: tabs[person]
    });
    settledAmount += tabs[person].total;
    tabs[person] = {
      drinks: [],
      total: 0
    }; // Reset the person's tab
    localStorage.setItem('tabs', JSON.stringify(tabs));
    updateCurrentTab();
    updateTotalDue();
    updateRestDue();
    updateButtonStyles();
  } else {
    alert("Geen openstaande rekening voor ".concat(person, "."));
  }
}
function resetAllTabs() {
  if (confirm("Ben je zeker dat je alle rekeningen wilt resetten. Dit kan niet ongedaan gemaakt worden.")) {
    // Clear the tabs object
    for (var person in tabs) {
      tabs[person] = {
        drinks: [],
        total: 0
      };
    }
    // Update local storage
    localStorage.setItem('tabs', JSON.stringify(tabs));
    // Clear any action history
    actionHistory.length = 0;
    settledAmount = 0;
    // Update UI elements
    updateTotalDue();
    updateRestDue();
    updateButtonStyles();
    if (document.getElementById('drinkScreen').style.display !== 'none') {
      updateCurrentTab(); // Only update if the drink screen is visible
    }
    alert("Alle rekeningen zijn gereset.");
  }
}