/**
 * Generates unique complaint IDs in the format: FMC-YYYY-XXXXXX
 * Example: FMC-2026-A82K91
 */
export function generateComplaintId() {
  const currentYear = new Date().getFullYear();
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomCode = '';
  for (let i = 0; i < 6; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FMC-${currentYear}-${randomCode}`;
}

export default generateComplaintId;
