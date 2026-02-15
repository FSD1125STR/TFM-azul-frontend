import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import './App.css'
import CrewManager from "./components/CrewManager.jsx";
import Header from "./pages/Headers.jsx";


function App() {
  
  
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><h1>Home Page - Coming Soon</h1></div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><h1>Register Page - Coming Soon</h1></div>} />
        <Route path="/dashboard" element={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><h1>Dashboard - Coming Soon</h1></div>} />
        <Route path="/crews" element={<CrewManager />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

