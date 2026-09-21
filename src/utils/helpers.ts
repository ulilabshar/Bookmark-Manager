import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractDomain(url: string): string {
  try {
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    const parsed = new URL(formattedUrl);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function getFaviconUrl(url: string): string {
  try {
    const domain = extractDomain(url);
    if (!domain) return '';
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
}

export function formatDateIndonesian(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Baru saja';
    }
    if (diffHours < 24) {
      return `${diffHours} jam lalu`;
    }
    if (diffDays === 1) {
      return 'Kemarin';
    }
    if (diffDays < 7) {
      return `${diffDays} hari lalu`;
    }

    // Format Indonesian date e.g. "15 Sep 2026"
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}
