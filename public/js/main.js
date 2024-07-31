document.addEventListener('DOMContentLoaded', function() {
  // Handling registration form submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
      registerForm.addEventListener('submit', async function(event){
          event.preventDefault();
          const formData = new FormData(registerForm);
          try {
              const response = await fetch('/auth/register', {
                  method: 'POST',
                  body: formData
              });
              const result = await response.text();
              if (response.ok) {
                  window.location.href = '/auth/login';
              } else {
                  alert(result); // Show error message
              }
          } catch (error) {
              console.error('Error:', error);
              alert('An error occurred. Please try again.');
          }
      });
  }

  // Handling login form submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
      loginForm.addEventListener('submit', async function(event) {
          event.preventDefault();
          const formData = new FormData(loginForm);
          try {
              const response = await fetch('/auth/login', {
                  method: 'POST',
                  body: new URLSearchParams (formData)
              });
              const result = await response.text();
              if (response.ok) {
                  window.location.href = '/';
              } else {
                  alert(result); // Show error message
              }
          } catch (error) {
              console.error('Error:', error);
              alert('An error occurred. Please try again.');
          }
      });
  }

  // Handling add expense form submission
  addExpenseForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log('Form submission triggered');
    const formData = new FormData(addExpenseForm);

    try {
        const response = await fetch('/expenses/add', {
            method: 'POST',
            body: formData
        });

        const result = await response.text();
        console.log('Server response:', result);

        if (response.ok) {
            window.location.href = '/expenses/view';
        } else {
            alert(result);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});


  // Handling edit expense form submission
  const editExpenseForm = document.getElementById('editExpenseForm');
  if (editExpenseForm) {
      editExpenseForm.addEventListener('submit', async function(event) {
          event.preventDefault();
          const formData = new FormData(editExpenseForm);
          const expenseId = editExpenseForm.getAttribute('data-expense-id');
          try {
              const response = await fetch(`/expenses/edit/${expenseId}`, {
                  method: 'POST',
                  body: formData
              });
              const result = await response.text();
              if (response.ok) {
                  window.location.href = '/expenses/view';
              } else {
                  alert(result); // Show error message
              }
          } catch (error) {
              console.error('Error:', error);
              alert('An error occurred. Please try again.');
          }
      });
  }
});
