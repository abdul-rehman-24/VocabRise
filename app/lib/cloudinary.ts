// app/lib/cloudinary.ts - Cloudinary utilities for image upload and optimization

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
}

export async function uploadToCloudinary(file: File) {
  // Upload file to Cloudinary and return optimized URL
}

export function getOptimizedImageUrl(publicId: string, options = {}) {
  // Generate optimized Cloudinary image URL with transformations
}
