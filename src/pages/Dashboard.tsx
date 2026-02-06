import { PageLayout } from '@/components/layout/PageLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { TransportChart } from '@/components/dashboard/TransportChart';
import { TripCard } from '@/components/trips/TripCard';
import { mockTrips, calculateStats } from '@/data/mockTrips';
import { Plane, Route, Leaf, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = calculateStats(mockTrips);
  const recentTrips = mockTrips
    .sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime())
    .slice(0, 3);

  return (
    <PageLayout>
      <div className="page-header safe-top">
        <h1 className="page-title">Tableau de bord</h1>
        <p className="page-subtitle">Suivi de vos déplacements professionnels</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 px-5 mb-6">
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
          value={mockTrips.filter(t => {
            const date = new Date(t.departureDate);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          }).length}
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
      </div>
    </PageLayout>
  );
}
