const supabase = require("../supabaseClient");

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("Fetching order with ID:", id);

        // Buscar os dados do pedido
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

        // Buscar imagens associadas ao pedido
        const { data: imagesData, error: imagesError } = await supabase
            .from("order_images")
            .select("image_url")
            .eq("order_id", id);

        if (imagesError) {
            console.error("Error fetching images:", imagesError);
            return res.status(500).json({ error: "Failed to retrieve images" });
        }

        // Retornar dados do pedido com as imagens associadas
        res.json({ ...orderData, images: imagesData.map(img => img.image_url) });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
