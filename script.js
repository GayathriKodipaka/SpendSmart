// Global variables
let transactions = [
    {
        id: 1,
        type: 'expense',
        category: 'food',
        amount: 2850,
        description: 'Grocery Shopping',
        vendor: 'BigBasket',
        date: new Date(),
        icon: 'fas fa-shopping-cart'
    },
    {
        id: 2,
        type: 'income',
        category: 'salary',
        amount: 85000,
        description: 'Salary Credit',
        vendor: 'Tech Corp Ltd',
        date: new Date(Date.now() - 86400000), // Yesterday
        icon: 'fas fa-briefcase'
    },
    {
        id: 3,
        type: 'expense',
        category: 'transport',
        amount: 285,
        description: 'Uber Ride',
        vendor: 'Uber',
        date: new Date(Date.now() - 86400000),
        icon: 'fas fa-car'
    },
    {
        id: 4,
        type: 'investment',
        category: 'investment',
        amount: 10000,
        description: 'SIP Investment',
        vendor: 'Mutual Fund',
        date: new Date(Date.now() - 432000000), // 5 days ago
        icon: 'fas fa-chart-line'
    }
];

let marketData = {
    gold: { price: 5847, change: 1.2, currency: '₹', unit: '/gm' },
    silver: { price: 72450, change: 0.8, currency: '₹', unit: '/kg' },
    nifty: { price: 22387.50, change: -0.5, currency: '', unit: '' },
    sensex: { price: 73845.25, change: 0.3, currency: '', unit: '' },
    bitcoin: { price: 67234, change: 2.4, currency: '$', unit: '' },
    usd_inr: { price: 83.42, change: -0.1, currency: '', unit: '' }
};

let financialGoals = [
    { id: 1, name: 'Emergency Fund', target: 250000, current: 170000 },
    { id: 2, name: 'Vacation Fund', target: 150000, current: 67500 },
    { id: 3, name: 'Car Purchase', target: 800000, current: 200000 }
];

let chart;
const chartPeriods = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateDashboardStats();
    renderTransactions();
    initializeChart();
    updateMarketData();
    renderGoals();
    setupEventListeners();
    startRealTimeUpdates();
    
    // Hide loading overlay
    hideLoadingOverlay();
}

// Dashboard Statistics Functions
function updateDashboardStats() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalInvestments = transactions
        .filter(t => t.type === 'investment')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBalance = totalIncome - totalExpenses;
    const totalSavings = totalIncome - totalExpenses - totalInvestments;
    
    // Update UI
    document.getElementById('balance').textContent = formatCurrency(totalBalance);
    document.getElementById('income').textContent = formatCurrency(totalIncome);
    document.getElementById('expenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('savings').textContent = formatCurrency(totalSavings);
    
    // Update stat changes with animation
    updateStatChange('.balance-card', 12.5);
    updateStatChange('.income-card', 8.2);
    updateStatChange('.expense-card', 3.1, false);
    updateStatChange('.savings-card', 15.3);
}

function updateStatChange(cardSelector, change, isPositive = true) {
    const card = document.querySelector(cardSelector);
    const changeElement = card.querySelector('.stat-change');
    
    changeElement.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
    changeElement.innerHTML = `
        <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
        ${isPositive ? '+' : ''}${change}%
    `;
}

// Transaction Functions
function addTransaction() {
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;
    const category = document.getElementById('transaction-category').value;
    const description = document.getElementById('transaction-description').value;
    
    // Validation
    if (!amount || amount <= 0) {
        showMessage('Please enter a valid amount', 'error');
        return;
    }
    
    if (!type) {
        showMessage('Please select a transaction type', 'error');
        return;
    }
    
    if (!category) {
        showMessage('Please select a category', 'error');
        return;
    }
    
    // Create new transaction
    const newTransaction = {
        id: Date.now(),
        type: type,
        category: category,
        amount: amount,
        description: description || getCategoryDisplayName(category),
        vendor: 'Manual Entry',
        date: new Date(),
        icon: getCategoryIcon(category)
    };
    
    // Add to transactions array
    transactions.unshift(newTransaction);
    
    // Update UI
    showLoadingOverlay();
    
    setTimeout(() => {
        renderTransactions();
        updateDashboardStats();
        updateChart();
        clearTransactionForm();
        hideLoadingOverlay();
        showMessage('Transaction added successfully!', 'success');
    }, 800);
}

