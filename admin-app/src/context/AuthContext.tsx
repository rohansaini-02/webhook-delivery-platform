import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  apiKey: string | null;
  userEmail: string | null;
  login: (email: string, apiKey: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  apiKey: null,
  userEmail: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedKey = await AsyncStorage.getItem('apiKey');
      const storedEmail = await AsyncStorage.getItem('userEmail');
      if (storedKey) {
        setApiKey(storedKey);
        setUserEmail(storedEmail);
      }
    } catch (e) {
      console.error('Failed to load auth:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, key: string) => {
    await AsyncStorage.setItem('apiKey', key);
    await AsyncStorage.setItem('userEmail', email);
    setApiKey(key);
    setUserEmail(email);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('apiKey');
    await AsyncStorage.removeItem('userEmail');
    setApiKey(null);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!apiKey,
        apiKey,
        userEmail,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
