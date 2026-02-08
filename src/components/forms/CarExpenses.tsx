import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Receipt } from 'lucide-react';

export interface CarExpensesData {
  tollExpense: string;
  parkingExpense: string;
  otherExpense: string;
}

interface CarExpensesProps {
  expenses: CarExpensesData;
  onChange: (expenses: CarExpensesData) => void;
}

export function CarExpenses({ expenses, onChange }: CarExpensesProps) {
  const updateExpense = (field: keyof CarExpensesData, value: string) => {
    onChange({ ...expenses, [field]: value });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Receipt className="w-4 h-4" />
        <span>Frais de déplacement</span>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Péage (€)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={expenses.tollExpense}
            onChange={(e) => updateExpense('tollExpense', e.target.value)}
            placeholder="0.00"
            className="input-glass text-sm"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Parking (€)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={expenses.parkingExpense}
            onChange={(e) => updateExpense('parkingExpense', e.target.value)}
            placeholder="0.00"
            className="input-glass text-sm"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Autres (€)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={expenses.otherExpense}
            onChange={(e) => updateExpense('otherExpense', e.target.value)}
            placeholder="0.00"
            className="input-glass text-sm"
          />
        </div>
      </div>
    </div>
  );
}
