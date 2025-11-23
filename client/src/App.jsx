import { useState } from "react";
import ReactMarkdown from "react-markdown";

function App() {
  const [provider, setProvider] = useState("gemini"); 
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const handleProviderChange = (value) => {
    setProvider(value);
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      provider,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const apiUrl =
        provider === "gemini"
          ? "http://localhost:5000/api/gemini-chat"
          : "http://localhost:5000/api/perplexity-chat";

      const body =
        provider === "gemini"
          ? { prompt: userMessage.content }
          : { message: userMessage.content };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      const reply =
        provider === "gemini"
          ? data.text || "No response received."
          : data.reply || "No response received.";

      const botMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: reply,
        provider,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          content: "Something went wrong talking to the API.",
          provider,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 text-sm text-slate-300/80">
        <div className="font-semibold tracking-tight">AI Chat</div>
        <nav className="flex gap-4 text-xs uppercase tracking-[0.18em] text-slate-400">
          <span>MERN</span>
          <span>Gemini</span>
          <span>Perplexity</span>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-40">
        <div className="w-full max-w-3xl pt-10">
          {messages.length === 0 && (
            <div className="text-center text-sm text-slate-400 mb-8">
              <p className="text-lg font-medium text-slate-100">
                Start a conversation with your AI.
              </p>
              <p className="">
                Use <span className="text-brand-soft font-semibold">Model</span>{" "}
                toggle below to switch models.
              </p>
            </div>
          )}

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md ${
                    msg.role === "user"
                      ? "bg-brand-soft/90 text-white shadow-glow-purple"
                      : "bg-slate-800/80 border border-slate-700 text-slate-50"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] mb-1 text-slate-300/70">
                    {msg.role === "user"
                      ? "You"
                      : msg.provider === "gemini"
                      ? "Gemini"
                      : "Perplexity"}
                  </div>
<ReactMarkdown
  components={{
    p: ({ node, ...props }) => (
      <p className="whitespace-pre-wrap" {...props} />
    ),
  }}
>
  {msg.content}
</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center px-4 pb-6">
        <div className="pointer-events-auto w-full max-w-4xl">
          <div className="rounded-3xl bg-slate-900/70 border border-slate-700 shadow-[0_0_40px_rgba(124,58,237,0.4)] backdrop-blur-xl px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-3 text-[11px] text-slate-300/80">
              <span className="uppercase tracking-[0.2em] text-slate-400/80">
                Model
              </span>

              <div className="inline-flex rounded-full bg-slate-800 p-1">
                <button
                  onClick={() => handleProviderChange("gemini")}
                  className={`px-3 py-1 rounded-full text-xs ${
                    provider === "gemini"
                      ? "bg-brand text-white shadow-glow-purple"
                      : "text-slate-300"
                  }`}
                >
                  Gemini
                </button>
                <button
                  onClick={() => handleProviderChange("perplexity")}
                  className={`px-3 py-1 rounded-full text-xs ${
                    provider === "perplexity"
                      ? "bg-brand text-white shadow-glow-purple"
                      : "text-slate-300"
                  }`}
                >
                  Perplexity
                </button>
              </div>
            </div>

            <div className="flex items-end gap-3">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AI Chat..."
                className="flex-1 resize-none bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none max-h-32"
              />
              <button
                onClick={handleSend}
                disabled={isSending || !input.trim()}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-brand disabled:bg-slate-700 shadow-glow-purple"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
