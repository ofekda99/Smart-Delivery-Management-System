# 🚚 LogiTrack Pro - Smart Delivery Management System

LogiTrack Pro is a professional Full-Stack logistics platform. It combines a modern React frontend with a powerful .NET backend to solve real-world delivery challenges through smart routing algorithms and AI assistance.

**🌐 Live Demo:** [https://smart-delivey-system.netlify.app/](https://smart-delivey-system.netlify.app/)

---

## 🌟 Key Features
* **Live Courier Map:** Interactive visualization of delivery points and courier locations using **Leaflet.js**.
* **Smart Route Optimization:** A custom-built **Greedy Algorithm** that automatically calculates the most efficient delivery sequence for couriers, minimizing travel distance and fuel costs.
* **AI Dispatch Assistant:** An integrated **AI Chatbot (Gemini)** that allows managers to query delivery data, check system status, and get logistics insights using natural language.
* **Role-Based Access Control (RBAC):** Secure, dedicated interfaces for **Admins** (management) and **Couriers** (execution).
* **Real-Time Updates:** Dynamic UI that reflects delivery status changes and assignments instantly.

## 🏗 Architecture & Design Patterns

The backend is built with a focus on **Clean Architecture** and industry standards:

* **Repository Pattern:** Decouples the business logic from the data access layer (**Entity Framework Core**), ensuring the system is maintainable and easy to test.
* **Service Layer:** All complex logic—including the **Route Optimization Algorithm** and AI processing—is encapsulated in dedicated services.
* **Dependency Injection:** Fully utilized in .NET to manage object lifetimes and improve system modularity.

## 🛠 Tech Stack
* **Frontend:** React.js (Vite), Leaflet.js, Lucide Icons, Axios.
* **Backend:** .NET 8 / ASP.NET Core Web API.
* **Database:** SQL Server (SSMS) with Entity Framework Core.
* **AI Integration:** Gemini API for the intelligent logistics assistant.

## 🔐 Demo Access
Use these credentials to explore the system's features:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `admin` |
| **Courier** | `courier_demo` | `courier123` |

## 🚀 How to Run

### 1. Backend (.NET API)
1. Navigate to the server folder.
2. Update `appsettings.json` with your SQL Server connection string.
3. Run `Update-Database` in the Package Manager Console.
4. Press `F5` or run `dotnet run`.

### 2. Frontend (React)
```bash
cd smart-delivery-frontend
npm install
npm run dev
