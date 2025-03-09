const supabase = require("../supabaseClient");

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params; 

    console.log("Fetching order with ID:", id);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      return res.status(500).json({ error: "Failed to retrieve order" });
    }

    if (!data) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
