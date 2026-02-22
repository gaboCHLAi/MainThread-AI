MainThread Project
🚀 Project Overview

MainThread is a full-stack web application designed to analyze websites, generate AI advice, and perform Lighthouse audits for both desktop and mobile platforms. The project is built using React (Vite) for the frontend, Node.js / Express for the backend, and Puppeteer for web scraping and automated audits.

🛠 Technologies

Frontend: React, Vite, Tailwind CSS (optional)

Backend: Node.js, Express

Automation & Scraping: Puppeteer, Lighthouse

Database: MongoDB (if needed)

Containerization: Docker, Docker Compose

📦 Installation
Using Docker (Recommended)

Build and run all services:

docker compose up --build

Access services:

Frontend: http://localhost:3000

Server B (Scraping API): http://localhost:5001

Server A: http://localhost:5000

View logs:

docker compose logs -f frontend-service
docker compose logs -f server-a-service
docker compose logs -f server-b-service

Local Development (Without Docker)

Clone the repo (optional if not using Docker):

git clone <your-repo-url>
cd mainthread-project

Install dependencies for backend & frontend:

# Backend
cd server-a
npm install
cd ../server-b
npm install

# Frontend
cd ../frontend
npm install

Run servers locally:

# Server A
npm start

# Server B
npm start

# Frontend
npm run dev
🔧 Backend (Server B) - Puppeteer & Lighthouse

Server B launches headless Chrome to scrape websites and run Lighthouse audits.

Audits run in dual-mode (Mobile + Desktop).

Cache path for Puppeteer: /home/pptruser/.cache/puppeteer

If Chrome is missing:

npx puppeteer install chrome

Example API log snippet:

🚀 Browser launched
🔍 Navigating to: https://example.ge/
Lighthouse audit finished
🔒 Security audit finished
🤖 AI advice generated
🛑 Browser closed safely
🖥 Frontend (React + Vite)

Dev server runs on http://localhost:3000

📝 API Endpoints

Server A: Handles user requests, returns AI analysis results

Server B: Scraping API, runs Lighthouse audits, generates AI advice


⚙️ Troubleshooting

Chrome not found: Install Chrome with Puppeteer:

npx puppeteer install chrome

Port conflicts: Check ports 3000 (frontend), 5000 (server A), 5001 (server B)

Environment variables: .env files are required for API keys, scraping config, etc. Do not commit .env to git.