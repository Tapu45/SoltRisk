import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});


export async function uploadImage(file: string, folder = 'organizations/logos') {
  try {
    // Handle base64 encoded images
    if (file.startsWith('data:')) {
      const uploadResponse = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: 'auto',
        transformation: [{ quality: 'auto' }]
      });
      return {
        success: true,
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id
      };
    } 
    
    // Handle file paths
    else {
      const uploadResponse = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: 'auto',
        transformation: [{ quality: 'auto' }]
      });
      return {
        success: true,
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id
      };
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
}

export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result
    };
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deletion error'
    };
  }
}

export function getPublicIdFromUrl(url: string): string | null {
  try {
    // Example URL: https://res.cloudinary.com/my-cloud/image/upload/v1234567890/organizations/logos/abc123.jpg
    const urlParts = url.split('/');
    // Find the upload part
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    // Extract everything after "upload" and before file extension
    const publicIdParts = urlParts.slice(uploadIndex + 2);
    const fileName = publicIdParts.pop() || '';
    const fileNameWithoutExtension = fileName.split('.')[0];
    
    // Reconstruct public ID
    return [...publicIdParts, fileNameWithoutExtension].join('/');
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}