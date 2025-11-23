import axios from "axios";
import "dotenv/config";

const API_URL = "https://api.perplexity.ai/chat/completions";
const apiKey = process.env.PERPLEXITY_API_KEY;

async function main() {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "sonar-pro", 
        messages: [
          { role: "user", content: "Explain LLM in 2 lines" }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        }
      }
    );
    const reply = response.data.choices[0]?.message?.content || "No reply from API";
    console.log(reply);
  } catch (err) {
    if (err.response) {
      console.error("Perplexity API error:", err.response.status, err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
}

main();
