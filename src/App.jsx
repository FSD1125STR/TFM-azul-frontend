import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import './App.css'
import CrewManager from "./components/CrewManager.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><h1>Register Page - Coming Soon</h1></div>} />
        <Route path="/dashboard" element={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><h1>Dashboard - Coming Soon</h1></div>} />
        <Route path="/crew" element={<CrewManager />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

