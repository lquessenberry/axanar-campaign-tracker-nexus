// TGA to PNG converter utility for web compatibility
export class TGAConverter {
  static async convertTGAToDataURL(tgaUrl: string): Promise<string> {
    try {
      console.log('Loading TGA file:', tgaUrl);
      const response = await fetch(tgaUrl);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Parse TGA header
      const idLength = uint8Array[0];
      const colorMapType = uint8Array[1];
      const imageType = uint8Array[2];
      const width = uint8Array[12] + (uint8Array[13] << 8);
      const height = uint8Array[14] + (uint8Array[15] << 8);
      const pixelDepth = uint8Array[16];
      const imageDescriptor = uint8Array[17];
      
      console.log(`TGA Info: ${width}x${height}, ${pixelDepth}bpp, type: ${imageType}`);
      
      // Only support uncompressed RGB/RGBA images for now
      if (imageType !== 2 && imageType !== 10) {
        throw new Error(`Unsupported TGA image type: ${imageType}`);
      }
      
      const headerSize = 18 + idLength;
      let pixelData: Uint8Array;
      
      if (imageType === 2) {
        // Uncompressed RGB/RGBA
        pixelData = uint8Array.slice(headerSize);
      } else if (imageType === 10) {
        // RLE compressed RGB/RGBA
        pixelData = this.decompressRLE(uint8Array.slice(headerSize), width, height, pixelDepth / 8);
      } else {
        throw new Error('Unsupported TGA format');
      }
      
      // Convert to RGBA if needed
      const bytesPerPixel = pixelDepth / 8;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not get canvas context');
      
      const imageData = ctx.createImageData(width, height);
      const data = new Uint8Array(imageData.data);
      
      // TGA stores pixels as BGR(A), convert to RGBA and brighten
      for (let i = 0; i < width * height; i++) {
        const srcIndex = i * bytesPerPixel;
        const dstIndex = i * 4;
        
        if (bytesPerPixel === 3) {
          // BGR to RGBA with brightness boost
          const r = pixelData[srcIndex + 2];
          const g = pixelData[srcIndex + 1]; 
          const b = pixelData[srcIndex];
          
          // Apply gamma correction and brightness boost
          data[dstIndex] = Math.min(255, Math.pow(r / 255, 0.8) * 255 * 1.5);     // R
          data[dstIndex + 1] = Math.min(255, Math.pow(g / 255, 0.8) * 255 * 1.5); // G
          data[dstIndex + 2] = Math.min(255, Math.pow(b / 255, 0.8) * 255 * 1.5); // B
          data[dstIndex + 3] = 255;                                                // A
        } else if (bytesPerPixel === 4) {
          // BGRA to RGBA with brightness boost
          const r = pixelData[srcIndex + 2];
          const g = pixelData[srcIndex + 1];
          const b = pixelData[srcIndex];
          const a = pixelData[srcIndex + 3];
          
          data[dstIndex] = Math.min(255, Math.pow(r / 255, 0.8) * 255 * 1.5);     // R
          data[dstIndex + 1] = Math.min(255, Math.pow(g / 255, 0.8) * 255 * 1.5); // G
          data[dstIndex + 2] = Math.min(255, Math.pow(b / 255, 0.8) * 255 * 1.5); // B
          data[dstIndex + 3] = a;                                                  // A
        }
      }
      
      // Flip vertically if needed (TGA origin is usually bottom-left)
      if ((imageDescriptor & 0x20) === 0) {
        this.flipImageDataVertically(data, width, height);
      }
      
      // Copy modified data back to imageData
      imageData.data.set(data);
      
      ctx.putImageData(imageData, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      console.log('TGA converted to PNG data URL successfully');
      return dataURL;
      
    } catch (error) {
      console.error('Error converting TGA:', error);
      throw error;
    }
  }
  
  private static decompressRLE(compressedData: Uint8Array, width: number, height: number, bytesPerPixel: number): Uint8Array {
    const pixelCount = width * height;
    const uncompressed = new Uint8Array(pixelCount * bytesPerPixel);
    let srcIndex = 0;
    let dstIndex = 0;
    
    while (dstIndex < uncompressed.length && srcIndex < compressedData.length) {
      const header = compressedData[srcIndex++];
      const isRLE = (header & 0x80) !== 0;
      const count = (header & 0x7F) + 1;
      
      if (isRLE) {
        // RLE packet - repeat next pixel
        for (let i = 0; i < bytesPerPixel; i++) {
          const value = compressedData[srcIndex + i];
          for (let j = 0; j < count; j++) {
            uncompressed[dstIndex + j * bytesPerPixel + i] = value;
          }
        }
        srcIndex += bytesPerPixel;
        dstIndex += count * bytesPerPixel;
      } else {
        // Raw packet - copy pixels directly
        const copySize = count * bytesPerPixel;
        uncompressed.set(compressedData.slice(srcIndex, srcIndex + copySize), dstIndex);
        srcIndex += copySize;
        dstIndex += copySize;
      }
    }
    
    return uncompressed;
  }
  
  private static flipImageDataVertically(data: Uint8Array, width: number, height: number): void {
    const rowSize = width * 4;
    const temp = new Uint8Array(rowSize);
    
    for (let y = 0; y < Math.floor(height / 2); y++) {
      const topRowStart = y * rowSize;
      const bottomRowStart = (height - 1 - y) * rowSize;
      
      // Copy top row to temp
      temp.set(data.slice(topRowStart, topRowStart + rowSize));
      
      // Copy bottom row to top
      data.set(data.slice(bottomRowStart, bottomRowStart + rowSize), topRowStart);
      
      // Copy temp to bottom
      data.set(temp, bottomRowStart);
    }
  }
}