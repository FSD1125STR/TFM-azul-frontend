import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/login.jsx";
import './App.css'
import CrewManager from "./components/CrewManager.jsx";
import { AuthProvider } from "./hooks/context/AuthContext.jsx";
import { ProtectedRoute } from "./components/common/ProtectedRoute.jsx";
import Register from "./pages/auth/register.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";


function App() {
  
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas, si no esta logeado el usuario se renderiza el login*/}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/crew" element={<CrewManager />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

