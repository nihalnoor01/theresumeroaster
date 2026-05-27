# 📰 The Resume Roaster

A brutally honest, vintage newspaper-themed, AI-powered resume reviewer that critiques your credentials and generates high-impact, paste-ready ATS rewrites in seconds. No signup, no storage, no premium tiers — just scorched-earth career feedback.

🚀 **Live Link:** [https://theresumeroaster.nihalnoormpm01.workers.dev](https://theresumeroaster.nihalnoormpm01.workers.dev)

---

## ✨ Features

- **Vintage Newspaper Theme:** Beautiful, premium retro gothic aesthetic with live ticker headlines.
- **Selectable AI Model Engine:** Switch seamlessly between **Gemini (Descriptive)** and **Llama (Fast)**.
- **Multiple Intensity Levels:** Select **Gentle**, **Brutal**, or **Savage** critiques to match your tolerance for truth.
- **Intelligent File Parsing:** Supports direct file uploading for both **PDF** and **DOCX** formats.
- **ATS-Friendly Rewrites:** Highlights clichés and weak action verbs, replacing them with high-impact, quantified suggestions.
- **Daily Rate Limiter:** LocalStorage-based rate limiter (2 roasts per day) to keep AI compute free for everyone.
- **100% Privacy:** Resume text is parsed and roasted in memory, then forgotten instantly. Nothing is ever stored.

---

## 🛠️ Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (React 19, Vite, and Cloudflare Pages adapter)
- **Styling:** Tailwind CSS (Newspaper colorway: Black ink, ivory newsprint, crimson accents)
- **AI Integrations:** Google Gemini (via OpenAI-compatible edge wrapper) & Groq Llama 3.3
- **Parsers:** `pdfjs-dist` (PDF extraction) & `mammoth` (DOCX extraction)

---

## 💻 Local Development Setup

To run The Resume Roaster locally:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) (v20+ recommended) and `npm` installed.

### 2. Clone the Repository
```bash
git clone https://github.com/nihalnoor01/theresumeroaster.git
cd theresumeroaster
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Up Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
# Google Gemini Key (Optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Groq Cloud API Key (Optional)
GROQ_API_KEY=your_groq_api_key_here
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser!

---

## 🚀 Production Deployment (Cloudflare Pages)

The project is fully pre-configured for serverless deployment using Cloudflare Pages.

1. Create a **Cloudflare** account.
2. In the Cloudflare dashboard, go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select your GitHub repository.
4. Set the following build options:
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `dist`
5. Go to **Advanced settings** and add the following **Secret** environment variables:
   - `GEMINI_API_KEY` (with your Gemini API key)
   - `GROQ_API_KEY` (with your Groq API key)
6. Click **Save and Deploy**.

---

## 📝 License

This project is open-source and free to use. All rumors printed without verification.
