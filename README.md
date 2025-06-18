# InterviewBot – AI Mock Interview Coach

A full-stack web application built with **Next.js**, **TypeScript**, and **Azure OpenAI (GPT-4o)**.  
It simulates realistic voice interviews and provides instant, personalised feedback to help candidates improve their responses and confidence.

## Features

- Real-time voice interviews using Speech-to-Text and Text-to-Speech  
- Live transcription with Azure Cognitive Services  
- GPT-4o powered AI feedback with strengths and practical improvement tips  
- Natural interview pacing with voice interaction and response delay handling  
- Animated voice visualisation and session timing  
- Responsive, modern UI optimised for desktop and mobile

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS  
- **Backend:** Serverless Edge API Routes (Next.js)  
- **AI & Speech:** Azure OpenAI (GPT-4o), Azure Speech Services

## Demo

- Live Site: [https://interview.bydiba.dev](https://interview.bydiba.dev)

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` – Main pages and routes  
- `api/` – Serverless functions for AI and feedback  
- `components/` – Reusable UI elements  
- `lib/` – Logic for AI, speech, and state  
- `public/` – Static files (icons, sounds, etc.)

## Deployment

Deployed on **Vercel** using serverless Edge Functions.  
Configure environment variables in `.env` to use your own Azure credentials.

## License

This project is licensed under the [MIT License](LICENSE).