import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PrefetchLink } from '../hooks/usePrefetch';
import { Bell, Menu, X, Settings, LogOut, ShoppingBag, User as UserIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import logo from '../assets/logo transparente.png';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = React.useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Verificar usuário atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Fechar menu ao clicar fora
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fechar menus ao mudar de rota
  React.useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                window.location.href = '/';
              }
            }}
            className="flex items-center gap-2 hover:opacity-80 transition flex-shrink-0"
          >
            <img src={logo} alt="TratorHub" className="h-14 sm:h-16 w-auto" />
            <span className="text-xl font-bold text-gray-900 hidden sm:inline">TratorHub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 flex-1 justify-center">
            <PrefetchLink
              to="/comprar"
              className={`text-gray-600 hover:text-green-600 transition border-b-2 pb-1 whitespace-nowrap ${
                isActive('/comprar') ? 'border-green-600 text-green-600 font-medium' : 'border-transparent'
              }`}
            >
              Comprar
            </PrefetchLink>
            <PrefetchLink
              to="/alugar"
              className={`text-gray-600 hover:text-green-600 transition border-b-2 pb-1 whitespace-nowrap ${
                isActive('/alugar') ? 'border-green-600 text-green-600 font-medium' : 'border-transparent'
              }`}
            >
              Alugar
            </PrefetchLink>
            <PrefetchLink
              to="/vender"
              className={`text-gray-600 hover:text-green-600 transition border-b-2 pb-1 whitespace-nowrap ${
                isActive('/vender') ? 'border-green-600 text-green-600 font-medium' : 'border-transparent'
              }`}
            >
              Vender
            </PrefetchLink>
            <PrefetchLink
              to="/como-funciona"
              className={`text-gray-600 hover:text-green-600 transition border-b-2 pb-1 whitespace-nowrap ${
                isActive('/como-funciona') ? 'border-green-600 text-green-600 font-medium' : 'border-transparent'
              }`}
            >
              Como Funciona
            </PrefetchLink>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {user && (
              <button
                className="p-2 text-gray-600 hover:text-green-600 transition relative hidden sm:block"
                aria-label="Notificações"
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            )}

            {user ? (
              <div className="relative hidden sm:block" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 bg-gray-900 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm lg:text-base"
                >
                  <UserIcon size={20} />
                  <span className="hidden lg:inline">Minha Conta</span>
                </button>

                {/* Menu Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 transition-all duration-200 ${
                    isMenuOpen
                      ? 'opacity-100 translate-y-0 visible'
                      : 'opacity-0 -translate-y-2 invisible'
                  }`}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Logado como</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/perfil"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Settings size={18} />
                      Meu Perfil
                    </Link>
                    <Link
                      to="/meus-anuncios"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                    >
                      <ShoppingBag size={18} />
                      Meus Anúncios
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={18} />
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/entrar')}
                className="hidden sm:flex items-center gap-2 bg-gray-900 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm lg:text-base"
              >
                <UserIcon size={20} />
                <span className="hidden lg:inline">Entrar</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'max-h-[600px] opacity-100'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-3 space-y-1 border-t border-gray-100">
            <PrefetchLink
              to="/comprar"
              className={`block px-4 py-3 rounded-lg transition font-medium ${
                isActive('/comprar')
                  ? 'bg-green-50 text-green-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Comprar
            </PrefetchLink>
            <PrefetchLink
              to="/alugar"
              className={`block px-4 py-3 rounded-lg transition font-medium ${
                isActive('/alugar')
                  ? 'bg-green-50 text-green-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Alugar
            </PrefetchLink>
            <PrefetchLink
              to="/vender"
              className={`block px-4 py-3 rounded-lg transition font-medium ${
                isActive('/vender')
                  ? 'bg-green-50 text-green-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Vender
            </PrefetchLink>
            <PrefetchLink
              to="/como-funciona"
              className={`block px-4 py-3 rounded-lg transition font-medium ${
                isActive('/como-funciona')
                  ? 'bg-green-50 text-green-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Como Funciona
            </PrefetchLink>

            {user ? (
              <>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="px-4 py-2 mb-2">
                    <p className="text-xs text-gray-500">Logado como</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/perfil"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Settings size={20} />
                    <span className="font-medium">Meu Perfil</span>
                  </Link>
                  <Link
                    to="/meus-anuncios"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <ShoppingBag size={20} />
                    <span className="font-medium">Meus Anúncios</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition mt-2"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Sair</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-100 pt-2 mt-2">
                <button
                  onClick={() => navigate('/entrar')}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
                >
                  <UserIcon size={20} />
                  <span>Entrar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}