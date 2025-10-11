import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminFileManagerSection from "@/components/admin/AdminFileManagerSection";
import AdminModelsSection from "@/components/admin/AdminModelsSection";
import AdminStorageSection from "@/components/admin/AdminStorageSection";

const MediaFiles = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Media & Files</h1>
        <p className="text-muted-foreground mt-2">
          Manage file uploads, 3D models, and storage resources.
        </p>
      </div>

      <Tabs defaultValue="files">
        <TabsList>
          <TabsTrigger value="files">File Manager</TabsTrigger>
          <TabsTrigger value="models">3D Models</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-6 mt-6">
          <AdminFileManagerSection />
        </TabsContent>

        <TabsContent value="models" className="space-y-6 mt-6">
          <AdminModelsSection />
        </TabsContent>

        <TabsContent value="storage" className="space-y-6 mt-6">
          <AdminStorageSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaFiles;