function renderTransactions() {
    const transactionsList = document.querySelector('.transactions-list');
    const recentTransactions = transactions.slice(0, 4);
    
    transactionsList.innerHTML = recentTransactions.map(transaction => {
        const timeAgo = getTimeAgo(transaction.date);
        const amountClass = transaction.type;
        const amountPrefix = transaction.type === 'income' ? '+' : '-';
        
        return `
            <div class="transaction-item" data-id="${transaction.id}">
                <div class="transaction-icon ${amountClass}">
                    <i class="${transaction.icon}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <p>${transaction.vendor} • ${timeAgo}</p>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountPrefix}${formatCurrency(transaction.amount)}
                </div>
                <button class="delete-transaction-btn" onclick="deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

function deleteTransaction(transactionId) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== transactionId);
        renderTransactions();
        updateDashboardStats();
        updateChart();
        showMessage('Transaction deleted successfully!', 'success');
    }
}

function clearTransactionForm() {
    document.getElementById('transaction-amount').value = '';
    document.getElementById('transaction-type').value = '';
    document.getElementById('transaction-category').value = '';
    document.getElementById('transaction-description').value = '';
}

// Chart Functions
function initializeChart() {
    const ctx = document.getElementById('transactionChart').getContext('2d');
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Income',
                data: [],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Expenses',
                data: [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    updateChart('7d');
}

function updateChart(period = '7d') {
    const days = chartPeriods[period];
    const chartData = generateChartData(days);
    
    chart.data.labels = chartData.labels;
    chart.data.datasets[0].data = chartData.income;
    chart.data.datasets[1].data = chartData.expenses;
    chart.update('active');
    
    // Update active button
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-period="${period}"]`).classList.add('active');
}

function generateChartData(days) {
    const labels = [];
    const income = [];
    const expenses = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dayTransactions = transactions.filter(t => 
            t.date.toDateString() === date.toDateString()
        );
        
        const dayIncome = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const dayExpenses = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        labels.push(date.toLocaleDateString('en-IN', { 
            month: 'short', 
            day: 'numeric' 
        }));
        income.push(dayIncome);
        expenses.push(dayExpenses);
    }
    
    return { labels, income, expenses };
}

// Market Data Functions
function updateMarketData() {
    Object.keys(marketData).forEach(key => {
        // Simulate real-time price changes
        const data = marketData[key];
        const priceElement = document.getElementById(`${key.replace('_', '-')}-price`);
        
        if (priceElement) {
            const formattedPrice = `${data.currency}${data.price.toLocaleString()}${data.unit}`;
            priceElement.textContent = formattedPrice;
        }
    });
}

function simulateMarketChanges() {
    Object.keys(marketData).forEach(key => {
        const data = marketData[key];
        // Random price fluctuation between -0.5% to +0.5%
        const change = (Math.random() - 0.5) * 0.01;
        data.price = Math.max(0, data.price * (1 + change));
        data.change += change * 100;
    });
    
    updateMarketData();
}

