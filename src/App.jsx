import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login.jsx";
import './App.css'
import CrewManager from "./pages/crews/CrewManager.jsx";
import { AuthProvider } from "./hooks/context/AuthContext.jsx";
import { ProtectedRoute } from "./components/common/ProtectedRoute.jsx";
import Register from "./pages/auth/register.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";


function App() {
  
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas, si no esta logeado el usuario se renderiza el login*/}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crews" element={<CrewManager />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

