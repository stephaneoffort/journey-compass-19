import { forwardRef } from 'react';
import { TransportType, transportLabels } from '@/types/trip';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TransportChartProps {
  data: Record<TransportType, number>;
}

const transportColors: Record<TransportType, string> = {
  plane: 'hsl(199, 89%, 58%)',
  train: 'hsl(142, 71%, 45%)',
  car: 'hsl(25, 95%, 53%)',
  bus: 'hsl(271, 81%, 56%)',
  boat: 'hsl(186, 78%, 46%)',
  metro: 'hsl(340, 82%, 52%)',
  logement: 'hsl(45, 93%, 47%)',
  frais: 'hsl(210, 14%, 53%)',
};

export const TransportChart = forwardRef<HTMLDivElement, TransportChartProps>(
  ({ data }, ref) => {
    const chartData = Object.entries(data)
      .filter(([_, value]) => value > 0)
      .map(([type, value]) => ({
        name: transportLabels[type as TransportType],
        value,
        color: transportColors[type as TransportType],
      }));

    if (chartData.length === 0) {
      return (
        <div ref={ref} className="card-flat p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Répartition par transport</h3>
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            Aucune donnée
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="card-flat p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Répartition par transport</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

TransportChart.displayName = 'TransportChart';
