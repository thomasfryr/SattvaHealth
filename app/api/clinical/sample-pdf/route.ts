import { NextRequest, NextResponse } from "next/server";
import { INITIAL_CLINICAL_DOCUMENTS } from "@/lib/data/patient-zero-engine";

/**
 * Generates a valid, self-contained PDF 1.4 binary document on the fly
 * for the preloaded Patient 0 clinical documents so they can be viewed
 * in an iframe/object or downloaded as authentic PDFs.
 */
function buildClinicalPdfBuffer(docId: string): Buffer {
  const doc =
    INITIAL_CLINICAL_DOCUMENTS.find((d) => d.id === docId) ||
    INITIAL_CLINICAL_DOCUMENTS[0];

  const sanitize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[()\\]/g, "");

  const lines: string[] = [
    "SATTVA HEALTH - REGISTRO CLINICO LONGITUDINAL (PACIENTE 0)",
    "======================================================================",
    `Documento: ${sanitize(doc.title)}`,
    `Laboratorio / Centro: ${sanitize(doc.laboratoryName)}`,
    `Medico Solicitante: ${sanitize(doc.physicianName)}`,
    `Fecha de Toma de Muestra: ${doc.documentDate}`,
    `Estado de Verificacion: ${doc.extractionStatus === "verified" ? "AUDITADO Y VERIFICADO" : "PENDIENTE"}`,
    "----------------------------------------------------------------------",
    "BIOMARCADORES TIPIFICADOS Y LINEA BASE PERSONAL:",
    "",
  ];

  doc.biomarkers.forEach((b) => {
    const delta = (b.numericValue - b.personalBaseline).toFixed(2);
    const sign = Number(delta) >= 0 ? "+" : "";
    lines.push(
      `  * ${sanitize(b.name)} [${b.code}]: ${b.numericValue} ${sanitize(b.unit)}`
    );
    lines.push(
      `    Rango Lab: [${b.refMin} - ${b.refMax}] | Linea Base Personal: ${b.personalBaseline} (${sign}${delta})`
    );
    lines.push("");
  });

  lines.push("----------------------------------------------------------------------");
  lines.push("SINTESIS CLINICA (MEDICINA 3.0):");

  const summaryWords = sanitize(doc.clinicalSummary).split(" ");
  let currentLine = "";
  for (const w of summaryWords) {
    if ((currentLine + " " + w).length > 74) {
      lines.push("  " + currentLine.trim());
      currentLine = w;
    } else {
      currentLine += " " + w;
    }
  }
  if (currentLine.trim()) {
    lines.push("  " + currentLine.trim());
  }

  let textOps = "BT\n/F1 10 Tf\n50 750 Td\n14 TL\n";
  lines.forEach((line) => {
    textOps += `(${line}) Tj T*\n`;
  });
  textOps += "ET";

  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
  );
  objects.push(
    `4 0 obj\n<< /Length ${Buffer.byteLength(textOps, "ascii")} >>\nstream\n${textOps}\nendstream\nendobj\n`
  );
  objects.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n"
  );

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += obj;
  }

  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "ascii");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get("id") || "doc-metabolic-2026-10";
  const download = searchParams.get("download") === "1";

  const doc =
    INITIAL_CLINICAL_DOCUMENTS.find((d) => d.id === docId) ||
    INITIAL_CLINICAL_DOCUMENTS[0];

  const pdfBuffer = buildClinicalPdfBuffer(doc.id);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${doc.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
