declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: 'jpeg' | 'png' | 'webp'; quality?: number };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      letterRendering?: boolean;
    };
    jsPDF?: {
      unit?: 'pt' | 'mm' | 'cm' | 'in';
      format?: 'a4' | 'letter' | number[];
      orientation?: 'portrait' | 'landscape';
    };
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: Element | string | null): Html2PdfInstance;
    save(): Promise<void>;
    outputPdf(type?: string): Promise<Blob>;
  }

  function html2pdf(): Html2PdfInstance;
  export default html2pdf;
}
