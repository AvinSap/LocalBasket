import supabase from './client.js';

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
            window.location.href = '/pages/login.html';
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

        window.location.href = '/pages/login.html';
    } catch (error) {
        console.error('Error:', error);
        window.location.href = '/pages/login.html';
    }
});