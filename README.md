# melodyVerse

# MelodyVerse API - User Authentication Service

This project is a **Node.js Express API** for user authentication, including **signup, login, email verification, and password reset**.

## 🚀 Features
- User registration with email verification
- Login with JWT authentication
- Password reset via email
- Middleware-protected routes
- Rate limiting for security

---

## 📌 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

---

## ⚙️ Installation & Setup FOR BACKEND

1. **Clone the repository**  
   ```sh
   git clone https://github.com/your-username/melodyverse-auth.git
   cd melodyVerse
   cd Server


2. **Install dependencies**

npm install
3. **Create a .env file in the root directory and add the following:**
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:3000
Run the API

npm start  # Runs the server in production mode
npm run dev  # Runs the server in development mode (nodemon)

4. **🔌 API Endpoints**
Authentication Routes
Method	Endpoint	Description
POST	/auth/signup	Register a new user
GET	 /auth/verify-email/:token	Verify email using token
POST	/auth/login	Log in with email & password
POST	/auth/request-reset	Request password reset link
POST	/auth/reset-password/:token	Reset password using token
GET	/auth/own	Get autheenticated user



# 🎨 MelodyVerse Frontend - React App FOR FRONTEND

This is the **frontend** for the **MelodyVerse Authentication System**, built with **React.js** and **React Router**. It provides a user interface for login, signup, password reset, and email verification.

---

## 🚀 Features
- **User Signup & Login**
- **Email Verification**
- **Password Reset**
- **Protected Dashboard**
- **Routing with React Router**

---

## 📌 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

---

## ⚙️ Installation & Setup For FrontEnd

1. **Clone the repository**  
   ```sh
   git clone https://github.com/Dheeraj-485
   cd melodyVerse
   cd client

2.**Install dependencies**
npm install

3. **Run the project**

npm start
This starts the frontend on http://localhost:3000.
