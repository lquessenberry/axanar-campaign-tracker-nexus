import React, { useState } from 'react';
import { Upload, File, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import UnifiedPreviewModal from './UnifiedPreviewModal';

interface UploadedFile {
  name: string;
  path: string;
  type: 'obj' | 'texture';
  size: number;
  url: string;
  groupId?: string;
  groupName?: string;
}

interface FileGroup {
  id: string;
  name: string;
  files: UploadedFile[];
  objFile?: UploadedFile;
  textures: UploadedFile[];
}

const ModelUploadPanel: React.FC = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [fileGroups, setFileGroups] = useState<FileGroup[]>([]);
  const [groupName, setGroupName] = useState('');
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
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

  const handleFileSelection = (files: FileList | null) => {
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

    // Check if multiple files are selected
    if (validFiles.length > 1) {
      setPendingFiles(files);
      setShowGroupInput(true);
      setGroupName(`Model Group ${Date.now()}`);
    } else {
      // Single file, upload directly
      handleFileUpload(files, null);
    }
  };

  const handleFileUpload = async (files: FileList | null, groupNameOverride: string | null) => {
    if (!files || !user) return;

    const validFiles = Array.from(files).filter(file => {
      const extension = file.name.toLowerCase().split('.').pop();
      return ['obj', 'png', 'jpg', 'jpeg', 'bmp', 'tga', 'mtl'].includes(extension || '');
    });

    setUploading(true);
    setUploadProgress(0);

    try {
      const groupId = groupNameOverride ? `group-${Date.now()}` : undefined;
      const finalGroupName = groupNameOverride || undefined;

      const uploadPromises = validFiles.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `starship-${Date.now()}-${index}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Create metadata with group info
        const metadata = groupId ? {
          groupId,
          groupName: finalGroupName,
          originalName: file.name
        } : { originalName: file.name };

        const { data, error } = await supabase.storage
          .from('models')
          .upload(filePath, file, {
            metadata: metadata
          });

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
          url: publicData.publicUrl,
          groupId,
          groupName: finalGroupName
        };
      });

      const results = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...results]);

      // Create or update file group
      if (groupId && finalGroupName) {
        const objFile = results.find(f => f.type === 'obj');
        const textures = results.filter(f => f.type === 'texture');
        
        const newGroup: FileGroup = {
          id: groupId,
          name: finalGroupName,
          files: results,
          objFile,
          textures
        };

        setFileGroups(prev => [...prev, newGroup]);
      }

      toast({
        title: "Upload Successful",
        description: `${results.length} file(s) uploaded successfully${finalGroupName ? ` to group "${finalGroupName}"` : ''}.`
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
      setShowGroupInput(false);
      setPendingFiles(null);
      setGroupName('');
    }
  };

  const handleGroupUpload = () => {
    if (pendingFiles && groupName.trim()) {
      handleFileUpload(pendingFiles, groupName.trim());
    }
  };

  const handleCancelGroup = () => {
    setShowGroupInput(false);
    setPendingFiles(null);
    setGroupName('');
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!user) return;

    try {
      const { error } = await supabase.storage
        .from('models')
        .remove([file.path]);

      if (error) throw error;

      setUploadedFiles(prev => prev.filter(f => f.path !== file.path));
      
      // Update groups if file was part of a group
      if (file.groupId) {
        setFileGroups(prev => prev.map(group => {
          if (group.id === file.groupId) {
            const updatedFiles = group.files.filter(f => f.path !== file.path);
            return {
              ...group,
              files: updatedFiles,
              objFile: group.objFile?.path === file.path ? undefined : group.objFile,
              textures: group.textures.filter(f => f.path !== file.path)
            };
          }
          return group;
        }).filter(group => group.files.length > 0)); // Remove empty groups
      }
      
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

  const handleDeleteGroup = async (group: FileGroup) => {
    if (!user) return;

    try {
      const filePaths = group.files.map(f => f.path);
      const { error } = await supabase.storage
        .from('models')
        .remove(filePaths);

      if (error) throw error;

      setUploadedFiles(prev => prev.filter(f => !filePaths.includes(f.path)));
      setFileGroups(prev => prev.filter(g => g.id !== group.id));
      
      toast({
        title: "Group Deleted",
        description: `Group "${group.name}" and all its files have been removed.`
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting the group.",
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
    setPreviewModal({
      isOpen: true,
      fileUrl: file.url,
      fileName: file.name,
      fileType: file.type
    });
  };

  const closePreviewModal = () => {
    console.log('Closing preview modal'); // Debug log
    setPreviewModal({
      isOpen: false,
      fileUrl: '',
      fileName: '',
      fileType: 'obj'
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
            onChange={(e) => handleFileSelection(e.target.files)}
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

        {/* Group Name Input */}
        {showGroupInput && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Create File Group</h4>
              <p className="text-sm text-muted-foreground mb-3">
                You've selected multiple files. Group them together to associate textures with the OBJ model.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="flex-1 px-3 py-2 border rounded-md"
                  disabled={uploading}
                />
                <Button onClick={handleGroupUpload} disabled={uploading || !groupName.trim()}>
                  Upload Group
                </Button>
                <Button variant="outline" onClick={handleCancelGroup} disabled={uploading}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* File Groups */}
        {fileGroups.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">File Groups</h3>
            {fileGroups.map((group) => (
              <Card key={group.id} className="border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{group.name}</CardTitle>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteGroup(group)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    {group.objFile ? '1 model' : 'No model'} • {group.textures.length} texture(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {group.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.type === 'obj' ? 'Model' : 'Texture'} • {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Individual Files (not in groups) */}
        {uploadedFiles.filter(f => !f.groupId).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Individual Files</h3>
            <div className="space-y-2">
              {uploadedFiles.filter(f => !f.groupId).map((file, index) => (
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
            <li>• Select multiple files at once to create a grouped upload</li>
            <li>• Upload your starship .obj model file with its textures</li>
            <li>• Add texture images (PNG, JPG) and .mtl files for materials</li>
            <li>• Files in a group are automatically associated together</li>
            <li>• Individual files can be uploaded without grouping</li>
          </ul>
        </div>
      </CardContent>

      {/* Unified Preview Modal */}
      <UnifiedPreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreviewModal}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
        fileType={previewModal.fileType}
      />
    </Card>
  );
};

export default ModelUploadPanel;