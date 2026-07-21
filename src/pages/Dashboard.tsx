import { PageLayout } from '@/components/layout/PageLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { TransportChart } from '@/components/dashboard/TransportChart';
import { SendReportDialog } from '@/components/dashboard/SendReportDialog';
import { TripCard } from '@/components/trips/TripCard';
import { UserMenu } from '@/components/layout/UserMenu';
import { useTrips } from '@/hooks/useTrips';
import { TransportType } from '@/types/trip';
import { Plane, Route, Leaf, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InstallBanner } from '@/components/pwa/InstallBanner';

export default function Dashboard() {
  const { data: trips = [], isLoading } = useTrips();

  const completedTrips = trips.filter(t => t.status === 'completed');
  
  const stats = {
    totalTrips: completedTrips.length,
    totalDistanceKm: completedTrips.reduce((sum, t) => sum + t.distanceKm, 0),
    totalCo2Kg: completedTrips.reduce((sum, t) => sum + t.co2Kg, 0),
    tripsByTransport: completedTrips.reduce((acc, trip) => {
      acc[trip.transportType] = (acc[trip.transportType] || 0) + 1;
      return acc;
    }, {} as Record<TransportType, number>),
  };

  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime())
    .slice(0, 3);

  const thisMonthTrips = trips.filter(t => {
    const date = new Date(t.departureDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <PageLayout>
      <InstallBanner />
      <div className="page-header safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Tableau de bord</h1>
            <p className="page-subtitle">Suivi de vos déplacements professionnels</p>
          </div>
          <div className="flex items-center gap-2">
            <SendReportDialog />
            <UserMenu className="lg:hidden" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 mb-6">
            <KPICard
              icon={<Plane className="w-6 h-6 text-transport-plane" />}
              label="Trajets"
              value={stats.totalTrips}
              variant="plane"
              delay={0}
            />
            <KPICard
              icon={<Route className="w-6 h-6 text-transport-train" />}
              label="Distance"
              value={stats.totalDistanceKm}
              suffix=" km"
              variant="train"
              delay={100}
            />
            <KPICard
              icon={<Leaf className="w-6 h-6 text-transport-car" />}
              label="CO₂"
              value={Math.round(stats.totalCo2Kg)}
              suffix=" kg"
              variant="car"
              delay={200}
            />
            <KPICard
              icon={<TrendingUp className="w-6 h-6 text-transport-bus" />}
              label="Ce mois"
              value={thisMonthTrips}
              variant="bus"
              delay={300}
            />
          </div>

          {/* Chart */}
          <div className="px-5 mb-6">
            <TransportChart data={stats.tripsByTransport} />
          </div>

          {/* Recent Trips */}
          <div className="px-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Derniers trajets</h2>
              <Link to="/trips" className="text-sm text-primary hover:underline">
                Voir tout
              </Link>
            </div>
            {recentTrips.length > 0 ? (
              <div className="space-y-3">
                {recentTrips.map((trip, index) => (
                  <div 
                    key={trip.id} 
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <TripCard trip={trip} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-flat p-8 text-center">
                <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Aucun trajet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Commencez par ajouter votre premier trajet
                </p>
                <Link
                  to="/add"
                  className="inline-flex items-center text-sm font-medium rounded-lg px-4 py-2.5 bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  Ajouter un trajet
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
}
