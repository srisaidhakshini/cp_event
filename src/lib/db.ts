console.log("DEBUG: All Env Keys:", Object.keys(process.env).filter(key => key.includes("MONGO")));

import mongoose from "mongoose";

export async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("MongoDB connected");
  console.log("URI:", process.env.MONGODB_URI);

}
