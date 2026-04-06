# Antigravity Lead Engine

This is a modern, high-performance web application consisting of a React + Vite frontend and a FastAPI backend. It processes raw sales leads using a cutting-edge multimodal AI pipeline.

## 🚀 Architecture

The backend pipeline has been hyper-optimized from legacy multi-agent setups into a **Single Multimodal Agent**:
- **Website Analyzer (Playwright + GPT-4o Vision):** 
  When a lead is submitted, the backend launches a headless Chromium browser, physically visits the prospect's URL, and takes a **full-page screenshot**. It extracts the textual HTML content and measures the page load speed. 
  It then feeds the image and text to `gpt-4o` to generate an incredibly accurate, personalized critique (design, CTA, messaging), 0-10 score, and priority rating (HOT/WARM/COLD) for your sales outreach.

## 💻 Tech Stack
- **Frontend**: React, Vite, Vanilla CSS (Glassmorphism UI), Lucide Icons
- **Backend**: FastAPI, LangGraph, Python 3
- **Automation**: Playwright, BeautifulSoup4
- **AI**: OpenAI `gpt-4o` 

---

## 🛠️ How to Run the App Locally

To run the application, you need **two separate terminals** running at the same time: one for the backend, and one for the frontend.

### 1. Start the FastAPI Backend
Open your first terminal in the root directory (`d:\PROJECTS\AZURE-LEARNING-UDEMY\WEBSITE-AGENT`) and run:
```bash
# Activate your virtual environment and start the server
.\venv\Scripts\python -m uvicorn main:app --reload
```
*The backend API will run at `http://localhost:8000`. You can view interactive docs at `http://localhost:8000/docs`.*

### 2. Start the React Frontend
Open a **second** terminal, navigate into the `frontend/` folder, and start the Vite dev server:
```bash
cd frontend
npm run dev
```
*The beautiful UI dashboard will launch at `http://localhost:5173/`.*

---

## ⚙️ Environment Setup (First-time only)

Ensure you have your OpenAI API key set in your root `.env` file!

```env
OPENAI_API_KEY="sk-proj-your-key-here..."
```

*(Note: Playwright requires Chromium binaries. If you ever clone this to a new machine, you must run `playwright install chromium` inside your virtual environment).*
# lead_magnet
# lead_magnet
# lead_magnet
# lead_magnet
