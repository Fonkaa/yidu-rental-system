const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-GWtggmEEVZdAnsMyscE9JJb8vwFLvSAFKwEJBK2nBItshcDM",
});

// Built-in Yidu Platform Knowledge Base for instant reliability
const yiduKnowledgeBase = [
  { q: "search", a: "You can search for verified properties by clicking 'Search Properties' in your sidebar. You can filter listings by city, sub-city, price range, and property type." },
  { q: "request", a: "To rent a property, open a listing's details page and submit a rental request form specifying your proposed price and move-in dates." },
  { q: "favorite", a: "Click the heart icon on any property card to save it. All your bookmarked properties can be managed under the 'My Favorites' menu." },
  { q: "lease", a: "Your active housing contracts, agreements, and start/end timelines are securely tracked under 'My Leases'." },
  { q: "chapa", a: "Platform payments and rent settlements are safely processed online through the integrated Chapa payment gateway using Telebirr, CBE Birr, or cards." },
  { q: "receipt", a: "Once a payment is completed via Chapa, you can instantly view and download your digital payment receipt under 'Rental Requests'." },
  { q: "message", a: "You can chat directly and securely with property owners/landlords using the 'Messages' tab once you initiate an inquiry." },
  { q: "profile", a: "You can update your personal account information, full name, or phone number anytime under 'Profile Settings' in your sidebar." },
  { q: "fayda", a: "Your Fayda or National ID number is securely stored in your profile settings for verification and lease compliance purposes." },
  { q: "password", a: "You can update your account password securely by entering your current password and a new password under 'Profile Settings'." }
];

router.post('/ask', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const query = prompt.toLowerCase();

    // 1. Check if it matches our local platform knowledge base first for instant reply
    const matched = yiduKnowledgeBase.find(item => query.includes(item.q));
    if (matched) {
      return res.json({ reply: matched.a });
    }

    // 2. Otherwise, query OpenAI with full Yidu platform context
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are Yidu Smart Assistant, the official AI guide for Yidu Real Estate & House Rental Platform. Our platform features property search, rental requests tracking, 'My Leases' for contracts, 'My Favorites', secure online rent payments via Chapa gateway (Telebirr/CBE Birr), direct landlord messaging, and profile settings including Fayda ID storage. Answer tenant questions accurately based on these exact features." 
        },
        { role: "user", content: prompt }
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("AI Assistant Route Error (Falling back to local FAQ):", err.message);
    
    // Fallback response if OpenAI credits run out or key fails
    res.json({ 
      reply: "I can help you search properties, submit rental requests, manage leases, or make secure payments via Chapa. Feel free to select any question from the quick list below!" 
    });
  }
});

module.exports = router;