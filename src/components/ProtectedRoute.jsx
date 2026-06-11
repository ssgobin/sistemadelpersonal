import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase/config.js';

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  if (checking) {
    return (
      <main className="grid min-h-screen place-items-center bg-graphite text-white">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
          <Loader2 className="animate-spin text-volt" /> Verificando acesso...
        </div>
      </main>
    );
  }

  if (!user) return <Navigate to="/admin" replace />;

  return children;
}
