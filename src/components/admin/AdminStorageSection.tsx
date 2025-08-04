import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  HardDrive, 
  Database, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface BucketInfo {
  id: string;
  name: string;
  public: boolean;
  file_size_limit?: number;
  allowed_mime_types?: string[];
  created_at: string;
  updated_at: string;
  owner: string;
}

interface BucketStats {
  bucket_name: string;
  file_count: number;
  total_size: number;
  last_modified: string;
}

const AdminStorageSection: React.FC = () => {
  const { user } = useAuth();
  const [buckets, setBuckets] = useState<BucketInfo[]>([]);
  const [bucketStats, setBucketStats] = useState<Record<string, BucketStats>>({});
  const [loading, setLoading] = useState(true);
  const [totalStorageUsed, setTotalStorageUsed] = useState(0);
  const [storageLimit] = useState(1000000000); // 1GB limit for demo

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    setLoading(true);
    try {
      // Load bucket information
      const { data: bucketData, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) throw bucketError;
      
      setBuckets(bucketData);

      // Load stats for each bucket
      const stats: Record<string, BucketStats> = {};
      let totalUsed = 0;

      for (const bucket of bucketData) {
        try {
          const { data: files, error: filesError } = await supabase.storage
            .from(bucket.name)
            .list('', {
              limit: 1000,
              sortBy: { column: 'created_at', order: 'desc' }
            });

          if (!filesError && files) {
            // Recursively count files in all directories
            let fileCount = 0;
            let totalSize = 0;
            let lastModified = '';

            const countFiles = async (path: string = ''): Promise<void> => {
              const { data: dirFiles } = await supabase.storage
                .from(bucket.name)
                .list(path, { limit: 100 });

              if (dirFiles) {
                for (const file of dirFiles) {
                  if (file.name && file.id) {
                    // It's a file
                    fileCount++;
                    totalSize += file.metadata?.size || 0;
                    if (file.updated_at > lastModified) {
                      lastModified = file.updated_at;
                    }
                  } else if (file.name && !file.id) {
                    // It's a directory, recurse
                    await countFiles(path ? `${path}/${file.name}` : file.name);
                  }
                }
              }
            };

            await countFiles();

            stats[bucket.name] = {
              bucket_name: bucket.name,
              file_count: fileCount,
              total_size: totalSize,
              last_modified: lastModified
            };

            totalUsed += totalSize;
          }
        } catch (error) {
          console.error(`Error loading stats for bucket ${bucket.name}:`, error);
        }
      }

      setBucketStats(stats);
      setTotalStorageUsed(totalUsed);
      
    } catch (error) {
      console.error('Error loading storage info:', error);
      toast({
        title: "Error",
        description: "Failed to load storage information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupBucket = async (bucketName: string) => {
    try {
      // This would implement cleanup logic - removing old/unused files
      toast({
        title: "Cleanup Started",
        description: `Cleanup process started for ${bucketName} bucket`,
      });
      
      // Reload data after cleanup
      setTimeout(() => {
        loadStorageInfo();
      }, 2000);
      
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast({
        title: "Error",
        description: "Failed to cleanup bucket",
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

  const getStoragePercentage = () => {
    return Math.round((totalStorageUsed / storageLimit) * 100);
  };

  const getStorageStatus = () => {
    const percentage = getStoragePercentage();
    if (percentage >= 90) return { color: 'text-red-500', icon: AlertTriangle, text: 'Critical' };
    if (percentage >= 75) return { color: 'text-yellow-500', icon: AlertTriangle, text: 'Warning' };
    return { color: 'text-green-500', icon: CheckCircle, text: 'Healthy' };
  };

  const storageStatus = getStorageStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Storage Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage storage buckets and usage
          </p>
        </div>
        <Button onClick={loadStorageInfo} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Total Storage Used</div>
              <div className="text-2xl font-bold">{formatFileSize(totalStorageUsed)}</div>
              <div className="text-sm text-muted-foreground">
                of {formatFileSize(storageLimit)} ({getStoragePercentage()}%)
              </div>
              <Progress value={getStoragePercentage()} className="mt-2" />
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Storage Status</div>
              <div className={`flex items-center gap-2 ${storageStatus.color}`}>
                <storageStatus.icon className="w-5 h-5" />
                <span className="text-lg font-semibold">{storageStatus.text}</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Active Buckets</div>
              <div className="text-2xl font-bold">{buckets.length}</div>
              <div className="text-sm text-muted-foreground">
                {buckets.filter(b => b.public).length} public, {buckets.filter(b => !b.public).length} private
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bucket Management */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Buckets</CardTitle>
          <CardDescription>
            Manage individual storage buckets and their contents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading storage information...</p>
            </div>
          ) : buckets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No storage buckets found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {buckets.map((bucket) => {
                const stats = bucketStats[bucket.name];
                const usage = stats ? (stats.total_size / storageLimit) * 100 : 0;
                
                return (
                  <div key={bucket.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Database className="w-6 h-6 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">{bucket.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant={bucket.public ? "default" : "secondary"}>
                              {bucket.public ? 'Public' : 'Private'}
                            </Badge>
                            <span>Created {new Date(bucket.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCleanupBucket(bucket.name)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Cleanup
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {stats && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Files</div>
                          <div className="font-medium">{stats.file_count}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Size</div>
                          <div className="font-medium">{formatFileSize(stats.total_size)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Usage</div>
                          <div className="font-medium">{usage.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Last Modified</div>
                          <div className="font-medium">
                            {stats.last_modified ? new Date(stats.last_modified).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {stats && (
                      <div className="mt-3">
                        <Progress value={usage} className="h-2" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Storage Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getStoragePercentage() > 75 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-700 dark:text-yellow-300">Storage Warning</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">
                    Storage usage is above 75%. Consider cleaning up unused files or upgrading storage capacity.
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">Cleanup Suggestion</div>
                <div className="text-blue-600 dark:text-blue-400">
                  Run cleanup on buckets with files older than 90 days to free up space.
                </div>
              </div>
              
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="font-medium text-green-700 dark:text-green-300 mb-1">Optimization Tip</div>
                <div className="text-green-600 dark:text-green-400">
                  Consider compressing large texture files to reduce storage usage.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStorageSection;