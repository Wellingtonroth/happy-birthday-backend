const supabase = require("../supabaseClient");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.uploadMiddleware = upload.single("image");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const { buffer, originalname, mimetype } = req.file;
    const filePath = `user-uploads/${Date.now()}-${originalname}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, buffer, {
        contentType: mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return res.status(500).json({ error: "Failed to upload image to Supabase" });
    }

    const publicUrlResponse = supabase.storage.from("images").getPublicUrl(filePath);
    const publicUrl = publicUrlResponse.data.publicUrl;

    if (!publicUrl) {
      return res.status(500).json({ error: "Failed to retrieve public image URL" });
    }

    return res.json({ imageUrl: publicUrl });
  } catch (error) {
    return res.status(500).json({ error: "Failed to upload image" });
  }
};
