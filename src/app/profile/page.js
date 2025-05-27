"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserTasks();
    }
  }, [status]);

  async function fetchUserTasks() {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?userEmail=${session.user.email}`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTask() {
    if (!newTask.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask, userEmail: session.user.email }),
      });

      if (!res.ok) throw new Error("Failed to create task");
      const created = await res.json();
      setTasks((prev) => [...prev, created]);
      setNewTask("");
    } catch (error) {
      console.error(error);
      alert("Failed to create task");
    }
  }

  async function handleEditTask(taskId) {
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, title: editedTitle }),
      });

      if (!res.ok) throw new Error("Failed to edit task");
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((task) => (task._id === updated._id ? updated : task))
      );
      setEditingTaskId(null);
      setEditedTitle("");
    } catch (error) {
      console.error(error);
      alert("Failed to edit task");
    }
  }

 
  async function toggleTaskCompletion(taskId, currentStatus) {
    setUpdatingTaskId(taskId);
    try {
      const res = await fetch(`/api/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed: !currentStatus }),
      });

      const updatedTask = await res.json();
      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      );
    } catch (error) {
      console.error(error);
      alert("Error updating task");
    } finally {
      setUpdatingTaskId(null);
    }
  }

  if (status === "loading") return <p style={{ padding: "2rem" }}>Loading profile...</p>;
  if (status === "unauthenticated") return <p style={{ padding: "2rem" }}>Please log in to view your profile.</p>;

  return (
    <main style={{ padding: "2rem", backgroundColor: "#f0f4f8", minHeight: "100vh" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
  <h1 style={{ fontSize: "2rem" }}>
    Welcome, {session.user.name || session.user.email}
  </h1>
  <button
    onClick={() => signOut({ callbackUrl: "/" })}
    style={{
      padding: "0.5rem 1rem",
      backgroundColor: "#e63946",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      marginLeft: "1rem"
    }}
  >
    Logout
  </button>
</div>


      <div style={{ display: "flex", marginBottom: "1rem", gap: "1rem" }}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New Task"
          style={{ flexGrow: 1, padding: "0.5rem" }}
        />
        <button onClick={handleAddTask} style={{ padding: "0.5rem 1rem", background: "#0070f3", color: "white", border: "none", borderRadius: "6px" }}>
          Add
        </button>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks found. Start by adding a new task!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map((task) => (
            <li
              key={task._id}
              style={{
                background: "#fff",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {editingTaskId === task._id ? (
                <input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  style={{ flexGrow: 1, padding: "0.5rem" }}
                />
              ) : (
                <span
                  style={{
                    textDecoration: task.completed ? "line-through" : "none",
                    fontSize: "1.1rem",
                    flexGrow: 1,
                  }}
                >
                  {task.title}
                </span>
              )}

              {editingTaskId === task._id ? (
                <button onClick={() => handleEditTask(task._id)} style={{ marginLeft: "0.5rem" }}>
                  Save
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingTaskId(task._id);
                    setEditedTitle(task.title);
                  }}
                  style={{ marginLeft: "0.5rem" ,
                     padding: "0.5rem",
                  backgroundColor: "#0070f3",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  }}
                >
                  Edit
                </button>
              )}

              <button
                disabled={updatingTaskId === task._id}
                onClick={() => toggleTaskCompletion(task._id, task.completed)}
                style={{
                  marginLeft: "0.5rem",
                  padding: "0.5rem",
                  backgroundColor: task.completed ? "#ffa500" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                {task.completed ? "Mark Incomplete" : "Mark Complete"}
              </button>
              
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}