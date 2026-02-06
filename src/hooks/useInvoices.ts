import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Invoice {
  id: string;
  tripId: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  url?: string;
}

function mapDbToInvoice(row: any): Invoice {
  return {
    id: row.id,
    tripId: row.trip_id,
    fileName: row.file_name,
    filePath: row.file_path,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    createdAt: row.created_at,
  };
}

export function useInvoices(tripId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['invoices', tripId],
    queryFn: async () => {
      if (!user || !tripId) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get signed URLs for each invoice
      const invoicesWithUrls = await Promise.all(
        data.map(async (invoice) => {
          const { data: urlData } = await supabase.storage
            .from('invoices')
            .createSignedUrl(invoice.file_path, 3600);

          return {
            ...mapDbToInvoice(invoice),
            url: urlData?.signedUrl,
          };
        })
      );

      return invoicesWithUrls;
    },
    enabled: !!user && !!tripId,
  });
}

export function useUploadInvoice() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ tripId, file }: { tripId: string; file: File }) => {
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${tripId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create invoice record
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          trip_id: tripId,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToInvoice(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.tripId] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, filePath, tripId }: { id: string; filePath: string; tripId: string }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('invoices')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete invoice record
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.tripId] });
    },
  });
}
