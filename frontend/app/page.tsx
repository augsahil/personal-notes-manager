"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, PenLine } from "lucide-react";
import axios from "axios";
import React, { useState } from "react";
import AuthModal from "../components/AuthModal";
import GoToDashboardButton from "@/components/GoToDashboardButton";
import LearnMoreSection from "@/components/LearnMoreSection";

export default function HomePage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [open, setOpen] = useState(false);

  const toggleSection = () => setOpen((s) => !s);

  const handleDashboardRedirect = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    try {
      await axios.get("/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/dashboard");
    } catch {
      localStorage.removeItem("token");
      setShowLoginModal(true);
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

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <GoToDashboardButton />
          <button
            onClick={toggleSection}
            aria-expanded={open}
            className="inline-flex items-center gap-2 border border-gray-500 hover:border-indigo-400 hover:text-indigo-300 px-6 py-3 rounded-full font-medium transition-all duration-300"
          >
            {open ? "Hide Details" : "Learn More"}
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <ChevronDown size={18} />
            </motion.span>
          </button>
        </div>
        {open && <LearnMoreSection isOpen={open} setOpen={setOpen} />}
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className={`${open ? "" : "absolute"} bottom-6 text-sm text-gray-500`}
      >
        © {new Date().getFullYear()} Personal Notes Manager. Built with ❤️ using
        Next.js & Python.
      </motion.footer>
    </div>
  );
}
