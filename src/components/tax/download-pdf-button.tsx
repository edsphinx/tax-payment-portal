"use client";

interface DownloadPdfButtonProps {
  type: "income" | "vat";
  id: string;
  year: number;
  quarter?: number;
}

export function DownloadPdfButton({ type, id, year, quarter }: DownloadPdfButtonProps) {
  // Generate a professional filename for the PDF
  const getFileName = () => {
    const shortId = id.slice(0, 8).toUpperCase();
    if (type === "income") {
      return `Prospera_Income_Tax_Return_${year}_${shortId}`;
    }
    return `Prospera_VAT_Return_Q${quarter}_${year}_${shortId}`;
  };

  const handleDownload = () => {
    // Save original title
    const originalTitle = document.title;

    // Set document title to desired filename (browsers use this as default PDF name)
    document.title = getFileName();

    // Open print dialog
    window.print();

    // Restore original title after a short delay
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Download PDF
    </button>
  );
}
