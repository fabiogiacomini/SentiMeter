import * as XLSX from 'xlsx';

/**
 * Parses a file and extracts text chunks based on the empty line rule.
 */
export const parseFileContent = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let rawText = '';

        // Detect if binary (Excel) or text (CSV/TXT)
        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

        if (isExcel) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert sheet to JSON array of arrays to preserve row structure
          // We assume data is in the first column (A)
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: true }) as any[][];
          
          // We reconstruct the "text" structure. 
          // If a row is empty (or first cell is empty), it counts towards the separator logic.
          const lines = jsonData.map(row => (row[0] ? String(row[0]) : ''));
          rawText = lines.join('\n');
          
        } else {
          // CSV or plain text
          rawText = data as string;
        }

        // Logic: Sentences are separated by an empty line (double newline).
        // Normalize line endings first.
        const normalizedText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // Split by 2 or more newlines to find the blocks
        const chunks = normalizedText
          .split(/\n\s*\n/)
          .map(chunk => chunk.trim())
          .filter(chunk => chunk.length > 0); // Remove empty chunks

        if (chunks.length === 0) {
          reject(new Error("Nessun testo valido trovato nel file. Assicurati che le frasi siano separate da una riga vuota."));
          return;
        }

        resolve(chunks);

      } catch (err) {
        console.error("Parsing error:", err);
        reject(new Error("Errore durante la lettura del file. Controlla il formato."));
      }
    };

    reader.onerror = () => reject(new Error("Errore di lettura del file."));

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  });
};