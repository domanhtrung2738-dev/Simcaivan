/**
 * ============================================================
 *  Sim Cài Vận   Core Parse
 * ============================================================
 */

function parsePhoneNumber(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 4 || digits.length > 20) return null;
  return digits;
}

function detectNhaMang(digits) {
  if (!digits || digits.length < 3) return 'Không xác định';
  const prefix = digits.substring(0, 3);
  return NHA_MANG_PREFIXES[prefix] || 'Không xác định';
}

function formatPhoneNumber(digits) {
  if (digits.length === 10) {
    return `${digits.slice(0,4)}.${digits.slice(4,7)}.${digits.slice(7)}`;
  }
  return digits;
}

function parseBatchInput(text) {
  if (!text || !text.trim()) return [];

  const lines = text.trim().split('\n');
  const results = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(/[|\t]/).map(p => p.trim()).filter(p => p);
    const rawNumber = parts[0];
    const price = parts[1] || '';
    const carrier = parts[2] || '';

    const digits = parsePhoneNumber(rawNumber);
    if (!digits) continue;

    results.push({
      digits,
      formatted: formatPhoneNumber(digits),
      price,
      carrier,
    });
  }

  return results;
}
