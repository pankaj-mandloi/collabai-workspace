# CollabAI Backend

Real-time AI collaboration platform backend built with Node.js, Express, Socket.io, and MongoDB.

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Real-time:** Socket.io
- **Validation:** Zod
- **AI:** Google Gemini (coming soon)

## 📁 Folder Structure
\`\`\`
src/
├── config/          # Database & app configuration
├── models/          # Mongoose schemas
├── controllers/     # Request handlers (thin)
├── routes/          # API route definitions
├── services/        # Business logic layer
├── middlewares/     # Custom middlewares (auth, validation, errors)
├── validators/      # Zod validation schemas
├── sockets/         # Socket.io event handlers
├── ai/              # AI-specific logic (Gemini, RAG)
├── constants/       # Enums, roles, event names
├── utils/           # Helper classes (ApiError, ApiResponse)
├── app.js           # Express app configuration
└── index.js         # Server entry point
\`\`\`

## 🚀 Getting Started

### Installation
\`\`\`bash
npm install
\`\`\`

### Environment Setup
Copy \`.env.example\` to \`.env\` and fill in your credentials.

### Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Server: http://localhost:5000