
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary' : 'text-muted-foreground';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container mx-auto px-4 pb-24 pt-6 md:pt-10">
        <div className="page-transition">
          {children}
        </div>
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-secondary border-t border-primary/30 p-2 z-10">
        <div className="flex justify-around max-w-md mx-auto">
          <Link to="/" className={`flex flex-col items-center p-2 ${isActive('/')}`}>
            <Home size={20} />
            <span className="text-xs mt-1">Início</span>
          </Link>
          <Link to="/schedule" className={`flex flex-col items-center p-2 ${isActive('/schedule')}`}>
            <Calendar size={20} />
            <span className="text-xs mt-1">Agenda</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center p-2 ${isActive('/profile')}`}>
            <User size={20} />
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
