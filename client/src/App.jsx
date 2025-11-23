function App() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-base-200">
      <div className="navbar bg-base-100 w-full shadow">
        <div className="flex-1 px-4">
          <span className="text-xl font-bold">AI Chat Playground</span>
        </div>
      </div>

      <main className="w-full max-w-3xl mt-6 px-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-2">Chat will come here 💬</h2>
            <p className="text-sm text-base-content/70">
              Next steps: we&apos;ll add a chat box, messages list, and a dropdown for Gemini / Perplexity.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
