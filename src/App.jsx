import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

function PageLoader() {
  return (
    <main className="grid min-h-screen place-items-center bg-graphite text-white">
      <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
        <Loader2 className="animate-spin text-volt" /> Carregando...
      </div>
    </main>
  );
}