// Goals Functions
function renderGoals() {
    const goalsList = document.querySelector('.goals-list');
    
    goalsList.innerHTML = financialGoals.map(goal => {
        const progress = Math.round((goal.current / goal.target) * 100);
        
        return `
            <div class="goal-item" data-id="${goal.id}">
                <div class="goal-info">
                    <h4>${goal.name}</h4>
                    <p>${formatCurrency(goal.target)} goal</p>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${progress}% (${formatCurrency(goal.current)})</span>
                </div>
                <button class="edit-goal-btn" onclick="editGoal(${goal.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }).join('');
}

function addGoal() {
    const name = prompt('Enter goal name:');
    const target = parseFloat(prompt('Enter target amount:'));
    
    if (name && target && target > 0) {
        const newGoal = {
            id: Date.now(),
            name: name,
            target: target,
            current: 0
        };
        
        financialGoals.push(newGoal);
        renderGoals();
        showMessage('Goal added successfully!', 'success');
    }
}

function editGoal(goalId) {
    const goal = financialGoals.find(g => g.id === goalId);
    if (!goal) return;
    
    const newCurrent = parseFloat(prompt(`Update current amount for ${goal.name}:`, goal.current));
    
    if (newCurrent !== null && newCurrent >= 0) {
        goal.current = Math.min(newCurrent, goal.target);
        renderGoals();
        showMessage('Goal updated successfully!', 'success');
    }
}

// Quick Actions Functions
function setupQuickActions() {
    document.querySelector('.transfer-btn').addEventListener('click', () => {
        showQuickActionModal('Transfer Money', 'transfer');
    });
    
    document.querySelector('.pay-bill-btn').addEventListener('click', () => {
        showQuickActionModal('Pay Bills', 'bill');
    });
    
    document.querySelector('.invest-btn').addEventListener('click', () => {
        showQuickActionModal('Invest', 'investment');
    });
    
    document.querySelector('.loan-btn').addEventListener('click', () => {
        showQuickActionModal('Get Loan', 'loan');
    });
}

function showQuickActionModal(title, action) {
    // Simplified quick action - in real app, this would open a modal
    const amount = prompt(`Enter amount for ${title}:`);
    if (amount && parseFloat(amount) > 0) {
        showLoadingOverlay();
        
        setTimeout(() => {
            hideLoadingOverlay();
            showMessage(`${title} of ${formatCurrency(parseFloat(amount))} processed successfully!`, 'success');
        }, 1500);
    }
}

// Event Listeners
function setupEventListeners() {
    // Chart period buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const period = e.target.dataset.period;
            updateChart(period);
        });
    });
    
    // Quick actions
    setupQuickActions();
    
    // Add goal button
    document.querySelector('.add-goal-btn').addEventListener('click', addGoal);
    
    // Mobile navigation
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.mobile-nav-item').forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });
    
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });
    
    // Transaction form submit on Enter
    document.getElementById('transaction-amount').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTransaction();
    });
    
    // Notification bell
    document.querySelector('.notification-icon').addEventListener('click', () => {
        showMessage('You have 3 new notifications', 'info');
    });
    
    // User profile dropdown
    document.querySelector('.user-profile').addEventListener('click', () => {
        showMessage('Profile menu clicked', 'info');
    });
}

// Real-time Updates
function startRealTimeUpdates() {
    // Update market data every 10 seconds
    setInterval(() => {
        simulateMarketChanges();
    }, 10000);
    
    // Update time stamps every minute
    setInterval(() => {
        renderTransactions();
    }, 60000);
}

// Utility Functions
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays === 0) {
        if (diffInHours === 0) {
            return 'Just now';
        }
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-IN', { 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

function getCategoryIcon(category) {
    const icons = {
        food: 'fas fa-utensils',
        transport: 'fas fa-car',
        shopping: 'fas fa-shopping-bag',
        bills: 'fas fa-file-invoice-dollar',
        entertainment: 'fas fa-film',
        healthcare: 'fas fa-heartbeat',
        salary: 'fas fa-briefcase',
        freelance: 'fas fa-laptop',
        investment: 'fas fa-chart-line'
    };
    return icons[category] || 'fas fa-circle';
}

function getCategoryDisplayName(category) {
    const names = {
        food: 'Food & Dining',
        transport: 'Transportation',
        shopping: 'Shopping',
        bills: 'Bills & Utilities',
        entertainment: 'Entertainment',
        healthcare: 'Healthcare',
        salary: 'Salary',
        freelance: 'Freelance',
        investment: 'Investment'
    };
    return names[category] || category;
}

function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('transaction-message');
    messageEl.textContent = message;
    messageEl.className = `form-message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

function showLoadingOverlay() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoadingOverlay() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

// Export functions for global access
window.addTransaction = addTransaction;
window.deleteTransaction = deleteTransaction;
window.editGoal = editGoal;
