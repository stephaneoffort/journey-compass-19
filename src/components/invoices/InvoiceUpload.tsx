import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useUploadInvoice, useInvoices, useDeleteInvoice } from '@/hooks/useInvoices';
import { Upload, Camera, FileText, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface InvoiceUploadProps {
  tripId: string;
  bookingStatus?: string;
}

export function InvoiceUpload({ tripId, bookingStatus }: InvoiceUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { data: invoices = [], isLoading } = useInvoices(tripId);
  const uploadMutation = useUploadInvoice();
  const deleteMutation = useDeleteInvoice();

  // Only show for purchased trips
  if (bookingStatus !== 'achete') {
    return null;
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`Type de fichier non supporté: ${file.name}`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Fichier trop volumineux: ${file.name} (max 10MB)`);
          continue;
        }

        await uploadMutation.mutateAsync({ tripId, file });
        toast.success(`Facture "${file.name}" ajoutée`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Erreur lors du téléchargement');
    } finally {
      setIsUploading(false);
      // Reset inputs
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDelete = async (invoice: { id: string; filePath: string }) => {
    try {
      await deleteMutation.mutateAsync({
        id: invoice.id,
        filePath: invoice.filePath,
        tripId,
      });
      toast.success('Facture supprimée');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleView = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('Impossible d\'ouvrir le fichier');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Factures / Justificatifs
        </label>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center transition-all',
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50',
          isUploading && 'opacity-50 pointer-events-none'
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Téléchargement en cours...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-3 mb-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Charger un fichier
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
                className="gap-2"
              >
                <Camera className="w-4 h-4" />
                Scanner
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ou glissez-déposez vos fichiers ici
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, JPG, PNG • Max 10MB
            </p>
          </>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Invoice List */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : invoices.length > 0 ? (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg group"
            >
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{invoice.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(invoice.fileSize)} • {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleView(invoice.url)}
                  className="h-8 w-8"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete({ id: invoice.id, filePath: invoice.filePath })}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          Aucune facture ajoutée
        </p>
      )}
    </div>
  );
}
