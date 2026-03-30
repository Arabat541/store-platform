import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, unauthorized } from "@/lib/auth/api-guard";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  if (!getAdminUser(req)) return unauthorized();

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Type non autorisé: ${file.type}` },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `Fichier trop volumineux (max 5MB)` },
          { status: 400 }
        );
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
      const filePath = path.join(uploadDir, safeName);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      urls.push(`/uploads/products/${safeName}`);
    }

    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
