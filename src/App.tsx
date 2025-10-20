import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase, isAuthenticated } from './lib/supabase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Buy from './pages/Buy';
import Rent from './pages/Rent';
import Sell from './pages/Sell';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Profile from './pages/Profile';
import MyListings from './pages/MyListings';
import ProductDetails from './pages/ProductDetails';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const isUserAuthenticated = await isAuthenticated();
        
        // Se não estiver autenticado e tentar acessar rotas protegidas
        if (!isUserAuthenticated && location.pathname !== '/entrar') {
          const protectedRoutes = ['/perfil', '/meus-anuncios', '/vender'];
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
        const protectedRoutes = ['/perfil', '/meus-anuncios', '/vender'];
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow">
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
        </Routes>
      </div>
      <Footer />
    </div>
  );
}