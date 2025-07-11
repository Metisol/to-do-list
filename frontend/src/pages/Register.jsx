import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(`http://127.0.0.1:8000/auth/register`, {
        username,
        password,
      });
      alert("Registered! Now login.");
      navigate("/login");
    } catch (err) {
      setError("❌ Username already taken or server error.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full border px-3 py-2 rounded mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
