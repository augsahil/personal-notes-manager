import api from "../lib/api";
import { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin ? { email, password } : { name, email, password };
      const res = await api.post(endpoint, payload);
      localStorage.setItem("token", res.data.token);
      onClose();
      window.location.href = "/dashboard"; // redirect after login/register
    } catch (err) {
      let errorMessage = "Auth failed";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;
        errorMessage = response?.data?.message || errorMessage;
      }
      alert(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay with blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose} // close modal if user clicks outside
      ></div>

      {/* Modal content */}
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
              className="bg-indigo-500 text-white px-4 py-2 rounded"
            >
              {isLogin ? "Login" : "Register"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-red-500 px-2 py-1"
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
