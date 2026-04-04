import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { FileSpreadsheet, Loader2, Send } from 'lucide-react';

export function SendReportDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!user) return;

    const recipientEmail = email.trim() || user.email;
    if (!recipientEmail) {
      toast.error('Veuillez saisir un email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast.error('Email invalide');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('monthly-report', {
        body: {
          userId: user.id,
          recipientEmail,
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
            Envoyer le rapport mensuel
          </DialogTitle>
          <DialogDescription>
            Le rapport Excel du mois précédent sera envoyé par email avec les liens de téléchargement des factures.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
              Laissez vide pour envoyer à votre propre adresse ({user?.email})
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSend} disabled={sending} className="gap-2">
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Envoyer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
