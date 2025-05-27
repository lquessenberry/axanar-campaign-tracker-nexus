import { createContext } from 'react';
import { AuthContextType } from './AuthContextType';

// Create and export the context instance
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
