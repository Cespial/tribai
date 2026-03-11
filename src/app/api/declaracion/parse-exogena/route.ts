import { parseExogena, formatExogenaForAgent } from "@/lib/declaracion-renta/exogena-parser";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No se recibió archivo." }, { status: 400 });
    }

    // Validate file type
    const name = file.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      return Response.json(
        { error: "Solo se aceptan archivos Excel (.xlsx o .xls)." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: "El archivo excede el límite de 10MB." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const resumen = parseExogena(buffer);
    const resumenTexto = formatExogenaForAgent(resumen);

    return Response.json({
      resumen,
      resumenTexto,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al procesar el archivo.";
    return Response.json({ error: message }, { status: 500 });
  }
}
