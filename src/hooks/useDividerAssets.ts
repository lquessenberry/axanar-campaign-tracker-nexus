import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DividerAsset {
  name: string;
  url: string;
  type: string;
}

export const useDividerAssets = () => {
  const [dividers, setDividers] = useState<DividerAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDividers = async () => {
      try {
        setLoading(true);
        
        // List files from axanar-assets bucket
        const { data: files, error: listError } = await supabase.storage
          .from('axanar-assets')
          .list('dividers', {
            limit: 50,
            sortBy: { column: 'name', order: 'asc' }
          });

        if (listError) {
          console.warn('Could not fetch from axanar-assets, using local assets:', listError);
          setDividers([]);
          return;
        }

        if (files) {
          const svgFiles = files.filter(file => 
            file.name.toLowerCase().endsWith('.svg') ||
            file.name.toLowerCase().endsWith('.png') ||
            file.name.toLowerCase().endsWith('.jpg') ||
            file.name.toLowerCase().endsWith('.jpeg')
          );

          const dividerAssets = svgFiles.map(file => {
            const { data } = supabase.storage
              .from('axanar-assets')
              .getPublicUrl(`dividers/${file.name}`);
            
            return {
              name: file.name.replace(/\.(svg|png|jpg|jpeg)$/i, ''),
              url: data.publicUrl,
              type: file.name.split('.').pop()?.toLowerCase() || 'svg'
            };
          });

          setDividers(dividerAssets);
        }
      } catch (err) {
        console.warn('Error fetching divider assets:', err);
        setError('Failed to load custom dividers');
        setDividers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDividers();
  }, []);

  const getDividerUrl = (name: string): string | undefined => {
    const divider = dividers.find(d => d.name.toLowerCase() === name.toLowerCase());
    return divider?.url;
  };

  return {
    dividers,
    loading,
    error,
    getDividerUrl
  };
};