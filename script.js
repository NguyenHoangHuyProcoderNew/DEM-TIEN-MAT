// Denominations in VND (reversed order - small to large)
const denominations = [
    { value: 1000, label: '1,000 ₫' },
    { value: 2000, label: '2,000 ₫' },
    { value: 5000, label: '5,000 ₫' },
    { value: 10000, label: '10,000 ₫' },
    { value: 20000, label: '20,000 ₫' },
    { value: 50000, label: '50,000 ₫' },
    { value: 100000, label: '100,000 ₫' },
    { value: 200000, label: '200,000 ₫' },
    { value: 500000, label: '500,000 ₫' }
];

// Initialize the app
function init() {
    renderDenominations();
    attachEventListeners();
    updateTotal();
}

// Render denomination rows
function renderDenominations() {
    const tbody = document.getElementById('denominationsTable');

    denominations.forEach((denom, index) => {
        const row = createDenominationRow(denom, index);
        tbody.appendChild(row);
    });
}

// Create a denomination row
function createDenominationRow(denom, index) {
    const row = document.createElement('tr');
    row.style.animationDelay = `${index * 0.05}s`;

    row.innerHTML = `
        <td>
            <div class="denomination-value">${denom.label}</div>
        </td>
        <td>
            <span class="subtotal-amount" data-subtotal="${denom.value}">0 ₫</span>
        </td>
        <td>
            <input 
                type="number" 
                class="quantity-input" 
                data-value="${denom.value}"
                placeholder="0"
                min="0"
                step="1"
                inputmode="numeric"
            >
        </td>
    `;

    return row;
}

// Attach event listeners
function attachEventListeners() {
    // Listen to all input changes
    const inputs = document.querySelectorAll('.quantity-input');
    inputs.forEach(input => {
        input.addEventListener('input', handleInputChange);
        input.addEventListener('focus', handleInputFocus);
    });

    // Listen to register amount input
    const registerInput = document.getElementById('registerAmount');
    registerInput.addEventListener('input', handleRegisterInput);
    registerInput.addEventListener('focus', handleInputFocus);

    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', handleReset);
}

// Handle input change
function handleInputChange(e) {
    const input = e.target;
    const value = parseInt(input.value) || 0;
    const denominationValue = parseInt(input.dataset.value);

    // Ensure non-negative values
    if (value < 0) {
        input.value = 0;
        return;
    }

    // Update subtotal for this denomination
    const subtotalElement = input.closest('tr').querySelector('.subtotal-amount');
    const subtotal = value * denominationValue;
    subtotalElement.textContent = formatCurrency(subtotal);

    // Add animation to subtotal
    subtotalElement.style.animation = 'none';
    setTimeout(() => {
        subtotalElement.style.animation = 'pulse 0.5s ease-in-out';
    }, 10);

    // Update total
    updateTotal();
}

// Handle input focus
function handleInputFocus(e) {
    e.target.select();
}

// Handle register input with formatting
function handleRegisterInput(e) {
    const input = e.target;

    // Get cursor position before formatting
    const cursorPosition = input.selectionStart;
    const oldValue = input.value;
    const oldLength = oldValue.length;

    // Remove all non-digit characters
    let numericValue = input.value.replace(/\D/g, '');

    // Store the raw numeric value as data attribute
    input.dataset.rawValue = numericValue;

    // Format with thousand separators
    if (numericValue) {
        const formatted = formatNumberWithDots(parseInt(numericValue));
        input.value = formatted;

        // Calculate new cursor position
        const newLength = formatted.length;
        const lengthDiff = newLength - oldLength;
        const newCursorPosition = cursorPosition + lengthDiff;

        // Restore cursor position
        input.setSelectionRange(newCursorPosition, newCursorPosition);
    } else {
        input.value = '';
    }

    // Update verification
    updateVerification();
}

// Format number with dots as thousand separators
function formatNumberWithDots(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Update total amount
function updateTotal() {
    const inputs = document.querySelectorAll('.quantity-input');
    let total = 0;
    let totalNotes = 0;

    inputs.forEach(input => {
        const quantity = parseInt(input.value) || 0;
        const denominationValue = parseInt(input.dataset.value);
        total += quantity * denominationValue;
        totalNotes += quantity;
    });

    // Update total display
    const totalAmountElement = document.getElementById('totalAmount');
    const totalNotesElement = document.getElementById('totalNotes');

    totalAmountElement.textContent = formatCurrency(total);
    totalNotesElement.textContent = totalNotes;

    // Add animation to total
    totalAmountElement.style.animation = 'none';
    setTimeout(() => {
        totalAmountElement.style.animation = 'pulse 2s ease-in-out infinite';
    }, 10);

    // Update verification result
    updateVerification();
}

// Handle reset
function handleReset() {
    const inputs = document.querySelectorAll('.quantity-input');

    inputs.forEach((input, index) => {
        setTimeout(() => {
            input.value = '';
            const subtotalElement = input.closest('tr').querySelector('.subtotal-amount');
            subtotalElement.textContent = '0 ₫';

            // Add animation
            input.closest('tr').style.animation = 'shake 0.5s ease-in-out';
        }, index * 30);
    });

    // Reset register amount
    const registerInput = document.getElementById('registerAmount');
    registerInput.value = '';
    registerInput.dataset.rawValue = '';

    // Reset total after a delay
    setTimeout(() => {
        updateTotal();
    }, inputs.length * 30 + 100);
}

// Update verification result
function updateVerification() {
    const registerInput = document.getElementById('registerAmount');
    const resultElement = document.getElementById('verificationResult');

    // Get register amount from raw value (without dots)
    const registerAmount = parseInt(registerInput.dataset.rawValue || '0') || 0;

    // Get total counted amount
    const inputs = document.querySelectorAll('.quantity-input');
    let countedTotal = 0;
    inputs.forEach(input => {
        const quantity = parseInt(input.value) || 0;
        const denominationValue = parseInt(input.dataset.value);
        countedTotal += quantity * denominationValue;
    });

    // Remove all status classes
    resultElement.classList.remove('match', 'shortage', 'surplus');

    // If no register amount entered
    if (registerAmount === 0) {
        resultElement.textContent = 'Chưa có dữ liệu';
        resultElement.classList.remove('match', 'shortage', 'surplus');
        return;
    }

    // Compare and display result
    if (countedTotal === registerAmount) {
        resultElement.textContent = 'Tiền mặt đủ ✓';
        resultElement.classList.add('match');
    } else if (countedTotal < registerAmount) {
        const shortage = registerAmount - countedTotal;
        resultElement.textContent = `Thiếu ${formatCurrency(shortage)}`;
        resultElement.classList.add('shortage');
    } else {
        const surplus = countedTotal - registerAmount;
        resultElement.textContent = `Dư ${formatCurrency(surplus)}`;
        resultElement.classList.add('surplus');
    }
}

// Format currency
function formatCurrency(amount) {
    if (amount === 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
