import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login.jsx";
import './App.css'
import CrewManager from "./pages/crews/CrewManager.jsx";
import { AuthProvider } from "./hooks/context/AuthContext.jsx";
import { ProtectedRoute } from "./components/common/ProtectedRoute.jsx";
import Register from "./pages/auth/register.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import CrewLayout from "./components/layout/CrewLayout.jsx";
import MyCrews from "./pages/crews/myCrews.jsx";
import CrewDetail from "./pages/crews/Crewdetails.jsx";


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
                    <Route path="/crews" element={<MyCrews />} />

                    {/* Rutas dentro de una crew con su layout de navegacion */}
                    <Route element={<CrewLayout />}>
                        <Route path="/crews/:id" element={<CrewDetail />} />
                        <Route path="/crews/:id/edit" element={<CrewDetail />} />
                        <Route path="/crews/create" element={<CrewManager />} />
                    </Route>
                </Route>
              </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

