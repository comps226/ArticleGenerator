# Article Generator — 6-Step Framework Engine

A full-stack AI writing tool that generates structured articles using a consistent 6-step editorial framework, powered by Claude Sonnet 4.

Enter any topic, choose a stance (bullish, bearish, neutral, contrarian), and the app produces a complete structured article with audience analysis, a 5-point outline, introduction, body sections, conclusion, and a call-to-action.

---

## Architecture

```
article-generator/
├── client/          # React + Vite frontend
│   └── src/
│       └── App.jsx
└── server/          # Express backend (holds API key securely)
    └── server.js
```

The Express server acts as a secure proxy — the Anthropic API key never touches the browser. All AI requests are made server-side.

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/article-generator.git
cd article-generator
```

### 2. Set up the server

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Start the server:

```bash
npm run dev
```

### 3. Set up the client

In a new terminal:

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## How It Works

The server receives a topic and stance from the frontend and sends a structured prompt to the Claude Sonnet 4 API using a 6-step framework:

1. Identify target audience and tone
2. Generate a 5-point outline
3. Write an engaging introduction
4. Develop each point with examples
5. Write a conclusion
6. Add a call-to-action

The model responds in structured JSON, which the frontend renders into a formatted article with a one-click markdown export.

---

## Stack

- **Frontend:** React 18, Vite
- **Backend:** Node.js, Express
- **AI:** Anthropic Claude Sonnet 4 (`claude-sonnet-4-20250514`)
- **Security:** API key stored server-side only, never expose the API key(s)
