declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion?: string;
    Title?: string;
    Author?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: unknown;
    text: string;
    version: string;
  }

  function pdf(buffer: Buffer | Uint8Array, options?: object): Promise<PDFData>;
  export = pdf;
}
