import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const safeFilename = path.basename(filename);
    const uploadsDir = path.join(process.cwd(), ".sattva-data", "uploads");
    const filePath = path.join(uploadsDir, safeFilename);

    const fileBuffer = await fs.readFile(filePath);
    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "1";

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeFilename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Archivo PDF no encontrado en almacenamiento local." },
      { status: 404 }
    );
  }
}
