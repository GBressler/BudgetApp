var budgetController = (function(){

  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value =  value;
  };

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value =  value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current){
    sum += current.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      //Create new ID
      if(data.allItems[type].length > 0){
         ID = data.allItems[type][data.allItems[type].length -1 ].id + 1;
       } else {
         ID = 0;
       }
     
      
      //Create new item based on 'inc' or 'exp'
      if(type === 'exp') {
        newItem = new Expense (ID, des, val);
      } else if (type === 'inc'){
        newItem = new Income (ID, des, val);
    }

    //Push it into data structure
    data.allItems[type].push(newItem);
    
    //Return new element
    return newItem;
  },

  deleteItem: function(type, id) {
    var ids, index;

    ids = data.allItems[type].map(function(current){
      return current.id;
    });

    index = ids.indexOf(id);

    if (index !== -1) {
      data.allItems[type].splice(index, 1);
    }
  },
  
  calculateBudget: function() {
    //cal total income and expense
    calculateTotal('exp');
    calculateTotal('inc');
    
    //calc the budget: income  - expenses
    data.budget = data.totals.inc - data.totals.exp;

    //calc the percentage of income that we spent
    if( data.totals.inc > 0){
      data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
    } else {
      data.percentage = -1;
    }
  },

  getBudget: function() {
    return {
      budget: data.budget,
      totalInc: data.totals.inc,
      totalExp: data.totals.exp,
      percentage:  data.percentage

    };
  },

   testing: function() {
    console.log(data);
  }
};

})();



var UIController = (function(){
     var DOMstrings = {
       inputType: '.add__type',
       inputDescription:  '.add__description',
       inputValue:  '.add__value',
       inputButton:  '.add__btn',
       incomeContainer:  '.income__list',
       expensesContainer:  '.expenses__list',
       budgetLabel: '.budget__value',
       incomeLabel: '.budget__income--value',
       expensesLabel: '.budget__expenses--value',
       percentageLabel: '.budget__expenses--percentage',
       container: '.container'

     };

     return {
       getInput: function(){
         return {
           type: document.querySelector(DOMstrings.inputType).value, //Will be inc or exp
           description: document.querySelector(DOMstrings.inputDescription).value,
           value:  parseFloat(document.querySelector(DOMstrings.inputValue).value)
         };
       },

       addListItem: function(obj, type) {
         var html, newHtml, element;
         //Insert placeholder
         if (type === 'inc') {
           element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
         } else if (type === 'exp') {
            element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
         }
         //Replace placeholder w/ data

         newHtml = html.replace('%id%', obj.id);
         newHtml = newHtml.replace('%description%', obj.description);
         newHtml = newHtml.replace('%value%', obj.value);


         //Insert HTML INTO DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
       
       deleteListItem: function(selectorID) {
         var element = document.getElementById(selectorID);
         element.parentNode.removeChild(element);
       },


       clearFields: function() {
         var fields, fieldsArr;

         fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' +  DOMstrings.inputValue);
         fieldsArr = Array.prototype.slice.call(fields);
         fieldsArr.forEach(function(current, index, array){
           current.value = "";
         });
         fieldsArr[0].focus();
       },

       displayBudget: function(obj) {
        document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
        document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
        document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

        if (obj.percentage > 0) {
          document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
        } else {
          document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        }
       },

       getDOMstrings: function() {
         return DOMstrings;
       }
     };


})();


var controller = (function(budgetCtrl, UICtrl){

  var setupEventListeners = function(){
    var DOM  = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputButton).addEventListener('click', crtlAddItem);
    document.addEventListener('keypress', function(event){
      if (event.keyCode === 13 || event.which === 13){
        crtlAddItem();
      }
    });
     document.querySelector(DOM.container).addEventListener('click', crtlDeleteItem);
  };

    var updateBudget = function() {
       //1.  Calc Budget
      budgetCtrl.calculateBudget();
      //2.  return Budget
      var budget = budgetCtrl.getBudget();
      //3.  Display Budget
       UICtrl.displayBudget(budget);
    }
    
    var crtlAddItem = function(){
      var input, newItem;
      //1.  get data
      input = UICtrl.getInput();
      console.log(input);
      

      if (input.description !== "" && !isNaN(input.value) && input.value > 0){
         //2.  add item to budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        //3.  Add item to UI
        UICtrl.addListItem(newItem, input.type);
        //4.  Clear fields
        UICtrl.clearFields();
        //5. Calc and update Budget
        updateBudget();
      }
     
     
    };

    var crtlDeleteItem = function(event){
      var itemID, splitID, type, ID;
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
      if(itemID){
        splitID = itemID.split("-");
        type = splitID[0];
        ID = parseInt(splitID[1]);

        //1.  Delete item from the data structure
        budgetCtrl.deleteItem(type, ID);
        //2.  Delete item from the UI
        UICtrl.deleteListItem(itemID);
        //3.  Update and show new budget
        updateBudget();
      }
    };

    return {
      init: function(){
        console.log('test');
        UICtrl.displayBudget({
          budget: 0,
          totalInc: 0,
          totalExp: 0,
          percentage:  -1
        })
        setupEventListeners();
      }
    };

})(budgetController, UIController);

controller.init();