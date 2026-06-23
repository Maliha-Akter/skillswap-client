// src/app/api/upload/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMAGE_API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  return NextResponse.json(data);
}