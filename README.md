GuardianEye
GuardianEye is an AI-powered surveillance and student management system designed for educational institutions. It leverages computer vision and AI to automate uniform detection, emergency and movement tracking, attendance, and mask detection, providing a secure and efficient environment.

Features
Uniform Detection System: Detects if a student is wearing the registered uniform and provides permission status using AI.
Emergency Detection System: Identifies emergency gestures or visible health issues and suggests treatment plans using AI.
Movement Tracking: Tracks student presence duration in camera view and logs movement data.
Facial Recognition-Based Attendance: Automatically marks attendance with face recognition, linked to student details and subject selection.
Face Mask Detection: Detects if a person is wearing a mask.
AI Chatbot: Provides contextual help and assistance via a sidebar or floating button.
Logs Export: Export attendance and movement logs to Excel for record-keeping.
Objectives
Enhance campus safety and security using AI-driven surveillance.
Automate routine monitoring tasks to reduce manual effort.
Provide real-time alerts and actionable insights for emergencies.
Maintain accurate attendance and movement records.
Ensure compliance with uniform and mask policies.
Project Structure
.
├── src/
│   ├── ai/                # AI flows and logic
│   ├── app/               # Next.js app routes and pages
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and types
│   └── ...
├── public/                # Static assets
├── .env                   # Environment variables
├── package.json           # Project dependencies and scripts
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── ...
Getting Started
Prerequisites
Node.js 20+
npm
(Optional) Nix for reproducible development environments
Installation
Clone the repository:

git clone <your-repo-url>
cd surveillance-system-AI
Install dependencies:

npm install
Set up environment variables:

Copy .env.example to .env (if available) or ensure your .env contains the required API keys, e.g.:
GEMINI_API_KEY=your_gemini_api_key
Run the development server:

npm run dev
The app will be available at http://localhost:3000.

Using Nix (Optional)
If you use Nix, the workspace is pre-configured. You can enter the development shell with:

nix develop
Usage
Access different features from the sidebar:
Uniform Detection
Emergency Detection
Attendance System
Mask Detection
Movement Tracking
Use the camera feed for real-time detection.
Export logs as Excel files for attendance and movement tracking.
Get help from the integrated AI chatbot.
Style Guidelines
Primary color: Deep blue (#3F51B5)
Background color: Light blue-gray (#ECEFF1)
Accent color: Purple (#9C27B0)
Fonts: 'Space Grotesk' for headers, 'Inter' for body text
License
MIT (or specify your license)
