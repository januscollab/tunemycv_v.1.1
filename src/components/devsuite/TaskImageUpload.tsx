import React, { useState, useRef } from 'react';
import { VybeButton } from '@/components/design-system/VybeButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface TaskImage {
  id: string;
  image_url: string;
  file_name: string;
  file_size: number;
}

interface TaskImageUploadProps {
  taskId?: string;
  images: TaskImage[];
  onImagesChange: (images: TaskImage[]) => void;
  disabled?: boolean;
}

const TaskImageUpload: React.FC<TaskImageUploadProps> = ({
  taskId,
  images,
  onImagesChange,
  disabled = false,
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    const newImages: TaskImage[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to storage
        const { data: storageData, error: uploadError } = await supabase.storage
          .from('task-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('task-images')
          .getPublicUrl(fileName);

        const imageData: TaskImage = {
          id: `temp-${Date.now()}-${Math.random()}`,
          image_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
        };

        // If we have a taskId, save to database
        if (taskId) {
          const { data: dbData, error: dbError } = await supabase
            .from('task_images')
            .insert({
              task_id: taskId,
              image_url: publicUrl,
              file_name: file.name,
              file_size: file.size,
              uploaded_by: user.id,
            })
            .select()
            .single();

          if (dbError) throw dbError;
          imageData.id = dbData.id;
        }

        newImages.push(imageData);
      }

      onImagesChange([...images, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (disabled) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      const fileList = new DataTransfer();
      imageFiles.forEach(file => fileList.items.add(file));
      await handleFileUpload(fileList.files);
    }
  };

  const handleRemoveImage = async (image: TaskImage) => {
    try {
      // Remove from database if it exists
      if (taskId && !image.id.startsWith('temp-')) {
        const { error: dbError } = await supabase
          .from('task_images')
          .delete()
          .eq('id', image.id);

        if (dbError) throw dbError;
      }

      // Remove from storage
      const urlParts = image.image_url.split('/');
      const fileName = urlParts.slice(-2).join('/'); // user_id/filename
      
      const { error: storageError } = await supabase.storage
        .from('task-images')
        .remove([fileName]);

      if (storageError) console.warn('Failed to remove from storage:', storageError);

      // Update local state
      onImagesChange(images.filter(img => img.id !== image.id));
      toast.success('Image removed');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="h-4 w-4" />
        <span className="text-sm font-medium text-foreground">Images</span>
      </div>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          disabled 
            ? 'border-border/50 bg-muted/20 cursor-not-allowed' 
            : 'border-border hover:border-ring cursor-pointer'
        }`}
        onPaste={handlePaste}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-1">
          Click to upload images or paste screenshots
        </p>
        <p className="text-xs text-muted-foreground">
          Supports PNG, JPG, GIF up to 5MB each
        </p>
        
        {uploading && (
          <div className="mt-2">
            <div className="animate-spin h-4 w-4 border-2 border-ring border-t-transparent rounded-full mx-auto"></div>
            <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.image_url}
                alt={image.file_name}
                className="w-full h-20 object-cover rounded-lg border border-border"
              />
              {!disabled && (
                <button
                  onClick={() => handleRemoveImage(image)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-1 rounded-b-lg">
                <p className="text-xs text-foreground truncate">{image.file_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskImageUpload;