const express = require("express");
const router = express.Router();
const user = require("../Models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyJwt = require("../Middlewares/authMiddleware")

router.post("/register", async (req, res) => {
    try {
        const { name, email, mobNo, password } = req.body;
        if (!name || !mobNo || !email || !password)
            return res.status(400).json({ message: "bad request!" });

        let isExistingUser = await user.findOne({ email: email })
        if (isExistingUser) {
            return res.status(409).json({ message: "user already exists" });
        }

        isExistingUser = await user.findOne({ mobNo: mobNo })
        if (isExistingUser) {
            return res.status(409).json({ message: "user already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = new user({
            name,
            email,
            mobNo,
            password: hashedPassword,
        })
        const userResponse = await userData.save();
        const token = await jwt.sign(
            { userId: userResponse._id },
            process.env.JWT_SECRET
        )

        return res.status(200).json(
            { message: "user created successfully", token: token, name: name, id: userResponse._id});
    }
    catch (err) {
        console.log(err)
        res.status(401).json({ message: "Something went wrong" })
    }
})

router.post("/login", async (req, res) => {
    try {
        const { emailOrMobile, password } = req.body;
        if (!emailOrMobile || !password)
            return res.status(400).json({ message: "bad request" });

        if (!isNaN(emailOrMobile)) {
            userDetails = await user.findOne({ mobNo: emailOrMobile });
        } else {
            userDetails = await user.findOne({ email: emailOrMobile });
        }

        if (!userDetails) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const passwordMatch = await bcrypt.compare(password, userDetails.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = await jwt.sign(
            { userID: userDetails._id },
            process.env.JWT_SECRET)

        return res.status(200).json(
            { message: "user logged in successfully", token: token, name: userDetails.name, id: userDetails._id });


    }
    catch (err) {
        console.log(err)
        res.status(401).json({ message: "Something went wrong" })
    }
})

router.get("/cart/getcartitems", async (req,res)=>{
    try{
        const {userId} = req.query;

        const userDetails = await user.findById(userId);
        
        if(!userDetails){
            return res.status(404).json({ message: 'User not found' });
        }

        const cartItems = userDetails.cart;
        res.status(200).json({ cartItems });

    }
    catch(err){

    }
})

router.post("/cart/addtocart", verifyJwt, async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const userDetails = await user.findById(userId);
        if (!userDetails) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingCartItem = userDetails.cart.find(cartItem => cartItem.productId == productId);

        if (existingCartItem) {
            existingCartItem.quantity += 1;
        } else {
            userDetails.cart.push({ productId, quantity: 1 });
        }

        await userDetails.save();

        res.status(200).json({ cart: userDetails.cart });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get("/cart/gettotalquantity", async (req, res) => {
    try {
        const { userId } = req.query;

        const userDetails = await user.findById(userId);
        if (!userDetails) {
            return res.status(404).json({ message: 'User not found' });
        }

        let totalQuantity = 0;
        userDetails.cart.forEach(cartItem => {
            totalQuantity += cartItem.quantity;
        });

        res.status(200).json({ totalQuantity });
    } catch (error) {
        console.error('Error getting total quantity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/feedback', verifyJwt, async (req, res) => {
    const { userId, type, text } = req.body;

    try {
        const userDetails = await user.findById(userId);
        if (!userDetails) {
            return res.status(404).json({ message: 'User not found' });
        }

        userDetails.feedback.push({ type, text });
        await userDetails.save();

        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/cart/users/:userId/cart/:itemId', async (req, res) => {
    const { userId, itemId } = req.params;
    const { newQuantity } = req.body;
  
    try {
      const userDetails = await user.findById(userId);
  
      if (!userDetails) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const cartItem = userDetails.cart.find(item => item.productId.toString() === itemId);
  
      if (!cartItem) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }
  
      cartItem.quantity = newQuantity;
  
      await userDetails.save();
  
      res.status(200).json({newQuantity});
    } catch (error) {
      console.error('Error updating item quantity:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

router.post('/place-order/:userId', verifyJwt, async (req, res) => {
    try {
        const { address, paymentMode, finalPrice, cartItems } = req.body;
        const {userId} = req.params;

        const userDetails = await user.findById(userId);

        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newInvoice = {
            address,
            paymentMode,
            finalPrice,
            cartItems
        };

        userDetails.invoices.push(newInvoice);
        await userDetails.save();

        res.status(201).json({ message: 'Order placed successfully'});
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/invoices/:userId/', verifyJwt, async (req, res) => {
    const { userId } = req.params;

    try {
        const userDetails = await user.findById(userId).populate({
            path: 'invoices',
            populate: {
                path: 'cartItems',
                model: 'items'
            }
        });

        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const invoices = userDetails.invoices;

        res.status(200).json(invoices);
    } catch (error) {
        console.error('Error fetching invoice data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


  

module.exports = router;