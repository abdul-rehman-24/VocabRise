// app/api/upload/route.ts - Cloudinary image upload endpoint for avatars

export async function POST(request: Request) {
  // Handle avatar upload to Cloudinary
  return new Response(JSON.stringify({ url: "" }))
}
