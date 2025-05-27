"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";


export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const resMe = await fetch("/api/me");
        if (!resMe.ok) throw new Error("Unauthorized");

        const currentUser = await resMe.json();

        if (currentUser.role !== "admin") {
          router.push("/profile");
          return;
        }

        setAuthorized(true);

        const usersRes = await fetch("/api/users");
        const tasksRes = await fetch("/api/tasks");

        const usersData = await usersRes.json();
        const tasksData = await tasksRes.json();

        setUsers(usersData);
        setTasks(tasksData);
      } catch (error) {
        console.error("Error loading admin data:", error);
        router.push("/profile");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function handleRoleChange(userId, newRole) {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const updatedUser = await res.json();
      setUsers((prev) =>
        prev.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );
    } catch (error) {
      alert("Failed to update role");
    } finally {
      setUpdatingUserId(null);
    }
  }

  // async function handleLogout() {
  //   try {
  //     await fetch("/api/auth/signout", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //     });
  //     router.push("/");
  //   } catch (error) {
  //     console.error("Failed to log out:", error);
  //   }
  // }

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading admin dashboard...</p>;
  if (!authorized) return null;

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      {/* Logout button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
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

      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#333" }}>Admin Dashboard</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", borderBottom: "1px solid #ccc", paddingBottom: "0.5rem" }}>Users</h2>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {users.map((user) => (
            <li
              key={user._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>{user.name}</span>
              <span>{user.email}</span>
              <select
                disabled={updatingUserId === user._id}
                value={user.role}
                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </li>
          ))}
        </ul>
      </section>

     <section>
  <h2 style={{ fontSize: "1.5rem", borderBottom: "1px solid #ccc", paddingBottom: "0.5rem" }}>Tasks</h2>
  {users.map((user) => {
    const userTasks = tasks.filter((task) => task.userEmail === user.email);
    return (
      <div key={user._id} style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.2rem", color: "#555", marginBottom: "0.5rem" }}>
          Tasks for {user.email}
        </h3>
        {userTasks.length > 0 ? (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {userTasks.map((task) => (
              <li
                key={task._id}
                style={{
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  <strong>{task.title}</strong>{" "}
                  <span style={{ color: task.completed ? "green" : "orange" }}>
                    ({task.completed ? "Completed" : "Incomplete"})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#888" }}>No tasks assigned.</p>
        )}
      </div>
    );
  })}

 
</section>

    </main>
  );
}
