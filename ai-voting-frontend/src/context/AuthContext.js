import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { authAPI } from '../api';

/** Contexto global de autenticação */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { ...session.user, ...session.user.user_metadata } : null);
      setLoading(false);
    });

    // Ouve mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { ...session.user, ...session.user.user_metadata } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /** Mantendo as assinaturas legadas para não quebrar componentes */
  const login = () => { /* Vazio: state se atualiza sozinho via onAuthStateChange após o login no component */ };
  const logout = async () => {
    await supabase.auth.signOut();
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.email === 'admin@aivoting.com';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook para usar o contexto de autenticação */
export const useAuth = () => useContext(AuthContext);
