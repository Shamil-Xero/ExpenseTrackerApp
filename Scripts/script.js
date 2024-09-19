const savedFont = localStorage.getItem('font') || 'Roboto, Arial, sans-serif';
const savedCurrency = localStorage.getItem('currency') || '₹';

document.body.style.fontFamily = savedFont;

let expenses = [];
let totalAmount = 0;

const categorySelect = document.getElementById('category-select');
const amountInput = document.getElementById('amount-input');
const dateInput = document.getElementById('date-input');
const addBtn = document.getElementById('add-btn');
const expensesTableBody = document.getElementById('expense-table-body');
const totalAmountCell = document.getElementById('total-amount');
const chartCtx = document.getElementById('expenseChart').getContext('2d');

// Add these variables at the top of your script
let expenseChart;
let budget = 0;
const budgetInput = document.getElementById('budget-input');
const setBudgetBtn = document.getElementById('set-budget-btn');
const budgetAmount = document.getElementById('budget-amount');
const spentAmount = document.getElementById('spent-amount');
const remainingAmount = document.getElementById('remaining-amount');
const budgetBar = document.getElementById('budget-bar');

// Add this function to create/update the chart
function updateChart() {
  toggleChartVisibility();

  if (expenses.length === 0) {
    return; // Exit the function if there are no expenses
  }

  const categoryTotals = {};
  let total = 0;
  expenses.forEach(expense => {
    if (categoryTotals[expense.category]) {
      categoryTotals[expense.category] += expense.amount;
    } else {
      categoryTotals[expense.category] = expense.amount;
    }
    total += expense.amount;
  });

  const isDarkMode = document.body.classList.contains('dark-theme');
  const textColor = isDarkMode ? '#f0f0f0' : '#363949';
  const borderColor = isDarkMode ? '#1a1a1a' : '#d0d0d0';

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#FF6384'
      ],
      borderColor: borderColor,
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor
        }
      },
      title: {
        display: true,
        text: 'Expense Distribution',
        font: {
          size: 18,
          weight: 'bold'
        },
          color: textColor
      },
      datalabels: {
        color: '#fff',
        formatter: (value, ctx) => {
          let sum = 0;
          let dataArr = ctx.chart.data.datasets[0].data;
          dataArr.map(data => {
            sum += data;
          });
          let percentage = (value * 100 / sum).toFixed(1) + "%";
          return percentage;
        },
        font: {
          weight: 'bold',
          size: 14
        },
        textStrokeColor: 'rgba(0,0,0,0.5)',
        textStrokeWidth: 2,
        textShadowBlur: 5,
        textShadowColor: 'rgba(0,0,0,0.5)',
        align: 'center',
        anchor: 'center'
      }
    }
  };

  if (expenseChart) {
    expenseChart.data = chartData;
    expenseChart.options = chartOptions;
    expenseChart.update();
  } else {
    Chart.register(ChartDataLabels);
    expenseChart = new Chart(chartCtx, {
      type: 'pie',
      data: chartData,
      options: chartOptions,
      plugins: [ChartDataLabels]
    });
  }
}

// Add this function to update the budget display
function updateBudgetDisplay() {
  const spent = expenses.reduce((total, expense) => total + expense.amount, 0);
  const remaining = Math.max(budget - spent, 0);
  const percentage = (spent / budget) * 100;

  // Update budget display with consistent styling
  budgetAmount.textContent = `${savedCurrency}${budget.toFixed(2)}`;
  spentAmount.textContent = `${savedCurrency}${spent.toFixed(2)}`;
  remainingAmount.textContent = `${savedCurrency}${remaining.toFixed(2)}`;

  // Update the width of the progress bar
  budgetBar.style.width = `${Math.min(percentage, 100)}%`;
  budgetBar.style.backgroundColor = percentage > 100 ? 'red' : 'green'; // Change color based on budget status

  // Add a class if over budget
  if (percentage > 100) {
    budgetBar.classList.add('over-budget');
  } else {
    budgetBar.classList.remove('over-budget');
  }
}

// Add event listener for setting the budget
setBudgetBtn.addEventListener('click', function() {
  const newBudget = Number(budgetInput.value);
  if (isNaN(newBudget) || newBudget <= 0) {
    alert('Please enter a valid budget amount');
    return;
  }
  budget = newBudget;
  localStorage.setItem('budget', budget);
  updateBudgetDisplay();
});

// Load saved budget when the page loads
document.addEventListener('DOMContentLoaded', function() {
  const savedBudget = localStorage.getItem('budget');
  if (savedBudget) {
    budget = Number(savedBudget);
    budgetInput.value = budget;
    updateBudgetDisplay();
  }
  // ... existing code ...
});

