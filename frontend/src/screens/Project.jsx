import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import axios from "../config/Axios";
import { initalizeSocket, receiveMessage, sendMessage } from "../config/socket";
import { UserDataContext } from "../context/UserContext";
import { getWebContainer } from "../config/webContainer";

import CodeMirror from "@uiw/react-codemirror";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { materialLight } from "@uiw/codemirror-theme-material";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { xml } from "@codemirror/lang-xml";
import { css } from "@codemirror/lang-css";

import "highlight.js/styles/github.css"; // If you're still using highlight.js elsewhere
import Message from "./Message";

import Lottie from "lottie-react";
import loader from "../../public/assests/loading.json";
import aiTyping from "../../public/assests/aiTyping.json";
import gradient from "../../public/assests/gradient.json";

import { FaPlay, FaSave, FaExternalLinkAlt } from "react-icons/fa";

function Project() {
  const location = useLocation();
  const sidePanelRef = useRef(null);
  const messageBoxRef = useRef(null);
  const { user } = useContext(UserDataContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [MarkdownContent, setMarkdownContent] = useState(null);
  const [fileTree, setFileTree] = useState({});
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAiWriting, setIsAiWriting] = useState(false)
  const [isIframeOpen, setIsIframeOpen] = useState(false)
  const [isIframeMaximize, setIsIframeMaximize] = useState(false)
  const [checkingupdatedfiletree, setCheckingupdatedfiletree] = useState({})
  const [isDeletingFile, setIsDeletingFile] = useState(false)
  const iFrameRef = useRef(null)
  const fileTreeRef = useRef(fileTree);

  useEffect(() => {
    if (currentFile && fileTree[currentFile]?.file?.contents) {
      setMarkdownContent(fileTree[currentFile].file.contents);
    } else {
      setMarkdownContent("");
    }
  }, [currentFile, fileTree]);

  // Fetch users and initialize socket
  useEffect(() => {
    if (!webContainer) {
      getWebContainer().then((res) => {
        setWebContainer(res);
        console.log("container started");
      });
    }
    
  
    const fetchData = async () => {
      try {
        initalizeSocket(location.state.project._id);
  
        const [userRes, projectRes] = await Promise.all([
          axios.get("/users/all"),
          axios.get(`/projects/get-project/${location.state.project._id}`),
        ]);
  
        // Set the file tree
        if (projectRes.data.project.fileTree) {
          setFileTree(projectRes.data.project.fileTree);
        } else {
          setFileTree({});
        }
  
        // Set users
        setAllUsers(userRes.data.users);
        setProjectUsers(projectRes.data.project.users);
  
        // Handle socket messages
        receiveMessage("project-message", (data) => {
          console.log("Received message:", data.message);
          if (webContainer && data.message?.fileTree) {
            webContainer.mount(data.message.fileTree);
          }
  
          setChatMessages((prev) => [...prev, { ...data, type: "incoming" }]);
  
          if (data.isAi) {
            setIsAiWriting(false);
  
            try {
              const parsed = JSON.parse(data.message);
              const codeMessage = parsed.fileTree;
  
              console.log("AI Message Parsed:", parsed);
  
              // Correct usage of setFileTree
              setFileTree((prev) => ({
                ...prev,
                ...codeMessage,
              }));
            } catch (err) {
              console.error("Failed to parse AI message:", err.message);
              // Optional: Show fallback or notification
            }
          }
        });
      } catch (error) {
        console.error("Error:", error.message);
      }
    };
  
    fetchData();
  }, [location.state.project._id]);
  
  

  // Animate side panel
  useGSAP(() => {
    gsap.to(sidePanelRef.current, {
      x: isSidePanelOpen ? 0 : "-100%",
      duration: 0.4,
      ease: "power2.inOut",
    });
  }, [isSidePanelOpen]);

  useGSAP(() => {
    gsap.to(iFrameRef.current, {
      x: isIframeOpen ? 0 : "100%",
      width: isIframeOpen ? "100%" : "0%",
      duration: 0.4,
      ease: "power2.inOut",
    });
  }, [isIframeOpen]);


  useEffect(() => {
    // GSAP animation will run once when the component mounts
    gsap.to(iFrameRef.current, {
      x: isIframeOpen ? 0 : "100%",
      width: isIframeOpen ? "100%" : "0%",
      duration: 0.4,
      ease: "power2.inOut",
    });
  }, []);

  useGSAP(() => {
    gsap.to(iFrameRef.current, {
     
      position: isIframeMaximize ? "fixed" : "relative",
      width: isIframeMaximize ? "100vw" : "100%",
      
      duration: 0.4,
      ease: "power2.inOut",
    });
  }, [isIframeMaximize]);

  // Scroll to bottom when new messages come
  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleUserClick = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const addCollaborator = async () => {
    try {
      await axios.put("/projects/add-user", {
        users: selectedUserIds,
        projectId: location.state.project._id,
      });
      setSelectedUserIds([]);
      setIsModalOpen(false);

      // Refresh project user list
      const res = await axios.get(
        `/projects/get-project/${location.state.project._id}`
      );
      setProjectUsers(res.data.project.users);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    const outgoingMessage = {
      message,
      sender: user._id,
      type: "outgoing",
      email: user.email,
    };

    sendMessage("project-message", {
      message,
      sender: user._id,
      email: user.email,
    });
    setChatMessages((prev) => [...prev, outgoingMessage]);
    setMessage("");
    if(message.includes('@ai')) setIsAiWriting(true)
  };

  const handleCodeChange = (value) => {
    if (!currentFile || !fileTree[currentFile]) return;
    
    setFileTree((prevFileTree) => ({
      ...prevFileTree,
      [currentFile]: {
        ...prevFileTree[currentFile],
        file: {
          ...prevFileTree[currentFile].file,
          contents: value,
        },
      },
    }));
    setMarkdownContent(value);
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };
  
  // Then wrap your handleCodeChange:
  const debouncedHandleCodeChange = debounce(handleCodeChange, 300);
  


  const getFileExtension = (filename) => {
    const parts = filename.split(".");
    return parts.length > 1 ? parts[parts.length - 1] : "";
  };

  const runApp = async () => {
    console.log("running app")
    try {
      setIsLoading(true);
      console.log(fileTree);
  
      await webContainer.mount(fileTree);
      console.log("Mounted successfully");
  
      // Install dependencies
      const installProcess = await webContainer.spawn('npm', ['install']);
      installProcess.output.pipeTo(new WritableStream({
        write(chunk) {
          console.log(chunk);
        },
      }));
  
      // ✅ Wait for install to complete
      await installProcess.exit;
  
      // Kill previous run process if running
      if (window.currentRunProcess) {
        try {
          await window.currentRunProcess.kill();
          console.log("Previous process killed.");
        } catch (err) {
          console.error("Failed to kill previous process:", err);
        }
      }
  
      // Start new process
      const runProcess = await webContainer.spawn('npm', ['start']);
      runProcess.output.pipeTo(new WritableStream({
        write(chunk) {
          console.log(chunk);
        },
      }));
  
      // Save new process reference globally or in state
      window.currentRunProcess = runProcess;
  
      // Listen for server-ready event
      webContainer.on('server-ready', (port, url) => {
        setIframeUrl(url);
        setIsIframeOpen(true)
        setIsLoading(false);
      });
  
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageExtension = (ext) => {
    switch (ext) {
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return javascript();
      case "py":
        return python();
      case "xml":
      case "html":
        return xml();
      case "css":
        return css();
      default:
        return [];
    }
  };
  
  
  

  const getCodeMirrorMode = (extension) => {
    switch (extension.toLowerCase()) {
      case "js":
        return "javascript";
      case "py":
        return "python";
      case "xml":
      case "html":
        return "xml";
      case "css":
        return "css";
      default:
        return null;
    }
  };

  useEffect(() => {
    fileTreeRef.current = fileTree;
  }, [fileTree]);

  const saveFileTree = async () => {
    setIsLoading(true);
    console.log("from function", fileTreeRef.current);
  
    try {
      await axios.put("/projects/update-file-tree", {
        projectId: location.state.project._id,
        fileTree: fileTreeRef.current
      });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (isDeletingFile) {
      saveFileTree();
      setIsDeletingFile(false);
    }
  }, [isDeletingFile]);
  

  return (
    <main className="h-screen w-screen flex overflow-hidden bg-gradient-to-br from-indigo-100 to-white">
      {isLoading && (
        <div className="loader w-screen h-screen absolute top-0 left-0 z-50 backdrop-blur-sm flex items-center justify-center">
          <Lottie animationData={loader} loop={true} className="w-48 h-48" />
        </div>
      )}
      {/* LEFT PANEL */}
      <section className="flex flex-col h-full w-1/4 bg-white shadow relative">
        <header className="flex justify-between items-center p-4 border-b bg-gray-50">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <i className="ri-add-line text-xl"></i>
            <span className="text-sm font-semibold">Add Collaborator</span>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(true)}
            className="text-xl text-gray-700 hover:text-gray-900"
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>

        {/* MESSAGES */}
        <div
          ref={messageBoxRef}
          className="flex-grow overflow-auto px-4 py-2 space-y-3 scrollbar-hide"
        >
          {chatMessages.map((msg, index) => {
            return (
              <Message
                setFileTree={setFileTree}
                key={index}
                email={msg.email || msg.sender}
                isAi={msg.isAi}
                text={msg.message}
                type={msg.type}
                isAiWriting={isAiWriting}
              />
            );
          })}{" "}
          {isAiWriting ? (
            <Lottie
              animationData={aiTyping}
              loop={true}
              className="w-10 h-10"
            />
          ) : null}
        </div>

        {/* INPUT */}
        <div className="flex border-t">
          <input
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            type="text"
            placeholder="Enter message..."
            className="flex-grow p-2 px-4 outline-none"
          />
          <button onClick={handleSend} className="bg-blue-700 text-white px-4">
            <i className="ri-send-plane-fill"></i>
          </button>
        </div>
      </section>

      <section className="right h-full w-3/4 flex  bg-[#f5f5f5] text-black font-mono">
        {/* Explorer Panel */}
        <div className="explorer w-64 bg-[#ffffff] border-r border-gray-300 p-2">
          <h2 className="text-xs text-gray-500 font-semibold mb-2 pl-1">
            EXPLORER
          </h2>
          <div className="fileTree space-y-1">
          {fileTree &&
  Object.keys(fileTree).map((file) => (
    <div className={`flex w-full rounded-md items-center ${
      currentFile === file
        ? "bg-blue-100 text-blue-700 font-medium"
        : "hover:bg-gray-100 text-gray-700"
    }`}>
      <button
      key={file}
      onClick={() => {
        if (openFiles.includes(file)) {
          setCurrentFile(file);
          return;
        } else {
          setCurrentFile(file);
          setOpenFiles([...openFiles, file]);
        }
      }}
      className={`treeElement flex items-center gap-2 px-3 py-1.5 w-full text-left rounded-md `}
    >
      <i className="ri-file-code-line text-blue-400"></i>
      <span className="text-sm">{file}</span>

      
    </button>
     <button
     onClick={(e) => {
      setIsDeletingFile(true)
       const updatedFileTree = { ...fileTree }; 
          delete updatedFileTree[file]; 
          console.log(updatedFileTree);
          setFileTree(updatedFileTree); 
          setCheckingupdatedfiletree(updatedFileTree)
          
          
      
     }}
     className="text-xs bg-red-500 rounded-md w-8 h-8 p-1 text-white hover:bg-red-600 cursor-pointer"
   >
     <i className="ri-delete-bin-line text-sm"></i> {/* Delete icon */}
   </button>
    </div>
  ))}

          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="codeEditor flex-grow flex scrollbar-hide w-[50%] break-words flex-col">
          {currentFile && fileTree[currentFile]?.file ? (
            <>
              {/* Header */}
              <div className="flex justify-between items-center w-full  px-4 py-2 bg-[#eeeeee] border-b border-gray-300">
                {/* Run & Save Buttons */}
                <div className="actions flex gap-4">
  {/* Run Button */}
  <button
    onClick={runApp}
    className="p-2 px-4 flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition duration-200"
  >
    <FaPlay className="text-lg" />
    <span>Run</span>
  </button>

  {/* Save Button */}
  <button
    onClick={saveFileTree}
    className="p-2 px-4 flex items-center gap-2 text-sm bg-green-500 hover:bg-green-600 rounded-lg text-white transition duration-200"
  >
    <FaSave className="text-lg" />
    <span>Save</span>
  </button>

  {/* Open Button */}
  <button
    onClick={() => setIsIframeOpen(true)}
    className="p-2 px-4 flex items-center gap-2 text-sm bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition duration-200"
  >
    <FaExternalLinkAlt className="text-lg" />
    <span>Open</span>
  </button>
</div>

                {/* Open File Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto">
                  <i className="ri-code-box-line text-blue-500"></i>
                  {openFiles.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                        currentFile === file
                          ? "bg-blue-200 text-blue-800"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      <button
                        onClick={() => setCurrentFile(file)}
                        className="text-sm font-medium focus:outline-none"
                      >
                        {file}
                      </button>
                      <button
                        onClick={() => {
                          const updatedFiles = openFiles.filter(
                            (f) => f !== file
                          );
                          setOpenFiles(updatedFiles);

                          if (currentFile === file) {
                            const newActive =
                              updatedFiles[index] ||
                              updatedFiles[index - 1] ||
                              null;
                            setCurrentFile(newActive);
                          }
                        }}
                        className="ml-1 text-gray-500 hover:text-red-500"
                      >
                        <i className="ri-close-line text-lg"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-grow h-full break-words scrollbar-hide overflow-auto">
              <CodeMirror
  value={MarkdownContent || ""}
  height="100%"
  theme={dracula}
  extensions={[getLanguageExtension(getFileExtension(currentFile))]}
  onChange={debouncedHandleCodeChange}
/>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-grow text-gray-400 text-sm">
              Click on a file to open it.
            </div>
          )}
        </div>
       
        <div
          ref={iFrameRef}
          className="flex flex-col   h-full bg-gray-900 text-white rounded-l-md  overflow-hidden shadow-lg">
            {/* Address Bar */}
            <div className="bg-gray-800 px-4 py-2 flex items-center space-x-3 border-b border-gray-700">
              <span
              onClick={() => {
                setIsIframeOpen(false)
                if (isIframeMaximize) {
                  setIsIframeMaximize(false)
                }
                }}
                className="w-3 h-3 rounded-full bg-red-500"
              ></span>
            <span
              onClick={()=> setIsIframeMaximize(!isIframeMaximize)}
              className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <input
                type="text"
                value={iframeUrl}
                onChange={(e) => setIframeUrl(e.target.value)}
                className="ml-4 flex-1 bg-gray-700 text-sm px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter URL"
                aria-label="Iframe URL input"
              />
            </div>

            {/* Iframe */}
            <iframe
              src={iframeUrl}
              title="WebContainer"
              ref={webContainer}
              className="flex-1 w-full border-none bg-white"
            ></iframe>
          </div>
      
      </section>

      {/* SIDE PANEL */}
      <aside
        ref={sidePanelRef}
        className="absolute top-0 left-0 w-80 h-full bg-white shadow-xl translate-x-[-100%] z-50"
      >
        <header className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="font-semibold">Collaborators</h2>
          <button onClick={() => setIsSidePanelOpen(false)}>
            <i className="ri-close-fill text-xl"></i>
          </button>
        </header>
        <div className="p-4 space-y-3">
          {projectUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 p-2 rounded-md bg-gray-100"
            >
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white">
                <i className="ri-user-fill"></i>
              </div>
              <span className="font-medium">{user.email}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-5">
            <header className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg">Select a User</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedUserIds([]);
                }}
              >
                <i className="ri-close-fill text-xl text-gray-500 hover:text-gray-700"></i>
              </button>
            </header>
            <div className="mt-4 max-h-64 overflow-y-auto">
              {allUsers.map((user) => (
                <div
                  key={user._id}
                  className={`flex items-center gap-3 my-1 p-2 cursor-pointer hover:bg-gray-100 rounded-md ${
                    selectedUserIds.includes(user._id)
                      ? "bg-gray-100 hover:bg-gray-200"
                      : ""
                  }`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white">
                    <i className="ri-user-fill"></i>
                  </div>
                  <span className="text-base">{user.email}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <button
                onClick={addCollaborator}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Collaborator
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Project;