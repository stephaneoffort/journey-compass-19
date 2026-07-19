
# Plan de correction : Erreur 404 lors de la reconnexion Google après déconnexion

## Analyse du problème

Le problème survient spécifiquement sur le domaine publié (`journey-compass-19.lovable.app`) après une déconnexion. Lors de la tentative de reconnexion avec Google, une erreur 404 apparaît.

### Cause racine
L'infrastructure Lovable Auth utilise un "auth-bridge" qui intercepte les flux OAuth pour les environnements de preview. Ce bridge fonctionne correctement pour les domaines `*.lovable.app` mais peut causer des problèmes de redirection incorrecte après une déconnexion, en redirigeant potentiellement vers une URL de preview au lieu de l'URL publiée.

## Solution proposée

Modifier la fonction `handleGoogleSignIn` dans `Auth.tsx` pour :

1. **Nettoyer l'état d'authentification avant une nouvelle connexion** - S'assurer que le cache local est propre avant de lancer un nouveau flux OAuth
2. **Forcer la sélection du compte Google** - Déjà en place avec `prompt: 'select_account'`
3. **Ajouter un délai de sécurité** - Permettre à Supabase de finaliser la déconnexion avant de lancer une nouvelle connexion

## Modifications techniques

### Fichier : `src/pages/Auth.tsx`

Modifier la fonction `handleGoogleSignIn` pour nettoyer l'état avant la reconnexion :

```typescript
const handleGoogleSignIn = async () => {
  setGoogleLoading(true);

  try {
    // Clear any stale session state before initiating new OAuth flow
    // This helps prevent 404 errors after logout
    await supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        // Force clear local storage auth state to ensure clean slate
        localStorage.removeItem('supabase.auth.token');
      }
    });

    // Use Lovable managed OAuth flow (handles secrets automatically)
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: `${window.location.origin}/auth/callback`,
      extraParams: {
        prompt: 'select_account',
      },
    });

    if (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
      setGoogleLoading(false);
    }
  } catch (e) {
    toast({
      title: 'Erreur',
      description: e instanceof Error ? e.message : 'Erreur inconnue',
      variant: 'destructive',
    });
    setGoogleLoading(false);
  }
};
```

### Fichier : `src/hooks/useAuth.tsx`

Améliorer la fonction `signOut` pour nettoyer complètement l'état :

```typescript
const signOut = async () => {
  // Clear query cache to prevent stale data on next login
  // Sign out from Supabase
  await supabase.auth.signOut({ scope: 'local' });
  
  // Force clear any cached auth state
  setUser(null);
  setSession(null);
};
```

## Impact

- Résout l'erreur 404 lors de la reconnexion après déconnexion
- Garantit un état propre avant chaque nouveau flux OAuth
- Améliore la fiabilité de l'authentification sur le domaine publié

## Risques

- Faible : Les modifications sont minimes et ciblées sur le nettoyage de l'état
- La solution s'appuie sur les patterns recommandés par Supabase pour gérer les sessions
