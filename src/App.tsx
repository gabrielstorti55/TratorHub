import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase, isAuthenticated } from './lib/supabase';
import { usePrefetchRoutes } from './hooks/usePrefetch';
import { CompareProvider } from './contexts/CompareContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CompareBar from './components/CompareBar';

// Lazy loading para melhor performance
const Home = lazy(() => import('./pages/Home'));
const Buy = lazy(() => import('./pages/Buy'));
const Rent = lazy(() => import('./pages/Rent'));
const Sell = lazy(() => import('./pages/Sell'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const MyListings = lazy(() => import('./pages/MyListings'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const EditListing = lazy(() => import('./pages/EditListing'));
const Compare = lazy(() => import('./pages/Compare'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Prefetch de rotas comuns
  usePrefetchRoutes();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const isUserAuthenticated = await isAuthenticated();
        
        // Se não estiver autenticado e tentar acessar rotas protegidas
        if (!isUserAuthenticated && location.pathname !== '/entrar') {
          const protectedRoutes = ['/perfil', '/meus-anuncios', '/vender', '/editar-anuncio'];
          if (protectedRoutes.some(route => location.pathname.startsWith(route))) {
            navigate('/entrar', { 
              state: { from: location.pathname },
              replace: true
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setAuthChecked(true);
        setIsLoading(false);
      }
    };

    checkAuth();

    // Monitorar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session && location.pathname !== '/entrar') {
        const protectedRoutes = ['/perfil', '/meus-anuncios', '/vender', '/editar-anuncio'];
        if (protectedRoutes.some(route => location.pathname.startsWith(route))) {
          navigate('/entrar', { 
            state: { from: location.pathname },
            replace: true
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (isLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <CompareProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/comprar" element={<Buy />} />
              <Route path="/alugar" element={<Rent />} />
              <Route path="/vender" element={<Sell />} />
              <Route path="/como-funciona" element={<HowItWorks />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/entrar" element={<Login />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/meus-anuncios" element={<MyListings />} />
              <Route path="/produto/:id" element={<ProductDetails />} />
              <Route path="/editar-anuncio/:id" element={<EditListing />} />
              <Route path="/comparar" element={<Compare />} />
            </Routes>
          </Suspense>
        </div>
        <CompareBar />
        <Footer />
      </div>
    </CompareProvider>
  );
}