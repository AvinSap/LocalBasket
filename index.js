import supabase from '/assets/js/client.js';

// Dynamically set Home button link based on auth state
const homeLink = document.getElementById('homeLink');
if (homeLink) {
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            homeLink.setAttribute('href', '/pages/account.html');
        } else {
            homeLink.setAttribute('href', '/index.html');
        }
    });
}

// Redirect to account.html if already signed in
supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
        window.location.href = '/pages/account.html';
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value
    };

    try {
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    display_name: formData.name
                }
            }
        });

        if (error) {
            alert('Sign up failed: ' + error.message);
            return;
        }

        // Insert into profiles table
        const user = data.user;
        if (user) {
            await supabase
                .from('profiles')
                .insert([
                    { id: user.id, display_name: formData.name }
                ]);
        }

        alert('A confirmation email has been sent. Please check your inbox to verify your account.');
        window.location.href = '/pages/login.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Sign up failed. Please try again.');
    }
});