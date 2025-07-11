import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/login", 
        new URLSearchParams({
          username,
          password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const token = response.data.access_token;
      if (!token) throw new Error("No token received");

      localStorage.setItem("token", token);
      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err.response?.data?.detail || "Login failed. Check credentials.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-300 p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-700 mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-500">Please login to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          
          <div className="flex items-center border rounded px-3 py-2">
            <FaUser className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full outline-none"
              required
            />
          </div>

          
          <div className="flex items-center border rounded px-3 py-2">
            <FaLock className="text-gray-400 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-blue-600 hover:underline ml-2"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:underline"
            >
              Register
            </button>
          </div>

          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
