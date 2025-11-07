"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, Brain, Share2, PenLine } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Props {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LearnMoreSection({ isOpen, setOpen }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isOpen]);

  return (
    <div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35 }}
            className="mt-8 w-full max-w-6xl px-4 md:px-6"
          >
            <div className="bg-white/6 backdrop-blur-md border border-gray-700 rounded-2xl p-6 md:p-8 shadow-lg overflow-hidden">
              <h3 className="text-center text-2xl md:text-3xl font-semibold text-indigo-300 mb-6">
                What Makes Personal Notes Manager Special?
              </h3>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 w-full md:w-56 flex flex-col gap-4 items-center md:items-start">
                  <div className="w-20 h-32 md:h-40 bg-indigo-500/10 rounded-3xl hidden md:flex items-center justify-center">
                    <PenLine size={40} />
                  </div>

                  <ul className="space-y-4 mt-2 md:mt-6 w-full">
                    <li className="flex items-center gap-3">
                      <div className="bg-indigo-600 p-2 rounded-full">
                        <Sparkles size={18} />
                      </div>
                      <span className="text-white font-medium">
                        Smart Organization
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      <div className="bg-green-600 p-2 rounded-full">
                        <Lock size={18} />
                      </div>
                      <span className="text-white font-medium">
                        Privacy First
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      <div className="bg-purple-600 p-2 rounded-full">
                        <Brain size={18} />
                      </div>
                      <span className="text-white font-medium">
                        AI Insights
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      <div className="bg-sky-600 p-2 rounded-full">
                        <Share2 size={18} />
                      </div>
                      <span className="text-white font-medium">Cloud Sync</span>
                    </li>
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-white/4 to-white/2 border border-gray-600 rounded-xl p-6 md:p-8">
                    <div className="space-y-6 text-gray-200">
                      <div>
                        <h4 className="text-white text-lg font-semibold">
                          Smart Organization
                        </h4>
                        <p className="text-sm mt-2 text-gray-300">
                          Create, edit, and search notes effortlessly. Notes are
                          auto-sorted and stored securely under your account.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white text-lg font-semibold">
                          Privacy First
                        </h4>
                        <p className="text-sm mt-2 text-gray-300">
                          Your notes are private — visible only to you. Every
                          action is protected with JWT-based authentication.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white text-lg font-semibold">
                          AI-Powered Insights
                        </h4>
                        <p className="text-sm mt-2 text-gray-300">
                          Analyze your writing and get intelligent summaries and
                          suggestions using the integrated analytics service.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white text-lg font-semibold">
                          Cloud Sync
                        </h4>
                        <p className="text-sm mt-2 text-gray-300">
                          Access your notes from any device — seamless sync and
                          offline-friendly behaviour keep you productive.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/6 mt-2 text-center">
                        <button
                          onClick={() => {
                            setOpen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-full transition"
                        >
                          Back to Top
                        </button>
                      </div>
                    </div>
                  </div>
                </div>{" "}
              </div>{" "}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
