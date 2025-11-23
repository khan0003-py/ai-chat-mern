import { useState } from "react";
import ReactMarkdown from "react-markdown";

// Terminal instructions
const INSTRUCTIONS = `
Welcome to AI Terminal Chat!

• Start by typing: start ai
• Then choose your model: use gemini or use perplexity
• Now ask questions directly.
• Switch models anytime with: use gemini or use perplexity
`;

const MODEL_NAMES = ["gemini", "perplexity"];

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeModel, setActiveModel] = useState("");
  const [aiStarted, setAiStarted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const parseInput = (raw) => {
    const trimmed = raw.trim();
    // Check for "use model_name"
    const match = trimmed.match(/^use\s+(\w+)$/i);
    if (match && MODEL_NAMES.includes(match[1].toLowerCase())) {
      return { isSwitch: true, model: match[1].toLowerCase(), question: "" };
    }
    return { isSwitch: false, model: activeModel, question: trimmed };
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    // Not started yet: only accept "start ai"
    if (!aiStarted) {
      if (input.trim().toLowerCase() === "start ai") {
        setAiStarted(true);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "system",
            provider: "",
            content: "✅ AI started. Select your model with 'use gemini' or 'use perplexity'.",
          },
        ]);
        setInput("");
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "system",
            provider: "",
            content: "❗ To begin, type: start ai",
          },
        ]);
        setInput("");
      }
      return;
    }

    const { isSwitch, model, question } = parseInput(input);

    // After "start ai", expect "use model_name" before queries
    if (!activeModel && !isSwitch) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "system",
          provider: "",
          content:
            "❗ Please select a model first using: use gemini   or   use perplexity",
        },
      ]);
      setInput("");
      return;
    }

    if (isSwitch) {
      setActiveModel(model);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "system",
          provider: model,
          content: `🔄 Switched to ${model} model. All queries use ${model} until changed.`,
        },
      ]);
      setInput("");
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        provider: activeModel,
        prompt: question,
        content: `${activeModel}> ${question}`,
      },
    ]);
    setInput("");
    setIsSending(true);

    try {
      let apiUrl, body;
      if (activeModel === "gemini") {
        apiUrl = "http://localhost:5000/api/gemini-chat";
        body = { prompt: question };
      } else {
        apiUrl = "http://localhost:5000/api/perplexity-chat";
        body = { message: question };
      }

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      const reply =
        activeModel === "gemini"
          ? data.text || "No response received."
          : data.reply || "No response received.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          provider: activeModel,
          prompt: question,
          content: reply,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          provider: activeModel,
          prompt: question,
          content: "Something went wrong talking to the API.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#18181a] text-[#d1d5db] font-mono flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-2xl bg-[#232326] text-[#dbeafe] p-3 text-xs border-b border-[#2c2e33] uppercase mb-1 tracking-widest">
        AI Terminal Chat
      </div>
      {/* Instructions */}
      <div className="w-full max-w-2xl bg-[#232326] text-[#9ca3af] p-3 border-b border-[#232326] mb-2 whitespace-pre-wrap text-xs">
        {INSTRUCTIONS}
      </div>
      {/* Active model display */}
      <div className="w-full max-w-2xl bg-[#232326] text-[#e0e7ef] p-2 text-sm border-b border-[#35363b] mb-2">
        <span>
          <span className="font-bold text-[#bae6fd]">Active Model:</span>{" "}
          <span className="bg-[#232326] rounded px-2 py-1 text-[#bae6fd] border border-[#2dd4bf]">
            {activeModel || "None (please start and select one)"}
          </span>
        </span>
      </div>
      {/* Messages */}
      <main className="w-full max-w-2xl flex-1 bg-[#18181a] px-2 pb-28 pt-2 flex flex-col">
        <div className="flex flex-col-reverse gap-3 overflow-y-auto">
          {messages
            .slice()
            .reverse()
            .map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="mb-1">
                  <div className="font-mono text-[#60a5fa] text-base">
                    <span className="font-bold">{msg.provider}&gt;</span>{" "}
                    <span className="">{msg.prompt}</span>
                  </div>
                </div>
              ) : msg.role === "assistant" ? (
                <div key={msg.id} className="mb-1">
                  <div className="font-mono text-[#2dd4bf] text-base">
                    <span className="font-bold">{msg.provider}&gt;</span>{" "}
                    <span className="">{msg.prompt}</span>
                  </div>
                  <div className="ml-4 mt-1 p-3 bg-[#232326] rounded border border-[#35363b] text-[#d1d5db] text-base leading-relaxed">
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => (
                          <p className="whitespace-pre-wrap mb-4" {...props} />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="mb-1 font-mono text-[#fde68a] bg-[#232326] px-2 py-1 rounded">
                  {msg.content}
                </div>
              )
            )}
        </div>
      </main>
      {/* Input bar */}
      <div className="fixed inset-x-0 bottom-0 flex justify-center bg-[#18181a] py-4 border-t border-[#232326]">
        <div className="w-full max-w-2xl flex items-center gap-2 px-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            placeholder={
              !aiStarted
                ? `Type 'start ai' to begin...`
                : !activeModel
                ? `Type 'use gemini' or 'use perplexity'`
                : `Ask your question...`
            }
            className="flex-1 rounded bg-[#232326] border border-[#35363b] py-2 px-4 text-[#bae6fd] focus:outline-none focus:border-[#2dd4bf]"
          />
          <button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="ml-2 px-4 py-2 rounded bg-[#2dd4bf] text-black font-bold hover:bg-[#22d3ee] transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
