const supabase = require("../supabaseClient");

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Fetching order with ID:", id);

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderError) {
      console.error("Error fetching order:", orderError);
      return res.status(500).json({ error: "Failed to retrieve order" });
    }

    if (!orderData) {
      return res.status(404).json({ error: "Order not found" });
    }

    const { data: imagesData, error: imagesError } = await supabase
      .from("order_images")
      .select("image_url")
      .eq("order_id", id);

    if (imagesError) {
      console.error("Error fetching images:", imagesError);
      return res.status(500).json({ error: "Failed to retrieve images" });
    }

    res.json({ ...orderData, images: imagesData.map((img) => img.image_url) });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
