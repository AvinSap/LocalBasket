import supabase from './client.js';

// Load products from Supabase with optional search and category filter
async function loadProducts() {
    try {
        const search = document.getElementById('searchInput').value.trim();
        const category = document.getElementById('categoryFilter').value;

        let query = supabase
            .from('listings')
            .select('id, title, description, price, category, image_url, user_id, profiles:user_id(display_name)')
            .order('created_at', { ascending: false });

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }
        if (category) {
            query = query.eq('category', category);
        }

        const { data: products, error } = await query;

        if (error) {
            console.error('Error loading products:', error);
            renderProducts([]);
            return;
        }

        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        renderProducts([]);
    }
}

// Render product cards
function renderProducts(products) {
    const container = document.getElementById('productsGrid');
    container.innerHTML = products.map(product => `
        <div class="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
            <img src="${product.image_url || '/assets/img/placeholder.jpg'}" 
                alt="${product.title}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="font-bold text-lg">${product.title}</h3>
                <p class="text-gray-500 text-sm">Sold by: ${product.profiles?.display_name || 'Unknown'}</p>
                <p class="text-gray-600 mt-2 line-clamp-2">${product.description || ''}</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="font-bold text-lg">$${product.price?.toFixed(2) || '0.00'}</span>
                    <button onclick="addToCart('${product.id}')" 
                            class="bg-[#626F47] text-white py-1 px-4 rounded-full hover:bg-[#535f3a]">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('') || '<p class="col-span-full text-center">No products found.</p>';
}

// Add to cart function (saves to cart_items table)
window.addToCart = async function(productId) {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        alert('You must be logged in to add items to your cart.');
        return;
    }

    // Insert into cart_items (add quantity: 1 by default)
    const { error } = await supabase
        .from('cart_items')
        .insert([
            {
                user_id: user.id,
                listing_id: productId,
                quantity: 1
            }
        ]);

    if (error) {
        alert('Failed to add to cart: ' + error.message);
    } else {
        alert('Product added to cart!');
    }
};

// Event listeners for search and filter
document.getElementById('searchInput').addEventListener('input', loadProducts);
document.getElementById('categoryFilter').addEventListener('change', loadProducts);

// Load products on page load
document.addEventListener('DOMContentLoaded', loadProducts);