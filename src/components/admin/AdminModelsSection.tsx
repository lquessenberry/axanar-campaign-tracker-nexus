import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Box, 
  Upload, 
  Download, 
  Trash2, 
  Eye,
  RefreshCw,
  Search,
  Image,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import ModelUploadPanel from '@/components/ModelUploadPanel';
import UnifiedPreviewModal from '@/components/UnifiedPreviewModal';

interface ModelFile {
  name: string;
  size: number;
  created_at: string;
  updated_at: string;
  owner_id: string;
  public_url: string;
  type: 'obj' | 'texture' | 'material' | 'other';
}

const AdminModelsSection: React.FC = () => {
  const { user } = useAuth();
  const [models, setModels] = useState<ModelFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    fileUrl: string;
    fileName: string;
    fileType: 'obj' | 'texture';
  }>({
    isOpen: false,
    fileUrl: '',
    fileName: '',
    fileType: 'obj'
  });

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('models')
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      const modelFiles: ModelFile[] = [];
      
      // Process files from all user directories
      for (const item of data || []) {
        if (item.name && !item.id) {
          // This is a folder (user directory)
          const { data: userFiles, error: userError } = await supabase.storage
            .from('models')
            .list(item.name, {
              limit: 50,
              sortBy: { column: 'created_at', order: 'desc' }
            });

          if (userError) continue;

          for (const file of userFiles || []) {
            const { data: publicData } = supabase.storage
              .from('models')
              .getPublicUrl(`${item.name}/${file.name}`);

            const fileExtension = file.name.toLowerCase().split('.').pop();
            let fileType: 'obj' | 'texture' | 'material' | 'other' = 'other';
            
            if (fileExtension === 'obj') fileType = 'obj';
            else if (['png', 'jpg', 'jpeg', 'bmp', 'tga'].includes(fileExtension || '')) fileType = 'texture';
            else if (fileExtension === 'mtl') fileType = 'material';

            modelFiles.push({
              name: file.name,
              size: file.metadata?.size || 0,
              created_at: file.created_at || '',
              updated_at: file.updated_at || '',
              owner_id: item.name,
              public_url: publicData.publicUrl,
              type: fileType
            });
          }
        }
      }

      setModels(modelFiles);
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        title: "Error",
        description: "Failed to load 3D models",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (model: ModelFile) => {
    try {
      const { error } = await supabase.storage
        .from('models')
        .remove([`${model.owner_id}/${model.name}`]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${model.name} has been deleted`
      });
      
      loadModels();
    } catch (error) {
      console.error('Error deleting model:', error);
      toast({
        title: "Error",
        description: "Failed to delete model",
        variant: "destructive"
      });
    }
  };

  const handleDownloadModel = async (model: ModelFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('models')
        .download(`${model.owner_id}/${model.name}`);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = model.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading model:', error);
      toast({
        title: "Error",
        description: "Failed to download model",
        variant: "destructive"
      });
    }
  };

  const handleViewModel = (model: ModelFile) => {
    setPreviewModal({
      isOpen: true,
      fileUrl: model.public_url,
      fileName: model.name,
      fileType: model.type === 'obj' ? 'obj' : 'texture'
    });
  };

  const closePreviewModal = () => {
    setPreviewModal({
      isOpen: false,
      fileUrl: '',
      fileName: '',
      fileType: 'obj'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'obj': return <Box className="w-4 h-4" />;
      case 'texture': return <Image className="w-4 h-4" />;
      case 'material': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'obj': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'texture': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'material': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || model.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const modelStats = {
    total: models.length,
    obj: models.filter(m => m.type === 'obj').length,
    textures: models.filter(m => m.type === 'texture').length,
    materials: models.filter(m => m.type === 'material').length,
    totalSize: models.reduce((sum, model) => sum + model.size, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">3D Models Manager</h1>
          <p className="text-muted-foreground mt-2">
            Manage uploaded 3D models, textures, and materials
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowUploadPanel(!showUploadPanel)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Models
          </Button>
          <Button onClick={loadModels} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Upload Panel */}
      {showUploadPanel && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New Models</CardTitle>
            <CardDescription>
              Upload new 3D models, textures, and material files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModelUploadPanel />
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">OBJ Models</div>
                <div className="text-2xl font-bold">{modelStats.obj}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">Textures</div>
                <div className="text-2xl font-bold">{modelStats.textures}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">Materials</div>
                <div className="text-2xl font-bold">{modelStats.materials}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Files</div>
                <div className="text-2xl font-bold">{modelStats.total}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Size</div>
                <div className="text-xl font-bold">{formatFileSize(modelStats.totalSize)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="all">All Types</option>
              <option value="obj">OBJ Models</option>
              <option value="texture">Textures</option>
              <option value="material">Materials</option>
              <option value="other">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Models List */}
      <Card>
        <CardHeader>
          <CardTitle>Models ({filteredModels.length})</CardTitle>
          <CardDescription>
            All uploaded 3D models and associated files
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading models...</p>
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Box className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No models found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredModels.map((model, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getTypeIcon(model.type)}
                    <div className="flex-1">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Badge className={getTypeBadgeColor(model.type)}>
                          {model.type.toUpperCase()}
                        </Badge>
                        <span>{formatFileSize(model.size)}</span>
                        <span>•</span>
                        <span>{new Date(model.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Owner: {model.owner_id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewModel(model)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadModel(model)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteModel(model)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unified Preview Modal */}
      <UnifiedPreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreviewModal}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
        fileType={previewModal.fileType}
      />
    </div>
  );
};

export default AdminModelsSection;