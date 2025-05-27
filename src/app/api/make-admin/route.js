import { connectMongoose } from "@/lib/mongoose";
import User from "../../models/user";

export async function GET() {
  try {
    await connectMongoose();

    const email = "mehboobaliali150@gmail.com";

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return new Response("User not found", { status: 404 });
    }

    // Update role to admin
    existingUser.role = "admin";
    await existingUser.save();

    const userObj = existingUser.toObject();
    delete userObj.password;

    return new Response(JSON.stringify({
      message: "User promoted to admin successfully",
      user: userObj
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error making admin:", error);
    return new Response("Failed to make admin", { status: 500 });
  }
}
