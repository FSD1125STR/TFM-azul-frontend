import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login.jsx";
import "./App.css"
import CreateCrew from "./pages/crews/CreateCrew.jsx";
import { AuthProvider } from "./hooks/context/AuthContext.jsx";
import { ProtectedRoute } from "./components/common/ProtectedRoute.jsx";
import Register from "./pages/auth/register.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import CrewLayout from "./components/layout/CrewLayout.jsx";
import MyCrews from "./pages/crews/MyCrews.jsx";
import CrewDetails from "./pages/crews/CrewDetails.jsx";
import CrewEvents from "./pages/events/crewEvents.jsx";
import CrewFiles from "./pages/files/crewFiles.jsx";
import CrewPolls from "./pages/polls/crewPolls.jsx";
import CrewMembers from "./pages/users/crewUsers.jsx";
import CrewGroups from "./pages/groups/crewGroups.jsx";


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
                        <Route path="/crews/create" element={<CreateCrew />} />

                        {/* Rutas dentro de una crew con su layout de navegacion */}
                        <Route path="/crews/:idCrew" element={<CrewLayout />}>
                            {/* RUTAS SIN EL CARACTER '/' PARA QUE SEAN RELATIVAS AL PADRE, PERMITIENDO LA NAVEGACION EN LA MISMA CREW */}
                            <Route index element={<CrewDetails />} />
                            <Route path="edit" element={<CrewDetails />} />
                            <Route path="events" element={<CrewEvents />} />
                            <Route path="files" element={<CrewFiles />} />
                            <Route path="polls" element={<CrewPolls />} />
                            <Route path="members" element={<CrewMembers />} />
                            <Route path="groups" element={<CrewGroups />} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;

