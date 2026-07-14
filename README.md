# 🚀 CollabAI — Real-Time AI Collaboration Workspace

<div align="center">

![CollabAI Banner](https://img.shields.io/badge/CollabAI-v1.0.0-emerald?style=for-the-badge&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google)

**A modern team collaboration platform with real-time chat, task management, document editor, and AI-powered agent.**

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📁 Folder Structure](#-folder-structure)
- [🚀 Getting Started](#-getting-started)
- [🔧 Environment Variables](#-environment-variables)
- [📊 API Endpoints](#-api-endpoints)
- [📄 License](#-license)

---

## ✨ Features

### 🔐 Authentication
- ✅ Sign Up / Sign In with **Clerk** (Email, Google, GitHub)
- ✅ Protected routes (Frontend + Backend)
- ✅ JWT-less session management

### 🏢 Workspace Management
- ✅ Create, List, Update, Delete workspaces
- ✅ Role-based access (Owner, Admin, Member)
- ✅ Member invitations via email
- ✅ Pending invitations dashboard

### 💬 Real-time Chat
- ✅ Instant messaging with **Socket.io**
- ✅ Typing indicators (animated dots)
- ✅ Online/Offline user presence
- ✅ Message edit (15-minute window)
- ✅ Message delete with confirmation
- ✅ Emoji reactions (real-time)
- ✅ File uploads (Images, PDFs via Cloudinary)

### 📋 Task Management (Kanban)
- ✅ Trello-style drag-and-drop board
- ✅ Task creation with title, description, priority, assignees, due date
- ✅ Checklist with progress tracking
- ✅ Priority badges (Low, Medium, High, Urgent)
- ✅ Task detail view with edit/delete

### 📝 Document Editor
- ✅ Notion-style rich text editor (**TipTap**)
- ✅ 12+ formatting options (Bold, Italic, Headings, Lists, Quotes, Code, Links, Highlight)
- ✅ Auto-save (2-second debounce)
- ✅ Save status indicator (Saving/Saved/Unsaved)
- ✅ Star/Favorite documents
- ✅ Word count tracking
- ✅ Delete with confirmation

### 🤖 AI Agent (Gemini + RAG)
- ✅ **Google Gemini 2.5 Flash** integration
- ✅ **RAG (Retrieval Augmented Generation)** pipeline
- ✅ Workspace context-aware responses
- ✅ **@ai** mention in chat
- ✅ AI Chat Panel (Slack/Notion style)
- ✅ Suggested prompts
- ✅ Context badges (Messages/Tasks/Docs referenced)
- ✅ Thinking indicator with animated dots

### 🔍 Search
- ✅ Global search with **Ctrl+K**
- ✅ Search messages, tasks, documents
- ✅ Smart context detection (Dashboard vs Workspace)
- ✅ Quick navigation links

### 🔔 Notifications
- ✅ Real-time notifications
- ✅ Bell icon with unread badge
- ✅ Notification dropdown panel
- ✅ Mark as read / Mark all read
- ✅ Delete notifications
- ✅ Auto-refresh (30 seconds)

### 👤 User Profile
- ✅ User info display (Name, Email, Avatar)
- ✅ User Status (Online/Away/Busy/Offline)
- ✅ Joined workspaces list
- ✅ Account details

### 🎨 UI/UX
- ✅ Modern 2026 design with **Emerald Green** theme
- ✅ Dark mode (Amber glows, Glassmorphism)
- ✅ Loading skeletons everywhere
- ✅ Toast notifications
- ✅ Custom 404 page

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2 | React framework with App Router |
| **TypeScript** | 5.0 | Type-safe JavaScript |
| **Tailwind CSS** | 3.4 | Utility-first CSS |
| **ShadCN UI** | Latest | Component library |
| **Socket.io-client** | 4.7 | Real-time WebSocket client |
| **Zustand** | 5.0 | State management |
| **TipTap** | 3.0 | Rich text editor |
| **dnd-kit** | 6.0 | Drag-and-drop for Kanban |
| **Clerk** | 6.0 | Authentication |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 22 | JavaScript runtime |
| **Express** | 4.21 | Web framework |
| **MongoDB** | 8.7 | NoSQL database |
| **Mongoose** | 8.7 | ODM for MongoDB |
| **Socket.io** | 4.8 | Real-time WebSocket server |
| **Clerk Express** | 1.0 | Clerk authentication for backend |
| **Zod** | 3.23 | Schema validation |

### AI Layer
| Technology | Purpose |
|------------|---------|
| **Google Gemini 2.5 Flash** | LLM for AI agent |
| **Gemini Embeddings (001)** | Vector embeddings for RAG |
| **MongoDB Atlas Vector Search** | Semantic search for messages & documents |
| **RAG Pipeline** | Context-aware responses |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Render** | Frontend + Backend hosting |
| **MongoDB Atlas** | Database hosting |
| **Cloudinary** | File upload hosting |
| **GitHub** | Version control |

---

## 📁 Folder Structure

### Backend
backend/
├── src/
│ ├── config/ # Database, CORS, Environment config
│ ├── models/ # Mongoose schemas
│ ├── controllers/ # Request handlers
│ ├── routes/ # API endpoints
│ ├── services/ # Business logic
│ ├── middlewares/ # Auth, Error, Validation
│ ├── validators/ # Zod validation schemas
│ ├── sockets/ # Socket.io handlers
│ ├── ai/ # AI logic (Gemini, RAG, Embeddings)
│ ├── constants/ # Enums, Roles, Events
│ ├── utils/ # Helpers (ApiResponse, ApiError)
│ ├── app.js # Express app setup
│ └── index.js # Server entry point
├── .env
├── .env.example
├── package.json
└── README.md

text

### Frontend
frontend/
├── src/
│ ├── app/ # Next.js App Router pages
│ │ ├── (auth)/ # Sign In / Sign Up
│ │ ├── (dashboard)/ # Dashboard, Workspace, Chat, Tasks, Documents
│ │ └── layout.tsx # Root layout
│ ├── components/ # Reusable components
│ │ ├── ui/ # ShadCN components
│ │ ├── shared/ # Shared components (Search, Notification)
│ │ └── features/ # Feature-specific components
│ ├── services/ # API service layer (Axios)
│ ├── store/ # Zustand stores
│ ├── hooks/ # Custom React hooks
│ ├── types/ # TypeScript type definitions
│ ├── providers/ # Context providers (Socket, Theme)
│ └── config/ # App configuration
├── .env.local
├── .env.example
├── package.json
└── README.md

text

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB Atlas** account (free tier)
- **Clerk** account (free tier)
- **Google Gemini AI** API key (free tier)
- **Cloudinary** account (free tier)

### 1. Clone the Repository

```bash
git clone https://github.com/pankaj-mandloi/collabai-workspace.git
cd collabai-workspace
2. Backend Setup
bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
Backend .env:

env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Clerk Auth
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=collabai_uploads
3. Frontend Setup
bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
Frontend .env.local:

env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=collabai_uploads
4. Run Both Servers
Terminal 1 — Backend:

bash
cd backend
npm run dev
# Server running on http://localhost:5000
Terminal 2 — Frontend:

bash
cd frontend
npm run dev
# Server running on http://localhost:3000
5. Open Application
Open browser: http://localhost:3000

🔧 Environment Variables
Backend (.env)
Variable	Description
PORT	Server port (default: 5000)
NODE_ENV	Environment (development/production)
CLIENT_URL	Frontend URL
MONGODB_URI	MongoDB Atlas connection string
CLERK_SECRET_KEY	Clerk backend secret key
CLERK_WEBHOOK_SECRET	Clerk webhook signing secret
GEMINI_API_KEY	Google Gemini API key
CLOUDINARY_CLOUD_NAME	Cloudinary cloud name
CLOUDINARY_API_KEY	Cloudinary API key
CLOUDINARY_API_SECRET	Cloudinary API secret
CLOUDINARY_UPLOAD_PRESET	Cloudinary upload preset
Frontend (.env.local)
Variable	Description
NEXT_PUBLIC_API_URL	Backend API URL
NEXT_PUBLIC_SOCKET_URL	Backend Socket.io URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY	Clerk frontend publishable key
CLERK_SECRET_KEY	Clerk frontend secret key
NEXT_PUBLIC_CLERK_SIGN_IN_URL	Sign in page path
NEXT_PUBLIC_CLERK_SIGN_UP_URL	Sign up page path
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL	Redirect after sign in
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL	Redirect after sign up
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME	Cloudinary cloud name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET	Cloudinary upload preset
📊 API Endpoints
Method	Endpoint	Description
Auth		
POST	/api/webhooks/clerk	Clerk webhook handler
Users		
GET	/api/v1/users/me	Get current user
PATCH	/api/v1/users/me	Update user profile
PATCH	/api/v1/users/me/status	Update user status
Workspaces		
POST	/api/v1/workspaces	Create workspace
GET	/api/v1/workspaces	List workspaces
GET	/api/v1/workspaces/:id	Get workspace
PATCH	/api/v1/workspaces/:id	Update workspace
DELETE	/api/v1/workspaces/:id	Delete workspace
POST	/api/v1/workspaces/:id/invitations	Invite member
DELETE	/api/v1/workspaces/:id/invitations/:invId	Cancel invitation
DELETE	/api/v1/workspaces/:id/members/:memberId	Remove member
Messages		
POST	/api/v1/messages	Send message
GET	/api/v1/messages/workspace/:id	Get messages
PATCH	/api/v1/messages/:id	Edit message
DELETE	/api/v1/messages/:id	Delete message
POST	/api/v1/messages/:id/reactions	Add reaction
Tasks		
POST	/api/v1/tasks	Create task
GET	/api/v1/tasks/workspace/:id	List tasks
PATCH	/api/v1/tasks/:id	Update task
PATCH	/api/v1/tasks/:id/move	Move task (drag-drop)
DELETE	/api/v1/tasks/:id	Delete task
POST	/api/v1/tasks/:id/checklist	Add checklist item
PATCH	/api/v1/tasks/:id/checklist/:itemId	Toggle checklist
Documents		
POST	/api/v1/documents	Create document
GET	/api/v1/documents/workspace/:id	List documents
GET	/api/v1/documents/:id	Get document
PATCH	/api/v1/documents/:id	Update document
DELETE	/api/v1/documents/:id	Delete document
POST	/api/v1/documents/:id/star	Toggle star
AI		
GET	/api/v1/ai/status	Check AI status
POST	/api/v1/ai/chat	Basic chat
POST	/api/v1/ai/chat/workspace	RAG contextual chat
POST	/api/v1/ai/summarize	Summarize text
POST	/api/v1/ai/generate	Generate text
Notifications		
GET	/api/v1/notifications	Get notifications
GET	/api/v1/notifications/unread-count	Get unread count
PATCH	/api/v1/notifications/read-all	Mark all read
DELETE	/api/v1/notifications/read	Delete all read
PATCH	/api/v1/notifications/:id/read	Mark one read
DELETE	/api/v1/notifications/:id	Delete one
📄 License
This project is licensed under the MIT License.

👨‍💻 Author
Pankaj Mandloi

GitHub: https://github.com/pankaj-mandloi

<div align="center">
Built with ❤️ by Pankaj Mandloi

</div> ```