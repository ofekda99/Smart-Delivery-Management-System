# 🚚 LogiTrack Pro - Smart Delivery Management System

LogiTrack Pro is a professional Full-Stack logistics platform. It combines a modern React frontend with a powerful .NET backend to solve real-world delivery challenges through smart routing algorithms and RAG-based AI assistance.

**🌐 Live Demo:** [https://smart-delivey-system.netlify.app/](https://smart-delivey-system.netlify.app/)

---

## 🌟 Key Features

* **Live Courier Map:** Interactive visualization of delivery points and courier locations using **Leaflet.js**.
* **Smart Route Optimization:** A custom-built **Greedy Algorithm** that automatically calculates the most efficient delivery sequence for couriers, significantly minimizing travel distance and fuel costs.
* **AI Dispatch Assistant (RAG):** An intelligent chatbot powered by **Gemini API** using **Retrieval-Augmented Generation (RAG)**. It retrieves real-time delivery data directly from the SQL database to provide accurate, data-driven insights and status updates.
* **Role-Based Access Control (RBAC):** Secure, dedicated interfaces for **Admins** (fleet management) and **Couriers** (task execution).
* **Real-Time Updates:** Dynamic UI that reflects delivery status changes and assignments instantly.

## 🏗 Architecture & Design Patterns

The backend is built with a focus on **Clean Architecture** and enterprise-grade standards:

* **RAG Architecture:** The AI assistant uses a RAG pipeline to fetch live shipment context from the database, preventing AI hallucinations and ensuring factual responses.
* **Repository Pattern:** Decouples the business logic from the data access layer (**Entity Framework Core**), ensuring the system is maintainable and testable.
* **Service Layer:** Encapsulates complex logic—including the **Route Optimization Algorithm** and AI processing—into dedicated, reusable services.
* **Dependency Injection:** Fully utilized in .NET to manage object lifetimes and enhance system modularity.

## 🛠 Tech Stack

* **Frontend:** React.js (Vite), Leaflet.js, Lucide Icons, Axios.
* **Backend:** .NET 8 / ASP.NET Core Web API.
* **Database:** SQL Server (SSMS) with Entity Framework Core.
* **AI Integration:** Gemini API (RAG implementation for logistics).

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
