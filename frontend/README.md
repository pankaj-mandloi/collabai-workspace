# CollabAI Frontend

Real-time AI collaboration platform frontend built with Next.js 16.

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + ShadCN UI
- **State:** Zustand
- **Real-time:** Socket.io Client
- **HTTP:** Axios

## 📁 Folder Structure
\`\`\`
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── ui/          # ShadCN components
│   ├── shared/      # Shared components
│   └── features/    # Feature-based components
├── lib/             # Utility functions
├── services/        # API service layer (Axios)
├── hooks/           # Custom React hooks
├── store/           # Zustand state stores
├── types/           # TypeScript type definitions
├── providers/       # Context providers
└── config/          # App configuration (env, socket)
\`\`\`

## 🚀 Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)