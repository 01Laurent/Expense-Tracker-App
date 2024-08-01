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
});

  // Handling add expense form submission
document.getElementById('addExpenseForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const title = document.getElementById('title').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;

    fetch('/expenses/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, amount, date })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Expense added successfully') {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            });
            document.getElementById('addExpenseForm').reset();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            });
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to add expense',
            showConfirmButton: false,
            timer: 1500
        });
    });
});
