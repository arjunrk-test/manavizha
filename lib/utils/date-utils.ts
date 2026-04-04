/**
 * Formats a date string (YYYY-MM-DD) to DD-MM-YYYY format.
 * If the input is not a valid date string, returns the original input.
 */
export function formatToDDMMYYYY(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  
  // Check if it's already in DD-MM-YYYY format (optional safety)
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
  
  // Try to parse YYYY-MM-DD
  const parts = dateStr.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  }
  
  // Fallback: try native Date parsing
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
  
  return dateStr;
}
