import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.config.js";
import User from "../models/User.model.js";

dotenv.config();

const required = ["MONGODB_URI", "ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing environment values: ${missing.join(", ")}`);
}

await connectDB();

const email = process.env.ADMIN_EMAIL.toLowerCase();

const existingUser = await User.findOne({ email });

if (existingUser) {
  throw new Error(`User with email ${email} already exists.`);
}

const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

await User.create({
  name: process.env.ADMIN_NAME,
  email,
  password,
  phone: process.env.ADMIN_PHONE || null,
  roles: ["admin"],
  accountStatus: "active",
});

console.log(`Admin account created: ${email}`);

process.exit(0);
