import OpenAI from "openai";

// Initialize the OpenAI client; it automatically reads OPENAI_API_KEY from the environment
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Express endpoint to handle incoming AI assistant queries
app.post("/api/ai/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // Or your preferred model
      messages: [{ role: "user", content: prompt }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("AI API Error:", err);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
});