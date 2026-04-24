import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api';

/** Contexto global de autenticação - Versão Supabase (Safe Mode) */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ ...session.user, ...session.user.user_metadata });
      }
      setLoading(false);
    });

    // Ouve mudanças de estado (Login/Logout/Update)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ ...session.user, ...session.user.user_metadata });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /** Login manual (opcional, o onAuthStateChange cuida do estado) */
  const login = (userData) => {
    setUser(userData);
  };

  /** Logout via Supabase */
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ROLE_ADMIN' || 
                   user?.email === 'admin@aivoting.com' || 
                   user?.email === 'vitor@vfonseca.com' || 
                   user?.email === 'v.fonseca062@gmail.com' ||
                   user?.user_metadata?.role === 'ROLE_ADMIN';

  // Auto-Repair: Se for admin e o nome no banco estiver errado, corrigimos silenciosamente
  useEffect(() => {
    const repairAdminName = async () => {
      if (isAdmin && user && user.name !== 'Administrador') {
        console.log("[AUTO-REPAIR] Restaurando nome do Administrador no banco...");
        try {
          await supabase.from('users').update({ name: 'Administrador' }).eq('id', user.id);
          // O objeto user local já tem o override de nome abaixo no return, 
          // mas o banco será atualizado para o próximo carregamento.
        } catch (err) {
          console.warn("[AUTO-REPAIR] Falha ao atualizar banco (RLS?):", err);
        }
      }
    };
    if (isAuthenticated) repairAdminName();
  }, [isAdmin, user, isAuthenticated]);

  // Força o nome "Administrador" no objeto user se for admin, 
  // impedindo que nomes de teste apareçam no Navbar ou Profile
  if (isAdmin && user) {
    user.name = 'Administrador';
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
