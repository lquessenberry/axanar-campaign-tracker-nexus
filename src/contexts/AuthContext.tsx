/**
 * Auth Context Exports
 * 
 * This file is maintained for backward compatibility.
 * All functionality has been moved to separate files:
 * - Context: src/contexts/AuthContext.ts
 * - Provider: src/providers/AuthProvider.tsx
 * - Hook: src/hooks/useAuth.ts
 */

export { AuthContext } from './AuthContext';
export { AuthProvider } from '@/providers/AuthProvider';
export { useAuth } from '@/hooks/useAuth';
