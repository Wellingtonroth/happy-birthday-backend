const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL and Anon Key are required!");
}

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY, 
  {
    auth: {
      persistSession: false,
    },
  }
);
module.exports = supabase;
