const express = require('express');
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const router = express.Router();

// Get user's cart
router.get('/', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        res.json(cart || { items: [], total: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});