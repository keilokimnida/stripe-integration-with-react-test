const { findCartItemsByAccountID, insertCartItem, findCartItemByAccountIDAndProductID, updateCartItem, deleteCartItem, deleteAllCartItemByAccountID } = require('../services/cart');

// Get cart by account id
module.exports.findCartItemsByAccountID = async (req, res) => {
    try {
        const accountID = parseInt(req.params.accountID);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        const cart = await findCartItemsByAccountID(accountID);
        if (!cart) return res.status(404).json({
            message: `\"cart\" not found for ${accountID}`
        });

        return res.status(200).send(cart);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > cart.js! " + error);
    }
};

// insert cart item
module.exports.insertCartItem = async (req, res) => {
    try {
        const accountID = parseInt(req.body.accountID);
        const productID = parseInt(req.body.productID);
        const quantity = parseInt(req.body.quantity);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        if (isNaN(productID)) return res.status(400).json({
            message: "Invalid parameter \"productID\""
        });

        if (isNaN(quantity)) return res.status(400).json({
            message: "Invalid parameter \"quantity\""
        });

        await insertCartItem(accountID, productID, quantity);
        return res.status(201).send("Cart item inserted successfully!");

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > cart.js! " + error);
    }
};

// update cart item
module.exports.updateCartItem = async (req, res) => {
    try {
        const accountID = parseInt(req.body.accountID);
        const productID = parseInt(req.body.productID);
        const quantity = parseInt(req.body.quantity);

        if (isNaN(accountID)) return res.status(400).json({
            message: "Invalid parameter \"accountID\""
        });

        if (isNaN(productID)) return res.status(400).json({
            message: "Invalid parameter \"productID\""
        });

        if (isNaN(quantity)) return res.status(400).json({
            message: "Invalid parameter \"quantity\""
        });

        const toBeUpdated = await findCartItemByAccountIDAndProductID(accountID, productID);

        if (!toBeUpdated) return res.status(404).send();

        if (toBeUpdated.quantity === 1) {
            await updateCartItem(toBeUpdated, quantity);
        } else {
            await deleteCartItem(accountID, productID);
        }

        return res.status(204).send();

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > cart.js! " + error);
    }
};

// clear cart item
module.exports.deleteCartItem = async (req, res) => {
    try {
        const accountID = parseInt(req.body.accountID);
        const productID = parseInt(req.body.productID);

        const toBeDeleted = await findCartItemByAccountIDAndProductID(accountID, productID);
        if (!toBeDeleted) return res.status(404).send();

        await deleteCartItem(accountID, productID);

        return res.status(204).send();

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > cart.js! " + error);
    }
};

// clear entire cart
module.exports.deleteAllCartItemByAccountID = async (req, res) => {
    try {
        const accountID = parseInt(req.body.accountID);

        const cartExist = await findCartItemsByAccountID(accountID);

        if (!cartExist) return res.status(404).send();

        await deleteAllCartItemByAccountID(accountID);

        return res.status(204).send();

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in controller > cart.js! " + error);
    }
};