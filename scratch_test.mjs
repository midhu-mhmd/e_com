import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

const fontPath = path.resolve("src/assets/Cairo ARABIC/static/Cairo-Bold.ttf");
const fontBuffer = fs.readFileSync(fontPath);
const fontBase64 = fontBuffer.toString("base64");

const doc = new jsPDF({
  orientation: "landscape",
  unit: "mm",
  format: [500, 250],
});

doc.addFileToVFS("Cairo-Bold.ttf", fontBase64);
doc.addFont("Cairo-Bold.ttf", "Cairo", "bold");
doc.setFont("Cairo", "bold");
doc.setFontSize(20);

// Let's test with raw Arabic and processArabic
const text = "FRESH SEABREAM (2 PCS, 900-1100 G) | سمك سبريم طازج";
try {
  doc.text(text, 50, 50);
  console.log("Raw text success!");
} catch (e) {
  console.error("Raw text error:", e);
}

try {
  const processed = doc.processArabic(text);
  console.log("Processed:", processed);
  doc.text(processed, 50, 70);
  console.log("Processed text success!");
} catch (e) {
  console.error("Processed text error:", e);
}

fs.writeFileSync("scratch_test_out.pdf", doc.output());
console.log("PDF written successfully!");
