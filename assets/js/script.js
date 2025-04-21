// Utility function for making authenticated requests
async function makeAuthenticatedRequest(url, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/pages/login.html';
        return;
    }

    return response;
}

// Check authentication state on page load
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token && !['/pages/login.html', '/pages/signup.html'].includes(window.location.pathname)) {
        window.location.href = '/pages/login.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', checkAuth);