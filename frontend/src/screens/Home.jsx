import React, { useContext, useEffect, useState } from "react";
import { UserDataContext } from "../context/UserContext";
import axios from "../config/Axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Link, Users, XCircle , LogOut , Coffee} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const { user } = useContext(UserDataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/projects/all");
        setProjects(res.data.projects);
      } catch (error) {
        console.error("Error fetching projects:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (user === null) {
      const timeoutId = setTimeout(() => {
        console.log("No user found, navigating to login...");
        navigate("/login");
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [user]);

  const handleLogout = async () => {
    axios
      .get("/users/logout")
      .then((res) => {
        console.log(res.data);
        localStorage.removeItem("token");
        navigate("/login");
      })
      .catch((e) => {
        console.error("Error logging out:", e.message);
      });
  };

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/projects/create", { name: projectName });
      console.log(res.data);
      setProjects((prevProjects) => [...prevProjects, res.data.project]);
      setProjectName("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating project:", error.message);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const projectCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: {
      scale: 1.03,
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.98 },
  };

  return (
    <main className="min-h-screen bg-white dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Create Project CTA */}
      <div className="max-w-6xl mx-auto mb-8">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-white/70 dark:bg-gray-700 backdrop-blur-md border border-gray-200 dark:border-gray-600 rounded-xl p-6 text-left shadow-xl hover:shadow-2xl transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Create a New Project</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Click to add a new project to your list.</p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Project Grid */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Your Projects</h2>
        {!loading && projects?.length === 0 && (
  <div className="max-w-6xl h-96 flex flex-col justify-center items-center text-center text-gray-400">
    <div className="text-4xl mb-4">
      <Coffee />
    </div>
    <h1 className="text-xl font-semibold mb-2">No Projects Found</h1>
    <p className="text-sm mb-4">Looks like you haven't created any projects yet.</p>
    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
      Create Your First Project
    </button>
  </div>
)}

        {loading ? (
          <p className="text-gray-500 dark:text-gray-300">Loading projects...</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           
              <AnimatePresence>
                
              {projects.map((project) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-5 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
                  onClick={() => navigate("/project", { state: { project } })}
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate mb-2 capitalize">
                    {project.name}
                  </h3>
                  <div className="flex items-center text-sm text-indigo-500 dark:text-indigo-300">
                    <Users className="w-4 h-4 mr-1" />
                    Collaborators: {project.users.length}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Create New Project</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={createProject} className="space-y-4">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter project name"
                  required
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default Home;
