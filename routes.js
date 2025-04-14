const express = require("express");
const { handleCheckout } = require("./controllers/checkoutController");
const { getOrderById } = require("./controllers/orderController");
const { uploadImages, uploadMiddleware } = require("./controllers/uploadController");
const { getTemplateImages } = require("./controllers/templateController");

const router = express.Router();

router.post("/checkout", handleCheckout);
router.get("/order/:id", getOrderById);
router.get("/template/images", getTemplateImages);
router.post("/upload-images", uploadMiddleware, uploadImages);

module.exports = router;
