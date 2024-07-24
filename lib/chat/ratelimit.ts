import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const rateLimitMap = new Map();

function getIP() {
  return headers().get('x-real-ip') ?? 'unknown';
}

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.timestamp > 60000) {
      rateLimitMap.delete(key);
    }
  }
}

export async function rateLimit() {
  const ip = getIP();
  const now = Date.now();
  cleanupOldEntries();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
  } else {
    const entry = rateLimitMap.get(ip);
    entry.count++;
    if (entry.count > 60) {
      redirect('/waiting-room');
    } else {
      rateLimitMap.set(ip, entry);
    }
  }
}
