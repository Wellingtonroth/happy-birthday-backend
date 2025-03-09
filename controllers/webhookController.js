const supabase = require("../supabaseClient");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Update Supabase order as paid
      const { error } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("stripe_session", session.id);

      if (error) throw error;
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(400).send(`Webhook error: ${error.message}`);
  }
};
