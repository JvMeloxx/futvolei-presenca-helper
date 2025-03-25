
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import Button from "../components/Button";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="glass-effect rounded-2xl p-8 max-w-md w-full text-center border border-primary/30">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary mb-6">
          <AlertTriangle size={32} className="text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-primary">Página não encontrada</h1>
        
        <p className="text-muted-foreground mb-6">
          A página "{location.pathname}" não existe ou foi removida.
        </p>
        
        <Button 
          variant="primary" 
          leftIcon={<ChevronLeft size={18} />}
          fullWidth
        >
          <Link to="/">Voltar para o início</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
