"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal";
import api from "../lib/api";
import { getToken, isTokenValid } from "../lib/auth";
import { ArrowRight } from "lucide-react";

export default function GoToDashboardButton() {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [checking, setChecking] = useState(false);

  const openAuth = () => setShowAuth(true);
  const closeAuth = () => setShowAuth(false);

  const handleSuccess = () => {
    closeAuth();
    router.push("/dashboard");
  };

  const handleClick = async () => {
    setChecking(true);
    try {
      const token = getToken();

      if (isTokenValid(token)) {
        try {
          await api.get("/auth/validate");
          router.push("/dashboard");
          return;
        } catch (err) {
          console.warn("Server validation failed or token revoked:", err);
        }
      }

      openAuth();
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={checking}
        className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg"
      >
        {checking ? "Checking..." : "Go to Dashboard"}
        <ArrowRight size={18} />
      </button>

      {showAuth && <AuthModal onClose={closeAuth} onSuccess={handleSuccess} />}
    </>
  );
}
