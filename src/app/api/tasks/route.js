import { connectMongoose } from "../../../lib/mongoose";
import Task from "../../models/task";

export async function GET(request) {
  try {
    await connectMongoose(); // ✅ Ensure Mongoose connection
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");
    const tasks = userEmail
      ? await Task.find({ userEmail }).lean()
      : await Task.find({}).lean();

    return Response.json(tasks, { status: 200 });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return Response.json({ message: "Failed to fetch tasks" }, { status: 500 });
  }
}
// POST: Create a new task
export async function POST(request) {
  try {
   await connectMongoose();

    const { title, userEmail } = await request.json();

    if (!title || !userEmail) {
      return Response.json(
        { message: "Missing title or userEmail" },
        { status: 400 }
      );
    }

    const newTask = await Task.create({ title, userEmail, completed: false });

    return Response.json(newTask, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return Response.json(
      { message: "Failed to create task" },
      { status: 500 }
    );
  }
}

// PUT: Update a task
export async function PUT(request) {
  try {
    await connectMongoose();

    const { taskId, title, completed } = await request.json();

    if (!taskId) {
      return Response.json({ message: "Missing taskId" }, { status: 400 });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed }),
      },
      { new: true }
    );

    if (!updatedTask) {
      return Response.json({ message: "Task not found" }, { status: 404 });
    }

    return Response.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("PUT /api/tasks error:", error);
    return Response.json(
      { message: "Failed to update task" },
      { status: 500 }
    );
  }
}
