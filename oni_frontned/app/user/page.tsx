"use client";

import toast from "react-hot-toast";
import { useState } from "react";
import { useAuth } from "../components/Auth/Auth";

export default function UserPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { user } = useAuth(); 

  const handleChange = (event: { target: { name: string; value: string } }) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast.error("Login required");
      return;
    }
    const form = event.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value;
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value;
    const data = { fullName: name, email, password };
    try {
      const createRes = await fetch(`${process.env.NEXT_PUBLIC_NEST_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const createResult = await createRes.json();

      if (!createRes.ok) {
        toast.error(createResult.error || "user creation failed.");
        return;
      }
      setForm({
        name: "",
        email: "",
        password: "",
      });
      toast.success("User created successfully!");
      setShowAuth(false);
    } catch (err) {
      toast.error("An error occurred while creating the user.");
    }
  };
  return (
    <div
      style={{
        width: "350px",
        margin: "0 auto",
        paddingTop: "100px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {showAuth && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            background: "#000",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          <input
            type="text"
            placeholder="Name"
            autoComplete="off"
            value={form.name}
            onChange={handleChange}
            name="name"
            style={{
              padding: "8px",
              borderRadius: "6px",
            }}
          />
          <input
            type="text"
            placeholder="E-mail"
            autoComplete="off"
            value={form.email}
            onChange={handleChange}
            name="email"
            style={{
              padding: "8px",
              borderRadius: "6px",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="off"
            value={form.password}
            onChange={handleChange}
            name="password"
            style={{
              padding: "8px",
              borderRadius: "6px",
            }}
          />
          <button type="submit">Submit</button>
        </form>
      )}
      <button
        onClick={() => {
          if (!user) {
            toast.error("Login required");
            return;
          }
          setShowAuth(true);
        }}
      >
        Create User
      </button>
    </div>
  );
}