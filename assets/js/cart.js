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
}

// Load cart items and render
async function loadCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cartTotal');
    cartItemsContainer.innerHTML = '<span class="text-gray-500">Loading...</span>';
    let total = 0;

    // Fetch cart items for this user, join with listings for product info
    const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
            id,
            quantity,
            listings:listing_id (
                id, title, image_url, price
            )
        `)
        .eq('user_id', user.id);

    if (error) {
        cartItemsContainer.innerHTML = '<span class="text-red-500">Failed to load cart.</span>';
        cartTotalSpan.textContent = 'Total: $0.00';
        return;
    }

    if (!cartItems || cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<span class="text-gray-500">Your cart is empty.</span>';
        cartTotalSpan.textContent = 'Total: $0.00';
        return;
    }

    cartItemsContainer.innerHTML = cartItems.map(item => {
        const img = item.listings?.image_url || '/assets/img/placeholder.jpg';
        const title = item.listings?.title || 'Product';
        const price = item.listings?.price || 0;
        const quantity = item.quantity || 1;
        const subtotal = price * quantity;
        total += subtotal;
        return `
            <div class="flex flex-col items-center mx-2">
                <img class="h-52 w-52 object-cover rounded-lg" src="${img}" alt="${title}">
                <div class="font-bold mt-2">${title}</div>
                <div class="text-gray-700">Qty: ${quantity}</div>
                <div class="text-gray-700">$${price.toFixed(2)} each</div>
                <div class="text-gray-900 font-semibold">Subtotal: $${subtotal.toFixed(2)}</div>
            </div>
        `;
    }).join('');

    cartTotalSpan.textContent = `Total: $${total.toFixed(2)}`;
}

loadCart();