document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('addExpenseForm');
    const expenseTable = document.getElementById('expenseTable').getElementsByTagName('tbody')[0];
    const editForm = document.getElementById('editExpenseForm');
    const totalExpensesBtn = document.getElementById('totalExpensesBtn');
    const totalExpensesDisplay = document.getElementById('totalExpenses');
    const expensesChart = document.getElementById('expensesChart').getContext('2d');

    let chartInstance;

    // Function to show success popup
    function showSuccessPopup(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            showConfirmButton: false,
            timer: 2000
        });
    }

    // Function to show error popup
    function showErrorPopup(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            showConfirmButton: false,
            timer: 2000
        });
    }

    // Load expenses when the page is loaded
    function fetchExpenses() {
        fetch('/api/expenses')
            .then(response => response.json())
            .then(expenses => {
                expenseTable.innerHTML = '';
                let labels = [];
                let data = [];
                expenses.forEach(expense => {
                    const row = expenseTable.insertRow();
                    row.innerHTML = `
                        <td>${expense.title}</td>
                        <td>${expense.amount}</td>
                        <td>${new Date(expense.date).toLocaleDateString()}</td>
                        <td>
                            <button class="edit-btn" data-id="${expense.id}">Edit</button>
                            <button class="delete-btn" data-id="${expense.id}">Delete</button>
                        </td>
                    `;

                    labels.push(expense.title);
                    data.push(expense.amount);
                });

                // Update chart
                if (chartInstance) {
                    chartInstance.destroy();
                }

                chartInstance = new Chart(expensesChart, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Expense Amount',
                            data: data,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            });
    }

    function fetchTotalExpenses() {
        fetch('/api/total_expenses')
            .then(response => response.json())
            .then(total => {
                totalExpensesDisplay.textContent = `Total Expenses: $${total.toFixed(2)}`;
            });
    }

    fetchExpenses();
    fetchTotalExpenses();

    // Add expense
    expenseForm.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(expenseForm);
        fetch('/api/add_expense', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(expense => {
            showSuccessPopup('Expense added successfully!');
            const row = expenseTable.insertRow();
            row.innerHTML = `
                <td>${expense.title}</td>
                <td>${expense.amount}</td>
                <td>${new Date(expense.date).toLocaleDateString()}</td>
                <td>
                    <button class="edit-btn" data-id="${expense.id}">Edit</button>
                    <button class="delete-btn" data-id="${expense.id}">Delete</button>
                </td>
            `;
            expenseForm.reset();
            fetchExpenses(); // Reload expenses after adding
        })
        .catch(error => {
            showErrorPopup('Failed to add expense. Please try again.');
        });
    });

    // Handle edit action
    expenseTable.addEventListener('click', event => {
        const target = event.target;
        const id = target.getAttribute('data-id');

        if (target.classList.contains('edit-btn')) {
            fetch(`/api/expenses/${id}`)
                .then(response => response.json())
                .then(expense => {
                    // Fill the form with existing values
                    editForm.title.value = expense.title;
                    editForm.amount.value = expense.amount;
                    editForm.date.value = new Date(expense.date).toISOString().split('T')[0];
                    editForm.id.value = expense.id;

                    // Show the edit form
                    document.querySelector('.edit-form').style.display = 'block';
                });
        } else if (target.classList.contains('delete-btn')) {
            // Ask for password before deleting
            const password = prompt("Please enter your password to delete this expense:");
            if (password) {
                fetch('/api/delete_expense', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id, password })
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        showSuccessPopup('Expense deleted successfully!');
                        // Remove the row from the table
                        target.closest('tr').remove();
                        fetchExpenses(); // Reload expenses after deleting
                    } else {
                        showErrorPopup(result.error);
                    }
                })
                .catch(error => {
                    showErrorPopup('Failed to delete expense. Please try again.');
                });
            }
        }
    });

    // Handle edit form submission
    editForm.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(editForm);
        fetch(`/api/expenses/${formData.get('id')}`, {
            method: 'PUT',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(updatedExpense => {
            showSuccessPopup('Expense updated successfully!');
            const row = expenseTable.querySelector(`button[data-id="${updatedExpense.id}"]`).closest('tr');
            row.innerHTML = `
                <td>${updatedExpense.title}</td>
                <td>${updatedExpense.amount}</td>
                <td>${new Date(updatedExpense.date).toLocaleDateString()}</td>
                <td>
                    <button class="edit-btn" data-id="${updatedExpense.id}">Edit</button>
                    <button class="delete-btn" data-id="${updatedExpense.id}">Delete</button>
                </td>
            `;
            // Hide the edit form
            document.querySelector('.edit-form').style.display = 'none';
            fetchExpenses(); // Reload expenses after editing
        })
        .catch(error => {
            showErrorPopup('Failed to update expense. Please try again.');
        });
    });

    // Show total expenses
    totalExpensesBtn.addEventListener('click', () => {
        fetch('/api/total_expenses')
            .then(response => response.json())
            .then(total => {
                totalExpensesDisplay.textContent = `Total Expenses: $${total.toFixed(2)}`;
            });
    });
});
