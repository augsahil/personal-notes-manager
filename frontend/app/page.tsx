"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, PenLine } from "lucide-react";
import axios from "axios";
import React, { useState } from "react";
import AuthModal from "../components/AuthModal";

export default function HomePage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleDashboardRedirect = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true); // open login modal
      return;
    }

    try {
      await axios.get("/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/dashboard");
    } catch {
      // token invalid / expired
      localStorage.removeItem("token");
      setShowLoginModal(true); // open login modal
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl text-center"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="bg-indigo-600 p-3 rounded-2xl shadow-lg"
          >
            <PenLine size={40} />
          </motion.div>
        </div>

        <h1 className="text-5xl font-extrabold mb-4 leading-tight">
          Organize Your <span className="text-indigo-400">Thoughts</span>{" "}
          Effortlessly
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Welcome to{" "}
          <span className="font-semibold text-indigo-400">
            Personal Notes Manager
          </span>{" "}
          — your private digital space to create, edit, and analyze notes
          seamlessly with AI insights.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            // onClick={() => router.push("/dashboard")}
            onClick={handleDashboardRedirect}
            className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Go to Dashboard
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() =>
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              })
            }
            className="border border-gray-500 hover:border-indigo-400 hover:text-indigo-300 px-6 py-3 rounded-full font-medium transition-all duration-300"
          >
            Learn More
          </button>
          {showLoginModal && (
            <AuthModal onClose={() => setShowLoginModal(false)} />
          )}
        </div>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 text-sm text-gray-500"
      >
        © {new Date().getFullYear()} Personal Notes Manager. Built with ❤️ using
        Next.js & Python.
      </motion.footer>
    </div>
  );
}
