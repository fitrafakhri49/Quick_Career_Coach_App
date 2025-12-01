import fs from "fs";
import mammoth from "mammoth";

const { PDFParse } = require("pdf-parse"); // class-based

export async function parseCV(filePath: string, ext: string) {
  if (ext === ".pdf") {
    const parser = new PDFParse({
      data: fs.readFileSync(filePath),  // ← SOLUSI WAJIB
    });

    const result = await parser.getText();
    return result.text;
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error("Unsupported file format");
}
