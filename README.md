

````markdown
# 🛡️ Secret Scanner (UI Version)

> An enterprise-grade, automated security scanner for detecting exposed secrets, credentials, and API keys in GitHub repositories.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 📖 Overview

The **NPCI Secret Scanner** is a comprehensive DevSecOps tool designed to prevent credential leaks. It clones target repositories, scans them using regex patterns and heuristic analysis, and reports findings via a comprehensive **Dark Mode Dashboard** and **REST API**.

### ✨ Key Features
* **🕵️ Deep Scanning:** Detects AWS keys, Google API keys, Private Keys, Slack tokens, and generic "password" assignments.
* **📊 Analytics Dashboard:** A beautiful, dark-themed UI built with EJS, Bootstrap 5, and Chart.js to visualize security trends.
* **📑 API Documentation:** Fully integrated Swagger UI for easy API testing and integration.
* **💾 Persistent History:** Stores all scan results and findings in MongoDB.
* **🐳 Dockerized:** Ready for deployment with a single command.
* **🔐 Auth Layer:** Simple Product/API Key authentication middleware.

---

## 🚀 Quick Start (Docker)

The easiest way to run the application is using Docker Compose. This sets up both the App and a local MongoDB instance.

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/sauravkumararya/git-secreat-scanner-UI-version.git](https://github.com/sauravkumararya/git-secreat-scanner-UI-version.git)
    cd git-secreat-scanner-UI-version
    ```

2.  **Create Environment File**
    Create a `.env` file in the root directory:
    ```ini
    PORT=3000
    MONGO_URI=mongodb://mongo:27017/securityscanner
    ```

3.  **Run with Docker**
    ```bash
    docker-compose up -d --build
    ```

4.  **Access the App**
    * **Dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
    * **API Docs:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🛠️ Manual Installation

If you prefer running it without Docker:

### Prerequisites
* Node.js (v14+)
* MongoDB (Local or Atlas URL)
* Git installed on the system

### Steps
1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Environment**
    Create a `.env` file:
    ```ini
    PORT=3000
    # Use localhost or your Atlas Connection String
    MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/securityscanner
    ```

3.  **Start the Server**
    ```bash
    npm start
    # OR for development
    node server.js
    ```

---

## 🖥️ Usage Guide

### 1. Register a Product
Before scanning, you must register a "Product" to get API access. You can do this via the Swagger UI or Curl.

**POST** `/api/register-product`
```json
{
  "productName": "MySecureApp",
  "apiKey": "secure-123"
}
````

### 2\. Scan a Repository

Use the credentials created above to trigger a scan.

**POST** `/api/scan`

```json
{
  "productName": "MySecureApp",
  "apiKey": "secure-123",
  "repoUrl": "[https://github.com/some-user/vulnerable-repo.git](https://github.com/some-user/vulnerable-repo.git)"
}
```

### 3\. View Results

  * **Via JSON:** The API returns a full report immediately.
  * **Via Dashboard:** Go to `/dashboard` to see the visualized report, code snippets, and line numbers of the secrets found.

-----

## 📂 Project Structure

```text
/
├── views/                  # EJS Templates for Dashboard
│   ├── dashboard.ejs       # Main Analytics View
│   └── product_detail.ejs  # Specific Scan Report View
├── temp_clones/            # Temporary storage for git operations (Auto-cleaned)
├── swaggerConfig.js        # OpenAPI Definition
├── server.js               # Main Application Logic
├── Dockerfile              # Docker Build Instructions
├── docker-compose.yml      # Orchestration Config
└── .env                    # Environment Variables (Not committed)
```

-----

## 🛡️ Security Patterns

The scanner currently checks for:

  * AWS Access & Secret Keys
  * Google API Keys
  * Slack Tokens
  * Stripe Keys
  * GitHub Tokens
  * RSA/SSH Private Keys
  * *Heuristic checks* for variables named `password`, `secret`, `auth`, etc.

-----

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/NewPattern`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

-----

## 📝 License

This project is licensed under the MIT License.

````

### 💡 Pro Tip for your README
If you want to make it look even better, **take a screenshot** of your dashboard running in the browser and add it to the README right after the "Overview" section like this:

```markdown
![Dashboard Preview](path/to/your/screenshot.png)
````
