let transactions = JSON.parse(localStorage.getItem('expense_tracker_transactions')) || [];

const form = document.getElementById('transaction-form');
const typeInput = document.getElementById('transaction-type');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('transaction-date');

const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const currentBalanceEl = document.getElementById('current-balance');

const transactionListEl = document.getElementById('transaction-list');
const filterTypeEl = document.getElementById('filter-type');
const searchInputEl = document.getElementById('search-input');
const clearBtn = document.getElementById('clear-btn');

dateInput.valueAsDate = new Date();

function formatLKR(amount) {
    return 'LKR ' + amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function updateTotals() {
    let income = 0;
    let expenses = 0;

    transactions.forEach(item => {
        if (item.type === 'Income') {
            income += item.amount;
        } else if (item.type === 'Expense') {
            expenses += item.amount;
        }
    });

    const balance = income - expenses;

    totalIncomeEl.textContent = formatLKR(income);
    totalExpensesEl.textContent = formatLKR(expenses);
    currentBalanceEl.textContent = formatLKR(balance);
}

function renderTransactions() {
    const selectedFilter = filterTypeEl.value;
    const searchQuery = searchInputEl.value.toLowerCase().trim();

    transactionListEl.innerHTML = '';

    const filtered = transactions.filter(t => {
        const matchesType = selectedFilter === 'All' || t.type === selectedFilter;
        const matchesSearch = t.description.toLowerCase().includes(searchQuery) || 
                              t.category.toLowerCase().includes(searchQuery);
        return matchesType && matchesSearch;
    });

    if (filtered.length === 0) {
        transactionListEl.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">No transactions found</td>
            </tr>
        `;
        return;
    }

    filtered.forEach((item) => {
        const tr = document.createElement('tr');
        const isIncome = item.type === 'Income';
        const amountPrefix = isIncome ? '+ ' : '- ';
        const badgeClass = isIncome ? 'badge-income' : 'badge-expense';

        tr.innerHTML = `
            <td>${item.date}</td>
            <td>${item.description}</td>
            <td><span class="badge ${badgeClass}">${item.type}</span></td>
            <td>${item.category}</td>
            <td style="font-weight: 600;">${amountPrefix}${formatLKR(item.amount)}</td>
            <td>
                <button class="btn-delete" onclick="deleteTransaction('${item.id}')">Delete</button>
            </td>
        `;
        transactionListEl.appendChild(tr);
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const amountVal = parseFloat(amountInput.value);
    
    if (!descriptionInput.value.trim() || !categoryInput.value || isNaN(amountVal) || amountVal <= 0) {
        alert("Please fill in all fields correctly with a positive amount.");
        return;
    }

    const newTransaction = {
        id: Date.now().toString(),
        type: typeInput.value,
        description: descriptionInput.value.trim(),
        amount: amountVal,
        category: categoryInput.value,
        date: dateInput.value
    };

    transactions.push(newTransaction);
    saveData();
    
    descriptionInput.value = '';
    amountInput.value = '';
    categoryInput.value = '';
    
    alert("Transaction added successfully!");
    
    updateTotals();
    renderTransactions();
});

clearBtn.addEventListener('click', () => {
    form.reset();
    dateInput.valueAsDate = new Date();
});

function deleteTransaction(id) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        transactions = transactions.filter(item => item.id !== id);
        saveData();
        updateTotals();
        renderTransactions();
    }
}

function saveData() {
    localStorage.setItem('expense_tracker_transactions', JSON.stringify(transactions));
}

filterTypeEl.addEventListener('change', renderTransactions);
searchInputEl.addEventListener('input', renderTransactions);

updateTotals();
renderTransactions();