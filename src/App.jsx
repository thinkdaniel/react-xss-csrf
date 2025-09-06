import { useState } from "react";
import DOMPurify from "dompurify";

import Button from "./components/Button";
import Input from "./components/Input";
import Comments from "./components/Comments";
import Search from "./components/Search";
import ReadDOMElement from "./components/ReadDOMElement";

// import "./third-party";

const BASE_URL = "http://localhost:3000";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password)
      return alert("Please enter username and password");

    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // send/accept cookies
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    console.log(data);

    if (res.ok && data.token) {
      // Save token to localStorage
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
    } else {
      setError(data.error || "Login failed");
    }

    setPassword("");
  };

  const handleLogout = async () => {
    const res = await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      setIsLoggedIn(false);
      setUsername("");
      setPassword("");
      // Clear token from localStorage
      localStorage.removeItem("token");
    }
  };

  return (
    <div>
      <header className="mb-4 flex items-center justify-between bg-yellow-400 px-5 py-4">
        <span className="text-2xl font-bold uppercase">🏦 CMI Bank</span>
        <span className="text-xl">👨🏻‍💼 {isLoggedIn ? username : "Login"}</span>
      </header>
      {error && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur"
          onClick={() => setError("")}
        >
          <div className="rounded bg-red-500 px-6 py-4 text-lg font-semibold text-white shadow-lg">
            {error}
          </div>
        </div>
      )}
      <div className="px-4">
        {isLoggedIn && (
          <div className="mb-6">
            <p className="mb-2">Welcome back, {username.toUpperCase()}!</p>
            <h2 className="mb-1 font-semibold">Account Balance:</h2>
            <p className="mb-8">
              <span className="font-bold text-yellow-900">$8,888.88 </span>
              <span className="text-xs">
                as of
                <time> {new Date().toLocaleDateString()}</time>
              </span>
            </p>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        )}
        {!isLoggedIn && (
          <form
            className="mb-8 flex max-w-sm flex-col gap-3 rounded-md p-6 shadow"
            onSubmit={handleLogin}
          >
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit">Login</Button>
          </form>
        )}
        <Search />
        <Comments />
        <ReadDOMElement />
      </div>
    </div>
  );
}

export default App;
