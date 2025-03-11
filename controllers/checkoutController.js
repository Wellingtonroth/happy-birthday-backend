const supabase = require("../supabaseClient");

exports.handleCheckout = async (req, res) => {
  try {
    const { name, age, email, message, plan, theme, images } = req.body;

    if (!name || !email || !plan || !theme) {
      return res.status(400).json({ error: "❌ Missing required fields" });
    }

    console.log("📦 Recebendo checkout:", { name, age, email, plan, theme });
    console.log("🖼️ Imagens recebidas:", images);

    // 🔥 Criar o pedido na tabela "orders"
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([{ name, age, email, message, plan, theme, status: "pending" }])
      .select("id")
      .single();

    if (orderError) {
      console.error("❌ Order creation error:", orderError);
      return res.status(500).json({ error: "Failed to create order" });
    }

    const orderId = orderData.id;
    let storedImages = [];

    // 🔥 Se o plano for "premium", permitir salvar imagens
    if (plan === "premium" && images && images.length > 0) {
      const imageRecords = images.map((url) => ({
        order_id: orderId,
        image_url: url,
      }));

      const { error: imageError } = await supabase
        .from("order_images")
        .insert(imageRecords);

      if (imageError) {
        console.error("❌ Image saving error:", imageError);
        return res.status(500).json({ error: "Failed to save images" });
      }

      storedImages = images;
    } else {
      console.log("⚠️ Nenhuma imagem foi salva, pois o plano não é premium ou não possui upload de imagem.");
    }

    res.json({
      success: true,
      message: "✅ Order stored successfully!",
      orderId,
      images: storedImages,
    });
  } catch (error) {
    console.error("❌ Checkout Error:", error);
    res.status(500).json({ error: "Failed to store order" });
  }
};
