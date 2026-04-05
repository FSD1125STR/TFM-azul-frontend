import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login.jsx";
import JoinCrew from "./pages/auth/JoinCrew.jsx";
import "./App.css";
import CreateCrew from "./pages/crews/CreateCrew.jsx";
import { AuthProvider } from "./hooks/context/AuthContext.jsx";
import { SocketProvider } from "./hooks/context/SocketContext.jsx";
import { ProtectedRoute } from "./components/common/ProtectedRoute.jsx";
import Register from "./pages/auth/Register.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import CrewLayout from "./components/layout/CrewLayout.jsx";
import GroupLayout from "./components/layout/GroupLayout.jsx";
import MyCrews from "./pages/crews/myCrews.jsx";
import CrewDetails from "./pages/crews/Crewdetails.jsx";
import CrewEvents from "./pages/events/crewEvents.jsx";
import CreateEvent from "./pages/events/CreateEvent.jsx";
import EventDetail from "./pages/events/EventDetail.jsx";
import EditEvent from "./pages/events/EditEvent.jsx";
import CrewFiles from "./pages/files/crewFiles.jsx";
import CrewPolls from "./pages/polls/crewPolls.jsx";
import CrewMembers from "./pages/crews/components/crewMembers.jsx";
import CrewGroups from "./pages/groups/crewGroups.jsx";
import Events from "./pages/events/Events.jsx";
import CrewInvitations from "./pages/invitations/CrewInvitations.jsx";
import AccountSettings from "./pages/users/AccountSettings.jsx";

function App() {
    return (
        <AuthProvider>
            {/* SocketProvider está dentro de AuthProvider para poder leer isLoggedIn
                y conectar/desconectar el socket según el estado de sesión */}
            <SocketProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/invite/:token"
                            element={
                                <ProtectedRoute>
                                    <JoinCrew />
                                </ProtectedRoute>
                            }
                        />

                        {/* Rutas protegidas, si no esta logeado el usuario se renderiza el login*/}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <AppLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/crews" element={<MyCrews />} />
                            <Route path="/crews/create" element={<CreateCrew />} />
                            <Route path="/events" element={<Events />} />
                            <Route path="/account-settings" element={<AccountSettings />} />

                            {/* Rutas dentro de una crew con su layout de navegacion */}
                            <Route path="/crews/:idCrew" element={<CrewLayout />}>
                                {/* RUTAS SIN EL CARACTER '/' PARA QUE SEAN RELATIVAS AL PADRE, PERMITIENDO LA NAVEGACION EN LA MISMA CREW */}
                                <Route index element={<CrewDetails />} />
                                <Route path="edit" element={<CrewDetails />} />
                                <Route path="events" element={<CrewEvents />} />
                                <Route path="events/create" element={<CreateEvent />} />
                                <Route path="events/:eventId" element={<EventDetail />} />
                                <Route path="events/:eventId/edit" element={<EditEvent />} />
                                <Route path="files" element={<CrewFiles />} />
                                <Route path="polls" element={<CrewPolls />} />
                                <Route path="members" element={<CrewMembers />} />
                                <Route path="groups" element={<CrewGroups />} />

                                {/** Rutas dentro de un grupo, carga el layout de navegacion del grupo sustituyendolo por el de la crew */}
                                <Route path="groups/:groupId" element={<GroupLayout />}>
                                    <Route index element={<div>Group Overview (TODO)</div>} />
                                    <Route path="events" element={<div>Group Events (TODO)</div>} />
                                    <Route path="events/create" element={<CreateEvent />} />
                                    <Route path="events/:eventId" element={<EventDetail />} />
                                    <Route path="events/:eventId/edit" element={<EditEvent />} />
                                    <Route path="polls" element={<div>Group Polls (TODO)</div>} />
                                    <Route path="members" element={<div>Group Members (TODO)</div>} />
                                </Route>
                                
                                <Route path="invite" element={<CrewInvitations />} />
                            </Route>
                        </Route>

                    </Routes>
                </BrowserRouter>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;
