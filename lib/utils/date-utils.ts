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

/**
 * Formats a last active timestamp into a human-readable string.
 * - If < 5 minutes: "Online"
 * - If < 24 hours: "Active X hours ago"
 * - If >= 24 hours: "Active X days ago" (no hours/minutes)
 */
export function formatActivityTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  
  const now = new Date();
  const past = new Date(dateStr);
  const diffInMs = now.getTime() - past.getTime();
  
  if (isNaN(diffInMs)) return "";

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays >= 1) {
    return `Active ${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  if (diffInHours >= 1) {
    return `Active ${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (diffInMinutes >= 5) {
    return `Active ${diffInMinutes} minutes ago`;
  }

  return "Online";
}
