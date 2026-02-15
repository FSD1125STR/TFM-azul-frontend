import { createContext, useContext, useEffect, useState } from "react";
import { getLoggedUser } from "../../services/auth";

//Creamos un contexto para solicitar al backend el usuario logeado y guardarlo
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getLoggedUser();
        setUser(data.user);

      } catch (error) {
        setUser(null);

      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

//Exportamos como un custom hook
export const useAuth = () => useContext(AuthContext);