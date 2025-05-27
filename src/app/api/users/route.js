import { connectMongoose } from "@/lib/mongoose"; 
import User from "../../models/user"; 

export async function GET() {
  try {
    await connectMongoose(); 

    const users = await User.find({}, { password: 0 }); 

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response("Failed to fetch users", { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectMongoose(); 

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return new Response("Missing userId or role", { status: 400 });
    }

    if (!["user", "admin"].includes(role)) {
      return new Response("Invalid role", { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const userObj = user.toObject();
    delete userObj.password;

    return new Response(JSON.stringify(userObj), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return new Response("Failed to update user role", { status: 500 });
  }
}