import { useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { FileSpreadsheet, Loader2, Send, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type PeriodType = 'current' | 'previous' | 'custom';

export function SendReportDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [periodType, setPeriodType] = useState<PeriodType>('previous');
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  const getDateRange = () => {
    const now = new Date();
    switch (periodType) {
      case 'current':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'previous':
        const prev = subMonths(now, 1);
        return { start: startOfMonth(prev), end: endOfMonth(prev) };
      case 'custom':
        return { start: customFrom, end: customTo };
    }
  };

  const getPeriodLabel = () => {
    const range = getDateRange();
    if (!range.start || !range.end) return '';
    return `${format(range.start, 'dd MMM yyyy', { locale: fr })} → ${format(range.end, 'dd MMM yyyy', { locale: fr })}`;
  };

  const handleSend = async () => {
    if (!user) return;

    const recipientEmail = email.trim() || user.email;
    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      toast.error('Email invalide');
      return;
    }

    const range = getDateRange();
    if (!range.start || !range.end) {
      toast.error('Veuillez sélectionner une période complète');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('monthly-report', {
        body: {
          userId: user.id,
          recipientEmail,
          startDate: format(range.start, 'yyyy-MM-dd'),
          endDate: format(range.end, 'yyyy-MM-dd'),
        },
      });

      if (error) throw error;
      toast.success(`Rapport envoyé à ${recipientEmail}`);
      setOpen(false);
      setEmail('');
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi du rapport");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          Envoyer le rapport
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Envoyer le rapport
          </DialogTitle>
          <DialogDescription>
            Choisissez la période et le destinataire du rapport Excel.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Period selection */}
          <div className="space-y-2">
            <Label>Période</Label>
            <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Mois en cours</SelectItem>
                <SelectItem value="previous">Mois précédent</SelectItem>
                <SelectItem value="custom">Période personnalisée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {periodType === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Du</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left text-xs font-normal", !customFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {customFrom ? format(customFrom, 'dd/MM/yyyy') : 'Début'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customFrom} onSelect={setCustomFrom} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Au</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left text-xs font-normal", !customTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {customTo ? format(customTo, 'dd/MM/yyyy') : 'Fin'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customTo} onSelect={setCustomTo} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {periodType !== 'custom' && (
            <p className="text-xs text-muted-foreground">{getPeriodLabel()}</p>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Email du destinataire</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder={user?.email || 'email@exemple.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Laissez vide pour envoyer à votre adresse ({user?.email})
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSend} disabled={sending} className="gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Envoyer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
