import type { Bookmark, Folder } from '../types';
import { extractDomain } from './helpers';

function getFolderName(folderId: string | undefined, folders: Folder[]): string {
  if (!folderId || folderId.trim() === '') return 'Umum';
  return folders.find((f) => f.id === folderId)?.name ?? 'Umum';
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function exportBookmarksToPDF(bookmarks: Bookmark[], folders: Folder[]): void {
  // Kelompokkan bookmark per folder
  const grouped = new Map<string, Bookmark[]>();

  for (const bm of bookmarks) {
    const folderName = getFolderName(bm.folderId, folders);
    if (!grouped.has(folderName)) grouped.set(folderName, []);
    grouped.get(folderName)!.push(bm);
  }

  const now = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date());

  const rows = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([folderName, bms]) => {
      const bookmarkRows = bms.map((bm, i) => {
        const domain = extractDomain(bm.url);
        const tags = bm.tags?.length ? bm.tags.map((t) => `#${t}`).join(' ') : '–';
        const date = formatDate(bm.createdAt);
        const favorite = bm.isFavorite ? '★' : '';
        return `
          <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
            <td class="td-num">${i + 1}</td>
            <td class="td-fav">${favorite}</td>
            <td class="td-title">
              <span class="title">${escapeHtml(bm.title)}</span>
              <span class="domain">${escapeHtml(domain)}</span>
            </td>
            <td class="td-url">
              <a href="${escapeHtml(bm.url)}" class="url-link">${escapeHtml(bm.url)}</a>
            </td>
            <td class="td-tags">${escapeHtml(tags)}</td>
            <td class="td-date">${date}</td>
          </tr>`;
      }).join('');

      return `
        <tr class="folder-header">
          <td colspan="6">
            <span class="folder-badge">📁 ${escapeHtml(folderName)}</span>
            <span class="folder-count">${bms.length} tautan</span>
          </td>
        </tr>
        ${bookmarkRows}`;
    }).join('');

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>TautanKu – Ekspor Tautan ${now}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11px;
      color: #1a1a2e;
      background: #fff;
      padding: 24px 28px;
    }

    /* ── Header ── */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #6366f1;
    }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 18px; font-weight: 700;
    }
    .brand-name { font-size: 18px; font-weight: 700; color: #1a1a2e; }
    .brand-sub  { font-size: 10px; color: #6b7280; margin-top: 1px; }
    .meta { text-align: right; color: #6b7280; font-size: 10px; line-height: 1.6; }
    .meta-total { font-size: 14px; font-weight: 700; color: #6366f1; }

    /* ── Table ── */
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    thead th {
      background: #6366f1;
      color: white;
      padding: 8px 10px;
      text-align: left;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    thead th:first-child { border-radius: 6px 0 0 6px; }
    thead th:last-child  { border-radius: 0 6px 6px 0; }

    .folder-header td {
      background: #f1f0ff;
      padding: 8px 10px;
      border-top: 6px solid #fff;
    }
    .folder-badge {
      font-weight: 700; font-size: 11px; color: #4f46e5;
    }
    .folder-count {
      margin-left: 8px; font-size: 10px; color: #9ca3af;
    }

    .row-even td { background: #fafafa; }
    .row-odd  td { background: #fff; }

    td {
      padding: 7px 10px;
      vertical-align: top;
      border-bottom: 1px solid #f3f4f6;
      word-break: break-word;
    }

    /* Column widths */
    .td-num   { width: 28px;  color: #9ca3af; font-size: 10px; text-align: center; }
    .td-fav   { width: 20px;  color: #f59e0b; text-align: center; font-size: 13px; }
    .td-title { width: 22%; }
    .td-url   { width: 35%; }
    .td-tags  { width: 14%; color: #6366f1; }
    .td-date  { width: 13%; color: #6b7280; white-space: nowrap; }

    .title  { display: block; font-weight: 600; color: #1a1a2e; margin-bottom: 2px; }
    .domain { display: block; font-size: 9px; color: #9ca3af; font-family: monospace; }
    .url-link { color: #4f46e5; text-decoration: none; font-size: 10px; font-family: monospace; }

    /* ── Footer ── */
    .footer {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #9ca3af;
    }

    /* ── Print ── */
    @media print {
      body { padding: 12px 16px; }
      @page { margin: 12mm 10mm; size: A4 landscape; }
      .url-link { color: #4f46e5 !important; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; }
      .folder-header { page-break-before: auto; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-icon">T</div>
      <div>
        <div class="brand-name">TautanKu</div>
        <div class="brand-sub">Bookmark Manager – Ekspor PDF</div>
      </div>
    </div>
    <div class="meta">
      <div class="meta-total">${bookmarks.length} Tautan</div>
      <div>Dicetak: ${now}</div>
      <div>${folders.length} Folder &nbsp;·&nbsp; ${bookmarks.filter((b) => b.isFavorite).length} Favorit</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="td-num">#</th>
        <th class="td-fav">★</th>
        <th class="td-title">Judul</th>
        <th class="td-url">URL Tautan</th>
        <th class="td-tags">Label</th>
        <th class="td-date">Ditambah</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="footer">
    <span>Dibuat oleh TautanKu – tautanku.vercel.app</span>
    <span>Total: ${bookmarks.length} tautan · ${folders.length} koleksi</span>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Popup diblokir browser. Izinkan popup untuk halaman ini agar bisa cetak/unduh PDF.');
    return;
  }
  win.document.write(html);
  win.document.close();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
