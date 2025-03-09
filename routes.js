const express = require("express");
const { handleCheckout } = require("./controllers/checkoutController");
const { handleWebhook } = require("./controllers/webhookController");
const { getOrderById } = require("./controllers/orderController");
const { uploadImage, uploadMiddleware } = require("./controllers/uploadController");

const router = express.Router();

router.post("/checkout", handleCheckout);
router.post("/webhook", handleWebhook);
router.get("/order/:id", getOrderById);
router.post("/upload-image", uploadMiddleware, uploadImage);

module.exports = router;
