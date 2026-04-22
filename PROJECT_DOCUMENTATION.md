# MedAssist AI - Symptom Checker (Project Overview)

This is a comprehensive overview of the MedAssist AI application built to provide a modern, secure, and intelligent symptom checking tool.

## What is MedAssist AI?
MedAssist AI is a smart health triage web application. By describing your symptoms, the app utilizes the advanced **Gemini 2.0 Flash AI** to evaluate potential conditions, urgency levels (Urgent, See Doctor, Manage at Home), and provide personalized home care advice. It aims to offer immediate, context-aware triage specifically trained to understand both common global ailments and regional African health contexts.

## Architecture & Tech Stack
- **Frontend Framework**: React 19 + TypeScript + Vite.
- **Routing**: React Router DOM (to toggle between the Landing Page and the secure Application).
- **Styling**: Tailwind CSS v4, providing an elegant and vibrant Emerald Green (`#059669`) medical UI.
- **Typography**: "Outfit" font via Google Fonts.
- **Icons**: Lucide React.
- **AI Core**: Google GenAI SDK (`@google/genai`) connecting to `gemini-2.0-flash`. Structured Output (JSON Schema) guarantees exact response formatting for reliable UI rendering.
- **Authentication**: Firebase Authentication (Sign In with Google), enabling secure user sessions and ensuring privacy.
- **Database**: Cloud Firestore. It securely stores each user's symptom queries and AI results under their specific UID. Firestore Security Rules enforce strict data privacy where users can only read and write their own data.

## Project Structure
- `/src/pages/LandingPage.tsx`: The marketing entry point for unauthenticated users, explaining features and offering a Google Sign-In button.
- `/src/pages/SymptomChecker.tsx`: The core application. Includes a sidebar to see past query history (fetched from Firestore) and an input area to run new symptom evaluations.
- `/src/services/geminiService.ts`: Contains the system prompt, AI configuration, and strict JSON Schema required to securely retrieve triage logic from Gemini. Also gracefully intercepts API rate-limiting errors from the Free Tier limit.
- `/src/lib/firebase.ts`: Initializes Firebase application credentials and exports Auth and Firestore instances.
- `/firebase-blueprint.json`: The static schema definition utilized by Google AI Studio to understand the Firestore structure and generate deterministic, locked-down Security Rules.

## Dealing with Gemini API Quota Exhaustion
The application utilizes a user-provided or environment-provided `GEMINI_API_KEY`.
On Google's free tier, the Gemini API imposes rate limits (e.g., Requests per Minute / Per Day). If these limits are hit, the application actively catches the `429 RESOURCE_EXHAUSTED` error, extracts the "Retry in Xs" value, and gently alerts the user on the UI exactly how many seconds they need to wait. For production usage, connecting your Google Cloud Project to a billing account (switching to Pay-As-You-Go) completely removes these free tier bottlenecks.

## Built with Google AI Studio
This project was rapidly prototyped, designed, and structured using the Agentic capabilities within Google AI Studio. 

## Running Locally
To run this application yourself:
1. Ensure `node` and `npm` are installed.
2. Run `npm install` to grab all dependencies.
3. Add an `.env` file at the root with `GEMINI_API_KEY="..."`.
4. Add Firebase Configuration to `firebase-applet-config.json`.
5. Run `npm run dev`.
