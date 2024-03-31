const item = require("../Models/item");
const user = require("../Models/user")
const express = require("express");
const router = express.Router();

router.get("/allItems", async (req, res) => {
    try {
        let filter = {};
        let sort = {};

        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' }; 
        }
        if (req.query.type) {
            filter.type = req.query.type;
        }
        if (req.query.Brand) {
            filter.Brand = req.query.Brand;
        }
        if (req.query.color) {
            filter.color = req.query.color;
        }
        if (req.query.price) {
            const [minPrice, maxPrice] = req.query.price.split('-');
            filter.price = { $gte: minPrice, $lte: maxPrice };
        }

        if (req.query.sortby) {
            switch (req.query.sortby) {
                case 'price-lowest':
                    sort.price = 1; 
                    break;
                case 'price-highest':
                    sort.price = -1; 
                    break;
                case 'name-ascending':
                    sort.name = 1; 
                    break;
                case 'name-descending':
                    sort.name = -1; 
                    break;
                default:
                    break;
            }
        }
        

        if (Object.keys(filter).length === 0 && filter.constructor === Object && Object.keys(sort).length ===0) {
            const allItems = await item.find();
            res.json(allItems);
        } else {
            const itemsList = await item.find(filter).sort(sort);
            res.json(itemsList);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get("/item-details/:id", async (req,res)=>{
    try{
        const itemId = req.params.id;
        const response = await item.findById(itemId)
        res.json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.get('/cart/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const userDetails = await user.findById(userId);

        if (!userDetails) {
            return res.status(404).json({ message: 'User not found' });
        }

        const cartItems = userDetails.cart.map(cartItem => ({
            productId: cartItem.productId,
            quantity: cartItem.quantity
        }));

        const cartItemIds = cartItems.map(cartItem => cartItem.productId);

        const cartItemsDetails = await item.find({ _id: { $in: cartItemIds } });

        const cartItemsWithQuantities = cartItemsDetails.map(itemDetail => {
            const quantity = cartItems.find(cartItem => cartItem.productId.toString() === itemDetail._id.toString()).quantity;
            return { ...itemDetail.toObject(), quantity };
        });

        res.status(200).json(cartItemsWithQuantities);
    } catch (error) {
        console.error('Error fetching cart item details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;