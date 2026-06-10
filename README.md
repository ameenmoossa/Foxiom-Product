# Foxiom Product Hub — Frontend

A modern, Odoo-inspired internal product launcher built for Foxiom IT Solutions. The frontend serves as the visual gateway to all company IT products — giving employees a clean grid-based launcher to discover and access tools, while admins get a full control panel to manage products, users, and platform settings.

**React.js • Vite • Tailwind CSS • Role-Based UI • Internal Launcher • Admin Dashboard**

---

## 🌟 Features

### Launcher (Employee View)
- Odoo-style product grid interface
- One-click product access
- Product icons, names, and descriptions
- Clean and responsive card layout

### Admin Panel
- Add, edit, delete, and archive products
- Manage user accounts
- View archived products separately
- Upload product icons (Base64 storage)

### Authentication Pages
- Login with JWT session handling
- Forgot password with OTP email flow
- Auto-logout after 30 minutes of inactivity
- Protected route wrappers per role

### UI/UX
- Responsive design across all screen sizes
- Role-aware navigation (Admin vs Employee)
- Toast notifications for actions
- Smooth transitions and loading states

---

## 🏗️ Project Structure
Foxiom-Product-frontend/
│
├── public/
│
├── src/
│   ├── components/       # Navbar, ProductCard, Modal, Sidebar
│   ├── pages/            # Login, Launcher, AdminPanel, ForgotPassword
│   ├── context/          # AuthContext, global state
│   ├── services/         # Axios API service calls
│   ├── routes/           # ProtectedRoute, RoleRoute wrappers
│   ├── assets/           # Icons, images, static files
│   └── App.jsx
│
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json

---

## 📋 Prerequisites

- Node.js 18+
- npm
- Foxiom Product Hub Backend running

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd Foxiom-Product-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Development Server

```bash
npm run dev
```

Application runs on:
http://localhost:5173

---

## 🎯 Pages & Modules

### Login Page
Secure login form with JWT token handling and session persistence.

### Forgot Password
OTP input flow — request OTP via email, verify, then reset password.

### Launcher (Home)
Employee-facing Odoo-style product grid. Displays all active products as clickable cards.

### Admin Panel
Full product management UI — create, edit, archive, and delete products. Manage users and view platform data.

### Protected Routes
Role-based route guards — Admins access the full panel, Employees see the launcher only.

---

## 🔐 User Roles

### Admin
Full UI access — product management, user management, archived product view, platform settings.

### Employee
Launcher access only — browse and open active IT products.

---

## 🛠️ Technologies Used

### Core
- React.js
- Vite
- JavaScript (ES6+)

### Styling
- Tailwind CSS
- Responsive Design
- Custom CSS utilities

### State & Routing
- React Context API
- React Router DOM

### API & Auth
- Axios (with base URL switching for dev/prod)
- JWT token storage and management
- Auto-logout inactivity timer

---

## 🌐 Live Deployment

| Layer | URL |
|-------|-----|
| Frontend | https://foxiom-product.web.app |
| Backend API | https://foxiom-product-backend.onrender.com |
| Hosting | Firebase |

---

## 🔮 Future Enhancements

- Product search and filter
- Per-user product access control
- Dark / light theme toggle
- Product usage analytics
- Notification system
- Mobile app version

---

