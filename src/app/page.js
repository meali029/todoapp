"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRoleAndRedirect() {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/me");
          const user = await res.json();

          if (user?.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/profile");
          }
        } catch (err) {
          console.error("Failed to fetch user role:", err);
          router.push("/profile");
        }
      }
      if (status === "unauthenticated") {
        setLoading(false);
      }
    }

    checkRoleAndRedirect();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", color: "#555" }}>Loading...</h2>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "2rem",
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#f9f9f9",
        color: "#333",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Welcome to the App</h1>
      <p style={{ marginBottom: "1.5rem" }}>Please sign in to continue</p>
      <button
        onClick={() => signIn("google")}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#0070f3",
          color: "#fff",
          width: "fit-content",
          margin: "0 auto",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "none",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Sign in with Google
      </button>
    </main>
  );
}
