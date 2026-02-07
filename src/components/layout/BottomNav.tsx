import { useState } from 'react';
import { Home, Briefcase, Calendar, Map, Plus, X, Plane, Route } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useVoyages } from '@/hooks/useVoyages';

const navItems = [
  { icon: Home, label: 'Accueil', path: '/' },
  { icon: Briefcase, label: 'Voyages', path: '/voyages' },
  { icon: Plus, label: 'Ajouter', path: '/add', isMain: true },
  { icon: Calendar, label: 'Calendrier', path: '/calendar' },
  { icon: Map, label: 'Carte', path: '/map' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { data: voyages = [] } = useVoyages();

  const handleMainClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  };

  const handleNewVoyage = () => {
    setShowMenu(false);
    navigate('/add');
  };

  const handleAddTrip = (voyageId: string) => {
    setShowMenu(false);
    navigate(`/add?voyageId=${voyageId}`);
  };

  return (
    <>
      {/* Overlay menu */}
      {showMenu && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu content */}
          <div className="absolute bottom-20 left-4 right-4 pb-[env(safe-area-inset-bottom)] animate-slide-up">
            <div className="glass-card p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Que voulez-vous faire ?</h3>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="p-1 rounded-full hover:bg-secondary"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* New voyage option */}
              <button
                onClick={handleNewVoyage}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Plane className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-medium">Nouveau voyage</div>
                  <div className="text-sm text-muted-foreground">Créer un voyage avec plusieurs déplacements</div>
                </div>
              </button>

              {/* Add trip to existing voyage */}
              {voyages.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground px-1">Ajouter un déplacement à :</div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {voyages.slice(0, 5).map((voyage) => (
                      <button
                        key={voyage.id}
                        onClick={() => handleAddTrip(voyage.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <Route className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {voyage.name || new Date(voyage.startDate || '').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {voyage.trips.length} déplacement{voyage.trips.length > 1 ? 's' : ''}
                          </div>
                        </div>
                        <Plus className="w-5 h-5 text-primary" />
                      </button>
                    ))}
                  </div>
                  {voyages.length > 5 && (
                    <Link 
                      to="/voyages" 
                      onClick={() => setShowMenu(false)}
                      className="block text-center text-sm text-primary hover:underline py-2"
                    >
                      Voir tous les voyages ({voyages.length})
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav z-50">
        <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isMain) {
              return (
                <button
                  key={item.path}
                  onClick={handleMainClick}
                  className="relative -mt-6"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-glow",
                    showMenu ? "rotate-45" : "animate-pulse-glow"
                  )} style={{ transition: 'transform 0.2s ease' }}>
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn('nav-item', isActive && 'active')}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
