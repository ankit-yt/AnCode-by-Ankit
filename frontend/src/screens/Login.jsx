import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/Axios";
import { UserDataContext } from "../context/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, setIstlogin } = useContext(UserDataContext);

  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();
    axios
      .post("/users/login", { email, password })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        setIstlogin(true);
        navigate("/");
      })
      .catch((e) => {
        console.log(e.response?.data || "Login failed");
      });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <div className="text-center mb-6">
        <h1 className="text-5xl font-black text-indigo-700 tracking-tight">Ancode</h1>
        <p className="text-gray-500 font-medium text-sm">Crafted by Ankit</p>
        <p className="mt-2 text-lg text-gray-600 italic">
          “Where developers sync, build, and preview in real time.”
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Welcome Back
        </h2>
        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
              Email Address
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2 font-medium">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200 font-semibold"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
