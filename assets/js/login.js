import supabase from './client.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert(error.message || 'Login failed');
            return;
        }

        // Store user session info if needed
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on user role (adjust as needed)
        if (data.user && data.user.role === 'admin') {
            window.location.href = '/pages/admin.html';
        } else {
            window.location.href = '/pages/account.html';
        }
    } catch (err) {
        console.error('Error:', err);
        alert('An error occurred during login');
    }
});