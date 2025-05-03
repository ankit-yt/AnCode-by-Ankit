import React from "react";
import Markdown from "markdown-to-jsx";
import "highlight.js/styles/github.css"; // Light theme
import Lottie from "lottie-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import gradient from "../../public/assests/gradient.json";
const Message = ({ isAi, email, text, type, setFileTree, isAiWriting }) => {
  const align = type === "incoming" ? "items-start" : "items-end";
  const margin = type === "incoming" ? "self-start" : "self-end";
  const bg = type === "incoming" ? "bg-gray-200" : "bg-blue-200";

  const content = isAi ? JSON.parse(text).text : text;
  const codeContent = isAi ? JSON.parse(text).fileTree : "";

  console.log("inside message container");

  const markdown = (
	<div className="rounded-gradient-box prose prose-invert">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeHighlight]}
  >
    {content}
  </ReactMarkdown>
</div>

  );

  return (
    <div className={`flex flex-col relative ${align} ${margin} `}>
      <small className={`text-xs ${isAi ? "" : "opacity-60"}`}>
        {isAi ? (
          <Lottie animationData={gradient} loop={true} className="w-6   h-6" />
        ) : (
          email
        )}
      </small>
      {isAi ? (
        markdown
      ) : (
        <p
  className={`text-sm break-words max-w-52 mt-1 p-2 px-3 rounded-xl 
    bg-gradient-to-br from-blue-100 border-r-4 to-blue-200 text-gray-900 shadow-sm border border-blue-300`}
>
  {text}
</p>

      )}
    </div>
  );
};

export default Message;
