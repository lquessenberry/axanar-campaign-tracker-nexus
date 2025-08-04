import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ModelUploadPanel from '@/components/ModelUploadPanel';

const ModelManager = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow py-8 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">3D Model Manager</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload and manage your starship 3D models and textures for use in the background animations
            </p>
          </div>
          
          <ModelUploadPanel />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ModelManager;