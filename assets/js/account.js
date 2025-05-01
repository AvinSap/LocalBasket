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

// Redirect to index.html if not signed in
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
    window.location.href = '/index.html';
} else {
    // Hide Account button if signed in (if any left)
    document.querySelectorAll('a[href="/pages/account.html"]').forEach(el => el.style.display = 'none');
}

// Logout handler
document.querySelectorAll('a[href="/index.html"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        let { error } = await supabase.auth.signOut();
        if (error) {
            alert('Logout failed: ' + error.message);
            return;
        }
        window.location.href = '/index.html';
    });
});

// Load cart items
async function loadCart() {
    const cartContainer = document.getElementById('cartContainer');
    cartContainer.innerHTML = '<span class="text-gray-500">Loading...</span>';

    // Get cart items for this user, join with listings for product info
    const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
            id,
            quantity,
            listings:listing_id (
                id, title, image_url
            )
        `)
        .eq('user_id', user.id);

    if (error) {
        cartContainer.innerHTML = '<span class="text-red-500">Failed to load cart.</span>';
        return;
    }

    if (!cartItems || cartItems.length === 0) {
        cartContainer.innerHTML = '<span class="text-gray-500">Your cart is empty.</span>';
        return;
    }

    // Keep the "Continue Shopping?" button at the start
    let html = `<h1 class="p-5"><a class="border shadow-lg rounded-2xl bg-gray-300 p-2" href="/pages/cart.html">Continue Shopping?</a></h1>`;
    html += cartItems.map(item => `
        <div class="flex flex-col items-center mx-2">
            <img class="h-40 w-40 object-cover rounded-lg" src="${item.listings?.image_url || '/assets/img/placeholder.jpg'}" alt="${item.listings?.title || 'Product'}">
            <div>
                <span class="m-3 font-bold">${item.listings?.title || 'Product'}</span>
            </div>
            <div>
                <span class="text-sm text-gray-700">Qty: ${item.quantity}</span>
            </div>
        </div>
    `).join('');
    cartContainer.innerHTML = html;
}

loadCart();