import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plane, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  fullName: z.string().optional(),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate
    const result = authSchema.safeParse({ email, password, fullName });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Erreur de connexion',
              description: 'Email ou mot de passe incorrect.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Erreur',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Compte existant',
              description: 'Un compte existe déjà avec cet email.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Erreur',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Inscription réussie ! 🎉',
            description: 'Vérifiez votre email pour confirmer votre compte.',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Plane className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-display">TripTracker</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-muted-foreground">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="input-glass pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="input-glass pl-10"
                required
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-glass pl-10"
                required
              />
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <Button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Se connecter' : "S'inscrire"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline ml-1 font-medium"
          >
            {isLogin ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
}
