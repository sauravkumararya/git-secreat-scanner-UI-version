# 🛡️ Secret Scanner (UI Version)

> An enterprise-grade, automated security scanner for detecting exposed secrets, credentials, and API keys in GitHub repositories.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)  
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)](https://www.mongodb.com/)  
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)  
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📖 Overview

The **Secret Scanner** is a comprehensive DevSecOps tool that prevents credential leaks by scanning GitHub repositories for exposed secrets.  
It clones target repositories, detects credentials using powerful regex and heuristic rules, and displays results in a rich **Dark Mode Dashboard** with complete REST API support.

---

## ✨ Key Features

- **🕵️ Deep Secret Scanning**  
  Detects AWS keys, Google API keys, GitHub tokens, Slack tokens, private keys, and password variables.

- **📊 Modern Dashboard (Dark Mode)**  
  Built using **EJS + Bootstrap 5 + Chart.js**, with severity charts and detailed findings.

- **📑 Swagger API Documentation**  
  Fully interactive API documentation at `/api-docs`.

- **💾 MongoDB Storage**  
  Stores scan history and findings for audit and trend analysis.

- **🔐 Light Authentication Layer**  
  Simple Product/API Key validation for controlled access.

- **🐳 Dockerized Deployment**  
  Start everything with a single command using Docker Compose.

---

## 🚀 Quick Start Using Docker

### 1. Clone the Repository
```bash
git clone https://github.com/sauravkumararya/git-secreat-scanner-UI-version.git
cd git-secreat-scanner-UI-version
```

### 2. Create `.env` File
```ini
PORT=3000
MONGO_URI=mongodb://mongo:27017/securityscanner
```

### 3. Run with Docker Compose
```bash
docker-compose up -d --build
```

### 4. Access the Application
- Dashboard → http://localhost:3000/dashboard  
- Swagger Docs → http://localhost:3000/api-docs  

---

## 🛠️ Manual Installation (Without Docker)

### Prerequisites
- Node.js 14+  
- MongoDB (Local or Atlas)  
- Git installed  

### Steps

#### 1. Install Node Modules
```bash
npm install
```

#### 2. Create `.env`
```ini
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/securityscanner
```

#### 3. Start the Server
```bash
npm start
# OR
node server.js
```

---

## 🖥️ Usage Guide

### 1️⃣ Register a Product (Required for Authentication)

**POST** `/api/register-product`
```json
{
  "productName": "MySecureApp",
  "apiKey": "secure-123"
}
```

---

### 2️⃣ Scan a GitHub Repository

**POST** `/api/scan`
```json
{
  "productName": "MySecureApp",
  "apiKey": "secure-123",
  "repoUrl": "https://github.com/some-user/vulnerable-repo.git"
}
```

---

### 3️⃣ View Scan Results

- **API JSON Output**  
- **Dashboard UI** → `/dashboard`  
  - Severity statistics  
  - Line numbers  
  - Secret categories  
  - Highlighted code snippets  

---

## 📂 Project Structure

```
/
├── views/                  # EJS Template Views
│   ├── dashboard.ejs       # Main Dashboard
│   └── product_detail.ejs  # Scan Results Page
├── temp_clones/            # Temporary Cloned Repos (Auto-cleaned)
├── swaggerConfig.js        # Swagger Documentation Config
├── server.js               # Main Node Application
├── Dockerfile              # Docker Build File
├── docker-compose.yml      # App + MongoDB Setup
└── .env                    # Environment Variables
```

---

## 🛡️ Detection Patterns

The scanner identifies:

- AWS Access Keys  
- AWS Secret Keys  
- Google API Keys  
- GitHub Tokens  
- Slack Tokens  
- Stripe Keys  
- RSA / SSH Private Keys  
- `.pem` / `.ppk` files  
- Password-like assignments:
  - `password=`
  - `secret=`
  - `auth=`
  - `token=`

Includes heuristic scanning logic for generic patterns.

---

## 🤝 Contributing

1. Fork this repository  
2. Create a new feature branch  
```bash
git checkout -b feature/NewPattern
```
3. Commit and push your changes  
4. Open a Pull Request  

---

## 📝 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Designed & Developed by _Saurav Kumar Arya_**  
For any queries or improvements, feel free to connect or raise an issue.

---

## 📸 Optional: Dashboard Screenshot

After running the project, take a screenshot and add it here:

```markdown
![Dashboard Preview](./assets/dashboard-preview.png)
```

---

