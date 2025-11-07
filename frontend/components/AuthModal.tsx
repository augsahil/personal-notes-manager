"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";
import { setToken } from "../lib/auth";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ onClose, onSuccess }: Props) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin ? { email, password } : { name, email, password };

      const res = await api.post(endpoint, payload);

      if (res?.data?.token) {
        setToken(res.data.token);
      } else {
        if (typeof window !== "undefined" && res?.data?.token) {
          localStorage.setItem("token", res.data.token);
        }
      }

      onClose();

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      let errorMessage = "Auth failed";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;
        errorMessage = response?.data?.message || errorMessage;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white text-black p-6 rounded-lg w-96 shadow-xl z-10">
        <h2 className="text-xl font-bold mb-4 text-center">
          {isLogin ? "Login" : "Register"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-indigo-500 text-white px-4 py-2 rounded flex items-center gap-2"
              disabled={loading}
            >
              {loading
                ? isLogin
                  ? "Logging in..."
                  : "Registering..."
                : isLogin
                ? "Login"
                : "Register"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-red-500 px-2 py-1"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>

        <p className="text-sm mt-3 text-center text-gray-600">
          {isLogin ? (
            <>
              New user?{" "}
              <button
                className="text-indigo-500 font-medium"
                onClick={() => setIsLogin(false)}
                disabled={loading}
              >
                Register here
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-indigo-500 font-medium"
                onClick={() => setIsLogin(true)}
                disabled={loading}
              >
                Login here
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
