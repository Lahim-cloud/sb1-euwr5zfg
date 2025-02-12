import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ImageUploaderProps = {
  onImageUpload: (file: File) => void;
  className?: string;
};

export function ImageUploader({ onImageUpload, className = '' }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: existingLogo, error: listError } = await supabase
        .storage
        .from('company-logos')
        .list('', {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError) {
        console.warn('Error listing logos:', listError);
        return;
      }

      if (existingLogo && existingLogo.length > 0) {
        const { data: { publicUrl }, error: urlError } = supabase
          .storage
          .from('company-logos')
          .getPublicUrl(existingLogo[0].name);

        if (urlError) {
          console.warn('Error getting public URL:', urlError);
          return;
        }

        // Verify the URL is accessible
        const response = await fetch(publicUrl, { method: 'HEAD' });
        if (response.ok) {
          setPreviewUrl(publicUrl);
        }
      }
    } catch (error) {
      console.warn('Error fetching logo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      // Delete existing logos first
      try {
        const { data: existingFiles } = await supabase
          .storage
          .from('company-logos')
          .list();

        if (existingFiles) {
          for (const existingFile of existingFiles) {
            await supabase
              .storage
              .from('company-logos')
              .remove([existingFile.name]);
          }
        }
      } catch (error) {
        console.warn('Error cleaning up old logos:', error);
      }

      // Upload new logo
      const { error: uploadError } = await supabase
        .storage
        .from('company-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl }, error: urlError } = supabase
        .storage
        .from('company-logos')
        .getPublicUrl(fileName);

      if (urlError) throw urlError;

      setPreviewUrl(publicUrl);
      onImageUpload(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
      // Revert to previous preview if upload fails
      fetchLogo();
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      {error && (
        <div className="text-sm text-red-600 mb-2">{error}</div>
      )}
      {loading ? (
        <div className="h-24 w-24 flex items-center justify-center bg-stone-100 rounded-lg">
          <div className="w-6 h-6 border-2 border-[#a47148] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : previewUrl ? (
        <img
          src={previewUrl}
          alt="Company logo"
          className="h-24 w-auto cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleClick}
        />
      ) : (
        <button
          onClick={handleClick}
          className="h-24 w-24 flex items-center justify-center bg-orange-100 text-orange-400 rounded-lg hover:bg-orange-200 transition-colors"
        >
          <Upload className="w-12 h-12" />
        </button>
      )}
    </div>
  );
}