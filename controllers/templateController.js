const supabase = require("../supabaseClient");

exports.getTemplateImages = async (req, res) => {
  try {
    const { data, error } = await supabase.storage
      .from("images")
      .list("templates", {
        limit: 100,
        offset: 0,
        sortBy: { 
          column: "name", 
          order: "asc",
        },
      });

    if (error) {
      console.error("Error listing template images:", error);
      return res.status(500).json({ error: "Failed to list template images" });
    }

    // generate public url for themes
    const imageUrls = data.map((file) => {
      const { 
        data: publicUrlData,
      } = supabase.storage
        .from("images")
        .getPublicUrl(`templates/${file.name}`);
      return {
        name: file.name,
        url: publicUrlData.publicUrl,
      };
    });

    res.json(imageUrls);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