// Update the addBtn event listener to include budget update
addBtn.addEventListener('click', function() {
  const category = categorySelect.value;
  const amount = Number(amountInput.value);
  const date = dateInput.value;

  if (category === '') {
      alert('Please select a category');
      return;
  }
  if (isNaN(amount) || amount <=0 ) {
      alert('Please enter a valid amount')
      return;
  }
  if(date === '') {
      alert('Please select a date')
      return;
  }
  expenses.push({category, amount, date});

  totalAmount += amount;
  totalAmountCell.textContent = totalAmount;

  const newRow = expensesTableBody.insertRow();

  const categoryCell = newRow.insertCell();
  const amountCell = newRow.insertCell();
  const dateCell = newRow.insertCell();
  const deleteCell = newRow.insertCell();
  const deleteBtn = document.createElement('button');

  deleteBtn.textContent = 'Delete';
  deleteBtn.classList.add('delete-btn');
  deleteBtn.addEventListener('click', function() {
      expenses.splice(expenses.indexOf(expense), 1);

      totalAmount -= expense.amount;
      totalAmountCell.textContent = totalAmount;

      expensesTableBody.removeChild(newRow);
  });

  const expense = expenses[expenses.length - 1];
  categoryCell.textContent = expense.category;
  amountCell.textContent = `${savedCurrency}${expense.amount}`;
  dateCell.textContent = expense.date;
  deleteCell.appendChild(deleteBtn);
  updateBudgetDisplay();
  updateChart();
  toggleChartVisibility();
  localStorage.setItem('expenses', JSON.stringify(expenses));
});

const storedExpenses = JSON.parse(localStorage.getItem('expenses'));
if (storedExpenses) {
    expenses = storedExpenses;
    totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalAmountCell.textContent = totalAmount;

    for (const expense of expenses) {
        totalAmount += expense.amount;
        totalAmountCell.textContent = totalAmount;

        const newRow = expensesTableBody.insertRow();
        const categoryCell = newRow.insertCell();
        const amountCell = newRow.insertCell();
        const dateCell = newRow.insertCell();
        const deleteCell = newRow.insertCell();
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', function() {
            expenses.splice(expenses.indexOf(expense), 1);

            totalAmount -= expense.amount;
            totalAmountCell.textContent = totalAmount;

            expensesTableBody.removeChild(newRow);
        });
        categoryCell.textContent = expense.category;
        amountCell.textContent = `${savedCurrency}${expense.amount}`;
        dateCell.textContent = expense.date;
        deleteCell.appendChild(deleteBtn);
    }
    updateChart();
}

// Add this code after loading stored expenses
if (storedExpenses) {
  expenses = storedExpenses.map(expense => {
    if (expense.category === "Food & Beverage") {
      return { ...expense, category: "Food" };
    }
    return expense;
  });
  localStorage.setItem('expenses', JSON.stringify(expenses));
  // Redraw the table and update the chart here
  // ...
}

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference or default to light theme
const currentTheme = localStorage.getItem('theme') || 'light';
document.body.classList.toggle('dark-theme', currentTheme === 'dark');

// Set initial icon based on the current theme
if (currentTheme === 'dark') {
  themeIcon.classList.remove('fa-moon');
  themeIcon.classList.add('fa-sun');
} else {
  themeIcon.classList.remove('fa-sun');
  themeIcon.classList.add('fa-moon');
}

themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);

    // Toggle the icon
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }

    // Update chart
    updateChart();
});

// Call this when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // ... other initialization code ...
  updateChart();
});

// Call this after adding an expense
addBtn.addEventListener('click', function() {
  // ... existing code ...
  updateChart();
  toggleChartVisibility();
});

// Call this after deleting an expense
function createDeleteButton(expense, row) {
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.classList.add('delete-btn');
  deleteBtn.addEventListener('click', function() {
    // Remove the expense from the expenses array
    expenses = expenses.filter(e => e !== expense);
    
    // Update total amount
    totalAmount -= expense.amount;
    totalAmountCell.textContent = `${savedCurrency}${totalAmount.toFixed(2)}`;
    
    // Remove the row from the table
    expensesTableBody.removeChild(row);
    
    // Update budget display and chart
    updateBudgetDisplay();
    updateChart();
    toggleChartVisibility();
    
    // Save the updated expenses array to localStorage
    localStorage.setItem('expenses', JSON.stringify(expenses));
  });
  return deleteBtn;
}

if (storedExpenses) {
  expenses = storedExpenses;
  totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalAmountCell.textContent = `${savedCurrency}${totalAmount.toFixed(2)}`;

  for (const expense of expenses) {
    const newRow = expensesTableBody.insertRow();
    const categoryCell = newRow.insertCell();
    const amountCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const deleteCell = newRow.insertCell();

    categoryCell.textContent = expense.category;
    amountCell.textContent = `${savedCurrency}${expense.amount}`;
    dateCell.textContent = expense.date;
    deleteCell.appendChild(createDeleteButton(expense, newRow));
  }
  updateBudgetDisplay();
  updateChart();
}

document.addEventListener('DOMContentLoaded', function() {
  // Load expenses from localStorage
  const storedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
  expenses = storedExpenses;

  // Clear the existing table
  expensesTableBody.innerHTML = '';

  // Recalculate total amount
  totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalAmountCell.textContent = `${savedCurrency}${totalAmount.toFixed(2)}`;

  // Populate the table with stored expenses
  for (const expense of expenses) {
    const newRow = expensesTableBody.insertRow();
    const categoryCell = newRow.insertCell();
    const amountCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const deleteCell = newRow.insertCell();

    categoryCell.textContent = expense.category;
    amountCell.textContent = `${savedCurrency}${expense.amount}`;
    dateCell.textContent = expense.date;
    deleteCell.appendChild(createDeleteButton(expense, newRow));
  }

  // Update budget display and chart
  updateBudgetDisplay();
  updateChart();
});

function toggleChartVisibility() {
  const chartContainer = document.querySelector('.chart-container');
  if (expenses.length === 0) {
    chartContainer.style.display = 'none';
  } else {
    chartContainer.style.display = 'block';
  }
}