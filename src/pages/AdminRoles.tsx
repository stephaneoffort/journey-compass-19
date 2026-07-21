import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Shield, Loader2, UserPlus, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  user: 'Utilisateur',
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-red-500/10 text-red-500 border-red-500/20',
  manager: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  user: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  roles: AppRole[];
}

export default function AdminRoles() {
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<Record<string, AppRole>>({});

  // Fetch users via RPC
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: fnData, error } = await supabase.functions.invoke('admin-list-users');
      if (error) throw error;
      const userList = (fnData as any)?.users ?? [];

      // Fetch all roles
      const { data: allRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rolesError) throw rolesError;

      const rolesMap: Record<string, AppRole[]> = {};
      (allRoles || []).forEach((r: any) => {
        if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
        rolesMap[r.user_id].push(r.role as AppRole);
      });

      return (userList || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        roles: rolesMap[u.id] || [],
      })) as UserWithRoles[];
    },
    enabled: isAdmin,
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Rôle ajouté');
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de l'ajout du rôle");
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Rôle retiré');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur lors de la suppression du rôle');
    },
  });

  if (roleLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleAddRole = (userId: string) => {
    const role = selectedRole[userId];
    if (!role) {
      toast.error('Sélectionnez un rôle');
      return;
    }
    addRoleMutation.mutate({ userId, role });
    setSelectedRole((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  return (
    <PageLayout>
      <div className="page-header safe-top">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary" />
          <div>
            <h1 className="page-title">Gestion des rôles</h1>
            <p className="page-subtitle">Attribuer et gérer les rôles des utilisateurs</p>
          </div>
        </div>
      </div>

      <div className="px-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="card-flat overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôles actuels</TableHead>
                  <TableHead>Ajouter un rôle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const availableRoles = (['admin', 'manager', 'user'] as AppRole[]).filter(
                    (r) => !u.roles.includes(r)
                  );
                  const isSelf = u.id === user?.id;

                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.email}
                        {isSelf && (
                          <span className="ml-2 text-xs text-muted-foreground">(vous)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {u.roles.length === 0 && (
                            <span className="text-sm text-muted-foreground">Aucun rôle</span>
                          )}
                          {u.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="outline"
                              className={`${ROLE_COLORS[role]} gap-1`}
                            >
                              {ROLE_LABELS[role]}
                              {!(isSelf && role === 'admin') && (
                                <button
                                  onClick={() => removeRoleMutation.mutate({ userId: u.id, role })}
                                  className="ml-1 hover:opacity-70"
                                  title="Retirer ce rôle"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {availableRoles.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <Select
                              value={selectedRole[u.id] || ''}
                              onValueChange={(v) =>
                                setSelectedRole((prev) => ({ ...prev, [u.id]: v as AppRole }))
                              }
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Choisir..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableRoles.map((r) => (
                                  <SelectItem key={r} value={r}>
                                    {ROLE_LABELS[r]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => handleAddRole(u.id)}
                              disabled={!selectedRole[u.id]}
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Tous attribués</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
