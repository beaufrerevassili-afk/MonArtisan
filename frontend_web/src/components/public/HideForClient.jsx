import { useAuth } from '../../context/AuthContext';

export default function HideForClient({ children }) {
  const auth = useAuth() || {};
  if (auth.user?.role === 'client') return null;
  return children;
}
