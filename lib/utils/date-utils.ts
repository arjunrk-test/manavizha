/**
 * Formats a date string to DD-MM-YYYY format.
 * If the input is not valid, returns the original input.
 */
export function formatToDDMMYYYY(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch (e) {
    // console.error("Error formatting date:", e);
  }

  // Backup: manual split for YYYY-MM-DD
  const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = cleanStr.split(/[-/]/);
  if (parts.length === 3) {
    // Check if first part is year
    if (parts[0].length === 4) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }
    // Check if last part is year
    if (parts[2].length === 4) {
       const [day, month, year] = parts;
       return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }
  }
  
  return dateStr;
}
