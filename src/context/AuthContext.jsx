import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem("libraryAuth");

    return savedAuth
      ? JSON.parse(savedAuth)
      : null;
  });

  const login = (username, password) => {
    const credentials = btoa(`${username}:${password}`);

    const authData = {
      username,
      password,
      credentials,
    };

    localStorage.setItem(
      "libraryAuth",
      JSON.stringify(authData)
    );

    setAuth(authData);
  };

  const logout = () => {
    localStorage.removeItem("libraryAuth");
    setAuth(null);
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        isAuthenticated: !!auth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}