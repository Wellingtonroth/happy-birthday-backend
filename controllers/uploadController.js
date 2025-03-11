const supabase = require("../supabaseClient");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadMiddleware = upload.array("images", 3);

exports.uploadImages = async (req, res) => {
  try {
    const { orderId } = req.body;
    const files = req.files;

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("plan")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Erro ao buscar o pedido:", orderError);
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.plan !== "premium") {
      return res
        .status(403)
        .json({ error: "Image uploads allowed only for premium plans" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No images provided" });
    }

    const imageUrls = [];

    for (const file of files) {
      const { buffer, originalname, mimetype } = file;
      const filePath = `orders/${orderId}/${Date.now()}-${originalname}`;

      const { data, error } = await supabase.storage
        .from("images")
        .upload(filePath, buffer, { contentType: mimetype });

      if (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: "Failed to upload images" });
      }

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      if (publicUrl) {
        imageUrls.push(publicUrl);
      }
    }

    const imageRecords = imageUrls.map((url) => ({
      order_id: orderId,
      image_url: url,
    }));

    const { error: dbError } = await supabase
      .from("order_images")
      .insert(imageRecords);

    if (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({ error: "Failed to save image records" });
    }

    return res.json({ success: true, imageUrls });
  } catch (error) {
    console.error("Internal error uploading images:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
