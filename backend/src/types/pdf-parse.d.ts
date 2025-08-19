declare module 'pdf-parse' {
  export type PdfParseResult = {
    text: string;
    numpages?: number;
    info?: Record<string, unknown>;
    metadata?: unknown;
    version?: string;
  };

  function pdfParse(data: Buffer | Uint8Array | ArrayBuffer, options?: unknown): Promise<PdfParseResult>;
  export default pdfParse;
}


