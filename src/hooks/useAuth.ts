import { useAuth as useAuthContext } from '../../contexts/AuthContext';

export function useAuth() {
  const { user, loading, subscriptionStatus } = useAuthContext();
  return { user, loading, subscriptionStatus };
}