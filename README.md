# 💬 Conversa – Real-Time Chat Application

Conversa is a real-time chat application built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** and **Socket.io**.  
It enables users to send and receive messages instantly through a modern, responsive, and secure web interface.

---

## 🚀 Features

- 🔐 **User Authentication** – Secure signup and login functionality  
- 💬 **Instant Messaging** – Real-time chat powered by Socket.io  
- 👥 **One-to-One Conversations** – Private chat between registered users  
- 📸 **Media Support** – Send images and files directly in chat  
- 🧭 **Modern UI** – Responsive design with an intuitive interface  
- 🧱 **Modular Architecture** – Clean separation between frontend and backend  
- 📊 **Scalable Backend** – Built with Express.js and MongoDB for easy expansion  

---

## 🛠️ Tech Stack

**Frontend:** React.js, HTML, CSS, JavaScript  
**Backend:** Node.js, Express.js, Socket.io  
**Database:** MongoDB (Mongoose)  
**Authentication:** JWT (JSON Web Token)  
**File Uploads:** Multer  
**Real-Time Communication:** Socket.io  

---

## 📁 Project Structure

conversa-main/

│

├── backend/              # Express.js server and Socket.io setup

│   ├── Controllers/       # Business logic for user, chat, and messages

│   ├── Models/            # Mongoose schemas for MongoDB

│   ├── Routes/            # API endpoints

│   ├── middleware/        # Authentication and token handling

│   ├── socket/            # Real-time event handlers

│   ├── config/            # Image upload and environment setup

│   └── index.js           # Backend entry point

│

├── frontend/             # React.js client

│   ├── src/

│   │   ├── components/     # UI components (Dashboard, Navbar, ChatArea)

│   │   ├── context/        # State management using Context API

│   │   ├── assets/         # Static files (audio, animations)

│   │   └── App.js          # Main React component

│   └── public/            # Public files like index.html and icons

│

├── screenshots/          # UI preview images

├── .gitignore

├── LICENSE

└── README.md


---

## 🖼️ Screenshots

| Login | Dashboard | Chat Area |
|-------|------------|-----------|
| ![Login](./screenshots/2_login_signup.png) | ![Dashboard](./screenshots/3_dashboard.png) | ![Chat](./screenshots/6_chatting_area.png) |

---

## ⚙️ Installation and Setup

### 1️⃣ Clone the repository
git clone https://github.com/Akshatsrivastava26/Conversa_Chat-Application.git
cd Conversa_Chat-Application

### 2️⃣ Setup the backend
cd backend
npm install
npm start

### 3️⃣ Setup the frontend
cd ../frontend
npm install
npm start

### 4️⃣ Environment Variables
Create a `.env` file in the backend folder and add:

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key

PORT=3000

---

## 🧩 How It Works

1. Users register or log in with credentials.  
2. Once authenticated, users can start one-to-one chats.  
3. Socket.io enables real-time message transfer and updates.  
4. Messages and user data are securely stored in MongoDB.  

---

## 🧠 Future Enhancements

- Group chat and broadcast support  
- Message reactions and emojis  
- Chat history and cloud storage integration  
- Typing indicators and message read receipts  

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Akshat Kumar Srivastava**  
📧 [Email(akshat.srivastava1564@gmail.com]  
🌐 [GitHub](https://github.com/Akshatsrivastava26)
