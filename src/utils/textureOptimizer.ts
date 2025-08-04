import * as THREE from 'three';

export interface OptimizedTexture {
  texture: THREE.Texture;
  format: 'webp' | 'jpeg' | 'png' | 'tga';
  size: number;
  compressionRatio: number;
}

export class TextureOptimizer {
  private static cache = new Map<string, OptimizedTexture>();
  private static textureLoader = new THREE.TextureLoader();

  /**
   * Loads texture with format fallback hierarchy: WebP → JPEG → PNG → TGA
   */
  static async loadOptimizedTexture(
    basePath: string,
    filename: string
  ): Promise<OptimizedTexture> {
    const cacheKey = `${basePath}/${filename}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const baseFilename = filename.replace(/\.(tga|png|jpg|jpeg)$/i, '');
    const formats = [
      { ext: 'webp', format: 'webp' as const },
      { ext: 'jpg', format: 'jpeg' as const },
      { ext: 'jpeg', format: 'jpeg' as const },
      { ext: 'png', format: 'png' as const },
      { ext: 'tga', format: 'tga' as const }
    ];

    for (const { ext, format } of formats) {
      try {
        const textureUrl = `${basePath}/${baseFilename}.${ext}`;
        const texture = await this.loadTextureWithTimeout(textureUrl, 5000);
        
        // Configure texture for optimal performance
        this.optimizeTextureSettings(texture);
        
        const optimizedTexture: OptimizedTexture = {
          texture,
          format,
          size: this.estimateTextureSize(texture),
          compressionRatio: this.getCompressionRatio(format)
        };

        this.cache.set(cacheKey, optimizedTexture);
        console.log(`✅ Loaded optimized texture: ${textureUrl} (${format})`);
        return optimizedTexture;
        
      } catch (error) {
        console.log(`⚠️ Failed to load ${baseFilename}.${ext}, trying next format...`);
        continue;
      }
    }

    throw new Error(`Failed to load texture: ${filename} in any supported format`);
  }

  private static loadTextureWithTimeout(url: string, timeout: number): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Texture load timeout: ${url}`));
      }, timeout);

      this.textureLoader.load(
        url,
        (texture) => {
          clearTimeout(timer);
          resolve(texture);
        },
        undefined,
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  }

  private static optimizeTextureSettings(texture: THREE.Texture): void {
    // Enable mipmaps for better performance at distance
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    // Use appropriate wrapping for most models
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    // Optimize for GPU
    texture.flipY = false; // Better performance
  }

  private static estimateTextureSize(texture: THREE.Texture): number {
    if (texture.image) {
      const width = texture.image.width || 1024;
      const height = texture.image.height || 1024;
      return width * height * 4; // RGBA bytes
    }
    return 1024 * 1024 * 4; // Default estimate
  }

  private static getCompressionRatio(format: string): number {
    const ratios = {
      webp: 0.3,  // ~70% smaller than PNG
      jpeg: 0.5,  // ~50% smaller than PNG  
      png: 1.0,   // Baseline
      tga: 1.2    // Usually larger than PNG
    };
    return ratios[format as keyof typeof ratios] || 1.0;
  }

  /**
   * Applies optimized textures to a 3D model
   */
  static async applyOptimizedTextures(
    object: THREE.Object3D,
    textureBasePath: string,
    textureFiles: string[] = []
  ): Promise<void> {
    const texturePromises: Promise<void>[] = [];

    object.traverse(async (child) => {
      if (child instanceof THREE.Mesh) {
        // Try to load textures if available
        if (textureFiles.length > 0) {
          for (const textureFile of textureFiles) {
            try {
              const optimizedTexture = await this.loadOptimizedTexture(
                textureBasePath,
                textureFile
              );
              
              // Apply diffuse/albedo texture
              if (textureFile.toLowerCase().includes('diffuse') || 
                  textureFile.toLowerCase().includes('albedo') ||
                  textureFile.toLowerCase().includes('color')) {
                
                const material = new THREE.MeshPhongMaterial({
                  map: optimizedTexture.texture,
                  shininess: 100,
                  transparent: optimizedTexture.format === 'webp' || optimizedTexture.format === 'png'
                });
                
                child.material = material;
                console.log(`🎨 Applied ${optimizedTexture.format} texture to model`);
                break;
              }
            } catch (error) {
              console.warn(`Failed to apply texture ${textureFile}:`, error);
            }
          }
        } else {
          // Fallback to basic material
          child.material = new THREE.MeshPhongMaterial({ 
            color: 0x888888,
            shininess: 100 
          });
        }
        
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    await Promise.all(texturePromises);
  }

  /**
   * Clear texture cache to free memory
   */
  static clearCache(): void {
    this.cache.forEach(({ texture }) => {
      texture.dispose();
    });
    this.cache.clear();
    console.log('🧹 Texture cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { count: number; estimatedMemoryMB: number } {
    let totalSize = 0;
    this.cache.forEach(({ size }) => {
      totalSize += size;
    });
    
    return {
      count: this.cache.size,
      estimatedMemoryMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
    };
  }
}