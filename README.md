
# 📊 Stock Dashboard

A full-stack stock dashboard application built with **React**, **Express.js**, and **MongoDB**.  
It provides stock-related data visualization with charts, interactive UI, and secure backend APIs.  

🚀 **Live Demo**: [Frontend](https://stock-dashboard-1-lk6g.onrender.com) | [Backend API](https://stock-dashboard-3r2g.onrender.com/companies)

---

## ✨ Features

- 📈 Interactive charts for stock trends (using Chart.js + react-chartjs-2)
- 🏦 Company listing with dynamic data from MongoDB
- 🔗 REST API powered by Express.js
- 🌍 Deployed with **Render**
- 🐳 Dockerized for easy containerized deployment
- 🔒 Secure backend with CORS handling
- ⚡ Fast, modern frontend using **Vite + React**

---

## 🛠️ Tech Stack

**Frontend**
- React 19
- Vite
- React Router DOM
- Chart.js & react-chartjs-2
- Axios

**Backend**
- Node.js + Express.js
- MongoDB Atlas
- CORS middleware

**Deployment**
- Render (Frontend + Backend)
- MongoDB Atlas (Database)
- Docker

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone git@github.com:hashda04/Stock_Dashboard.git
cd Stock_Dashboard
````

### 2️⃣ Backend Setup (Local)

```bash
cd backend
npm install
```

* Create a `.env` file inside `backend/`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/stocksdb
PORT=5000
FRONTEND_URL=http://localhost:5173
```

* Start the backend:

```bash
npm run dev
```

### 3️⃣ Frontend Setup (Local)

```bash
cd frontend
npm install
npm run dev
```

* The frontend runs at: `http://localhost:5173`
* The backend runs at: `http://localhost:5000`

---

## 🐳 Docker Setup

You can also run the entire project with **Docker**:

### 1️⃣ Build the Docker image

```bash
docker build -t stock-dashboard .
```

### 2️⃣ Run the container

```bash
docker run -p 5000:5000 -p 5173:5173 stock-dashboard
```

* Backend available at: `http://localhost:5000`
* Frontend available at: `http://localhost:5173`

---

## 🚀 Deployment

* **Frontend**: Deployed on Render as a static site → build output is `dist/`
* **Backend**: Deployed on Render as a web service → entry point `server.js`
* **Database**: MongoDB Atlas cluster
* **Docker**: Build & run locally or deploy to cloud services with Docker support

---


## 📌 Future Improvements

* ✅ User authentication & dashboards
* ✅ Stock search & filtering
* ✅ Historical stock price trends
* ✅ Deployment on Docker/Kubernetes


