export function cleanAIResponse(raw: string): string {
    if (!raw) return "";
    let cleaned = raw.replace(/```json|```/g, "").trim();
    cleaned = cleaned.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
    return cleaned;
  }
  