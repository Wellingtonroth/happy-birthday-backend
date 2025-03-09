const supabase = require("../supabaseClient");

exports.handleCheckout = async (req, res) => {
  try {
    const { 
      name, 
      age, 
      email, 
      message, 
      plan, 
      theme, 
      imageUrl,
    } = req.body;

    if (!name || !email || !plan || !theme) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase.from("orders").insert([
      {
        name,
        age,
        email,
        message,
        plan,
        theme,
        image_url: imageUrl || null,
      },
    ]);

    if (error) throw error;

    res.json({ success: true, message: "Order stored successfully!" });
  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ error: "Failed to store order" });
  }
};
