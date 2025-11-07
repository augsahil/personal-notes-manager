"use client";

import React from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";
import { removeToken } from "../lib/auth";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout endpoint error:", err);
    }

    removeToken();
    router.push("/");
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
    >
      Sign out
    </button>
  );
}
