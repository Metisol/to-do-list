import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [darkmode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedMode = localStorage.getItem("darkmode") === "true";
    setDarkMode(savedMode);
    document.documentElement.classList.toggle("dark", savedMode);
  }, []);

  const toggleDarkmode = () => {
    const newMode = !darkmode;
    setDarkMode(newMode);
    localStorage.setItem("darkmode", newMode);
    document.documentElement.classList.toggle("dark", newMode);
  };

  const fetchTodos = async () => {
    let url = `http://127.0.0.1:8000/todos`;
    if (filter === "completed") url += "?completed=true";
    else if (filter === "active") url += "?completed=false";

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });

      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const data = await res.json();
      setTodos(data);
    } catch (error) {
      toast.error("Failed to fetch todos");
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [filter]);

  const addTodo = async () => {
    if (!title.trim()) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title }),
      });

      if (!res.ok ) {
        if (res.status === 401){

        toast.error("Session expired. Please login again.");
        navigate("/login");
        
      } else{
        toast.error("failed to add todo");
      }
       return;
    }
      setTitle("");
      fetchTodos();
      toast.success(" Todo added!");
    } catch {
      toast.error(" Network error While adding todo");
    }
  };

  const toggleTodo = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/todos/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      fetchTodos();
    } catch {
      toast.error("❌ Failed to toggle todo");
    }
  };

  const deleteTodo = async (id) => {
    setLoadingDeleteId(id);
    try {
      const res = await fetch(`http://127.0.0.1:8000/todos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      toast.success("🗑️ Todo deleted");
    } catch {
      toast.error("❌ Failed to delete todo");
    }
    setLoadingDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 flex flex-col items-center">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-4">📝 To-Do List</h1>

      <button
        onClick={toggleDarkmode}
        className="bg-gray-800 text-white px-4 py-1 rounded hover:bg-gray-600 text-sm mb-4"
      >
        {darkmode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <div className="flex space-x-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-800 dark:border-gray-600"
        />
        <button
          onClick={addTodo}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <div className="space-x-2 mb-6">
        {["all", "active", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded capitalize ${
              filter === f
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="w-full max-w-md space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`p-4 rounded-lg shadow flex justify-between items-center transition ${
              todo.completed
                ? "bg-green-100 dark:bg-green-500 line-through text-green-700 dark:text-green-200"
                : "bg-white dark:bg-gray-900"
            }`}
          >
            <span
              onClick={() => toggleTodo(todo.id)}
              className="cursor-pointer"
              title="Toggle complete"
            >
              {todo.title}
            </span>
            <button
              disabled={loadingDeleteId === todo.id}
              onClick={() => deleteTodo(todo.id)}
              className={`text-white px-3 py-1 rounded ${
                loadingDeleteId === todo.id
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-200 hover:bg-red-800"
              }`}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
