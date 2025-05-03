import supabase from './client.js';

let editId = null;

// DOM Elements
const newProductBtn = document.getElementById('newProductBtn');
const productFormContainer = document.getElementById('productFormContainer');
const cancelForm = document.getElementById('cancelForm');
const productForm = document.getElementById('productForm');
const productsTableBody = document.getElementById('productsTableBody');
const productImagesInput = document.getElementById('productImages');

// Show form for new product
newProductBtn.addEventListener('click', () => {
    editId = null;
    productForm.reset();
    productFormContainer.classList.remove('hidden');
});

// Hide form
cancelForm.addEventListener('click', () => {
    productFormContainer.classList.add('hidden');
    productForm.reset();
    editId = null;
});

// Handle form submit (add or update)
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert('You must be logged in to add or edit a product.');
        return;
    }

    // Handle image upload
    let image_url;
    const file = productImagesInput.files[0];

    if (file) {
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase
            .storage
            .from('images')
            .upload(filePath, file, { upsert: true });
        if (uploadError) {
            alert('Image upload failed: ' + uploadError.message);
            return;
        }
        // Get public URL
        const { data: publicUrlData } = supabase
            .storage
            .from('images')
            .getPublicUrl(filePath);
        image_url = publicUrlData.publicUrl;
    } else if (editId) {
        // Fetch the existing image_url if editing and no new image is uploaded
        const { data: existing, error: fetchError } = await supabase
            .from('listings')
            .select('image_url')
            .eq('id', editId)
            .single();
        if (fetchError) {
            alert('Failed to fetch existing product image.');
            return;
        }
        image_url = existing.image_url;
    } else {
        image_url = '';
    }

    // Only update editable fields
    const listing = {
        title: productForm.name.value,
        description: productForm.description.value,
        price: parseFloat(productForm.price.value),
        stock: parseInt(productForm.stock.value, 10),
        category: productForm.category.value,
        sku: productForm.sku.value,
        image_url
    };

    let result;
    if (editId) {
        result = await supabase
            .from('listings')
            .update(listing)
            .eq('id', editId);
        if (result.error) {
            alert('Error saving product: ' + result.error.message);
            console.error(result);
        } else if (result.data && result.data.length === 0) {
            alert('No product was updated. Please check the product ID.');
            console.error(result);
        } else {
            alert('Product updated!');
            productFormContainer.classList.add('hidden');
            productForm.reset();
            editId = null;
            loadProducts();
        }
    } else {
        result = await supabase
            .from('listings')
            .insert([{
                ...listing,
                user_id: user.id
            }]);
        if (result.error) {
            alert('Error saving product: ' + result.error.message);
            console.error(result);
        } else {
            alert('Product saved!');
            productFormContainer.classList.add('hidden');
            productForm.reset();
            editId = null;
            loadProducts();
        }
    }
});

// Load products from Supabase (only for the logged-in user)
async function loadProducts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        productsTableBody.innerHTML = `<tr><td colspan="6">Please log in to view your products.</td></tr>`;
        return;
    }

    const { data: products, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        productsTableBody.innerHTML = `<tr><td colspan="6">Error loading products</td></tr>`;
        return;
    }

    productsTableBody.innerHTML = products.map(product => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-full" src="${product.image_url || '/assets/img/placeholder.jpg'}" alt="${product.title}">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${product.title}</div>
                        <div class="text-sm text-gray-500">${product.description || ''}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${product.price.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.stock}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <a href="#" class="text-[#626F47] hover:text-[#535f3a] mr-3 edit-btn" data-id="${product.id}">Edit</a>
                <a href="#" class="text-red-600 hover:text-red-800 delete-btn" data-id="${product.id}">Delete</a>
            </td>
        </tr>
    `).join('');

    // Attach edit and delete handlers
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const product = products.find(p => p.id == id);
            if (product) {
                editId = product.id;
                productForm.name.value = product.title;
                productForm.description.value = product.description;
                productForm.price.value = product.price;
                productForm.stock.value = product.stock;
                productForm.category.value = product.category;
                productForm.sku.value = product.sku || '';
                productFormContainer.classList.remove('hidden');
            }
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this product?')) {
                const { error } = await supabase
                    .from('listings')
                    .delete()
                    .eq('id', id);
                if (error) {
                    alert('Error deleting product: ' + error.message);
                } else {
                    loadProducts();
                }
            }
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', loadProducts);

// Logout handler
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    let { error } = await supabase.auth.signOut();
    if (error) {
        alert('Logout failed: ' + error.message);
        return;
    }
    window.location.href = '/index.html';
});