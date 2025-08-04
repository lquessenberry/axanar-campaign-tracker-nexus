import React, { useState } from 'react';
import { Upload, File, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import ModelPreviewModal from './ModelPreviewModal';

interface UploadedFile {
  name: string;
  path: string;
  type: 'obj' | 'texture';
  size: number;
  url: string;
}

const ModelUploadPanel: React.FC = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    modelUrl: string;
    modelName: string;
  }>({
    isOpen: false,
    modelUrl: '',
    modelName: ''
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload model files.",
        variant: "destructive"
      });
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      const extension = file.name.toLowerCase().split('.').pop();
      return ['obj', 'png', 'jpg', 'jpeg', 'bmp', 'tga', 'mtl'].includes(extension || '');
    });

    if (validFiles.length === 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload .obj files for models or image files for textures.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `starship-${Date.now()}-${index}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('models')
          .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: publicData } = supabase.storage
          .from('models')
          .getPublicUrl(filePath);

        const fileType: 'obj' | 'texture' = fileExt === 'obj' ? 'obj' : 'texture';

        return {
          name: file.name,
          path: data.path,
          type: fileType,
          size: file.size,
          url: publicData.publicUrl
        };
      });

      const results = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...results]);

      toast({
        title: "Upload Successful",
        description: `${results.length} file(s) uploaded successfully.`
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading files.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!user) return;

    try {
      const { error } = await supabase.storage
        .from('models')
        .remove([file.path]);

      if (error) throw error;

      setUploadedFiles(prev => prev.filter(f => f.path !== file.path));
      
      toast({
        title: "File Deleted",
        description: `${file.name} has been removed.`
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting the file.",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleViewFile = (file: UploadedFile) => {
    console.log('Viewing file:', file); // Debug log
    if (file.type === 'obj') {
      console.log('Opening 3D preview modal'); // Debug log
      setPreviewModal({
        isOpen: true,
        modelUrl: file.url,
        modelName: file.name
      });
    } else {
      // For texture files, open in new tab
      window.open(file.url, '_blank');
    }
  };

  const closePreviewModal = () => {
    console.log('Closing preview modal'); // Debug log
    setPreviewModal({
      isOpen: false,
      modelUrl: '',
      modelName: ''
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Starship Model Upload
        </CardTitle>
        <CardDescription>
          Upload .obj model files and texture images for your starship. Supported formats: OBJ, PNG, JPG, JPEG, BMP, TGA, MTL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
          <input
            type="file"
            id="model-upload"
            multiple
            accept=".obj,.png,.jpg,.jpeg,.bmp,.tga,.mtl"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="model-upload"
            className="cursor-pointer block"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
            <p className="text-sm text-muted-foreground">
              Select multiple .obj and texture files
            </p>
          </label>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Uploaded Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <File className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.type === 'obj' ? 'Model' : 'Texture'} • {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewFile(file)}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(file)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Usage Instructions:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Upload your starship .obj model file</li>
            <li>• Add texture images (PNG, JPG) for materials</li>
            <li>• Include .mtl file for material definitions</li>
            <li>• Once uploaded, the starship will appear in the background</li>
          </ul>
        </div>
      </CardContent>

      {/* 3D Model Preview Modal */}
      <ModelPreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreviewModal}
        modelUrl={previewModal.modelUrl}
        modelName={previewModal.modelName}
      />
    </Card>
  );
};

export default ModelUploadPanel;