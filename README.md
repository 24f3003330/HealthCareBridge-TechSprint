# HealthBridge AI 🏥

**Providing hope and help during challenging times with AI-powered care.**

HealthBridge AI is a comprehensive healthcare management platform designed to bridge the gap between patients, doctors, and healthcare organizations. It leverages advanced AI (Google Gemini) to enhance clinical decision-making, improve patient safety, and streamline administrative workflows—all wrapped in a warm, comforting "Hope Rise" aesthetic.

## 🌟 Key Features

### For Patients 💖
-   **Find Care**: Easily search for specialists and book appointments.
-   **My Health Dashboard**: View upcoming appointments, medical history, and past diagnoses.
-   **Safety Guard**: AI-powered check for potential drug-drug interactions and contraindications.
-   **Smart Scanner**: Upload prescription images to instantly extract medication details using OCR.
-   **Personalized Coaching**: Receive AI-tailored advice on how and when to take medications.

### For Doctors 👨‍⚕️
-   **Practice Portal**: Manage daily schedules and patient lists.
-   **Clinical Note Analyzer**: Paste unstructured clinical notes to extract structured data (medications, conditions) and generate FHIR resources.
-   **Patient History**: Quickly search and review past patient records.
-   **Consultation Mode**: Digital consultation form with diagnosis and treatment plan logging.

### For Organizations 🏥
-   **Admin Dashboard**: comprehensive oversight of medical staff and organization-wide appointments.
-   **Staff Management**: Register and manage doctor profiles and availability.

## 🛠 Tech Stack

-   **Frontend**: React (Vite), Vanilla CSS (Custom "Hope Rise" Theme), Lucide React Icons.
-   **Backend**: Python (FastAPI), SQLAlchemy, SQLite (Development DB).
-   **AI Integration**: Google Gemini 1.5 Flash (via `google-generativeai`).
-   **Security**: bcrypt password hashing.

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   Python (v3.9+)
-   Google Cloud API Key (for Gemini)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/HealthCareBridgeAI.git
cd HealthCareBridgeAI
```

### 2. Backend Setup
Navigate to the root directory (where `api/` is located).

```bash
# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

**Run the Server:**
```bash
# Start FastAPI server on port 8000
python3 -m uvicorn api.index:app --reload --port 8000
```
The API will be available at `http://localhost:8000`. Documentation at `/docs`.

### 3. Frontend Setup
Open a new terminal and navigate to the `frontend` folder.

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The app will launch at `http://localhost:5173`.

## 🧪 Testing Credentials (Demo Mode)

**Organization Admin**
-   Email: `admin@hope.com`
-   Password: `admin`

**Doctor**
-   Email: `doctor@hope.com`
-   Password: `doctor`

**Patient**
-   Sign up with any email/password via the "Get Started" button.

## 🎨 Theme & Design
The **"Hope Rise"** aesthetic focuses on warmth and accessibility:
-   **Colors**: Warm Beige (`#FDF8F0`), Emerald Green (`#10B981`), Deep Grey (`#1F2937`).
-   **Typography**: Inter (Clean, modern sans-serif).
-   **Shapes**: Large border-radius (Pill shapes) and soft, diffuse shadows.

## 🔒 Security Note
This project uses a local SQLite database and basic JWT-like token implementation for demonstration purposes. For production:
-   Replace SQLite with PostgreSQL/MySQL.
-   Implement robust JWT authentication with expiration.
-   Enable HTTPS.
