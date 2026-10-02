import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function exportBookmarksToPDF(bookmarks: Bookmark[], folders: Folder[]): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const now = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date());

  const totalFavorites = bookmarks.filter((b) => b.isFavorite).length;

  // ── Header kop dokumen ──────────────────────────────────────────
  // Background strip ungu
  doc.setFillColor(99, 102, 241); // indigo-500
  doc.rect(0, 0, 297, 18, 'F');

  // Logo / brand text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TautanKu', 10, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Bookmark Manager · Ekspor Tautan', 10, 16);

  // Meta info kanan
  doc.setFontSize(8);
  doc.text(`Dicetak: ${now}`, 297 - 10, 9, { align: 'right' });
  doc.text(
    `Total: ${bookmarks.length} tautan  ·  ${folders.length} folder  ·  ${totalFavorites} favorit`,
    297 - 10, 14.5,
    { align: 'right' }
  );

  // ── Kelompokkan per folder ───────────────────────────────────────
  const grouped = new Map<string, Bookmark[]>();
  for (const bm of bookmarks) {
    const name = getFolderName(bm.folderId, folders);
    if (!grouped.has(name)) grouped.set(name, []);
    grouped.get(name)!.push(bm);
  }

  const sortedGroups = Array.from(grouped.entries()).sort(([a], [b]) =>
    a.localeCompare(b, 'id')
  );

  let startY = 22;

  for (const [folderName, bms] of sortedGroups) {
    // Label folder
    doc.setFillColor(238, 237, 255); // indigo-50
    doc.rect(8, startY, 281, 6, 'F');
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`📁  ${folderName}`, 10, startY + 4);
    doc.setTextColor(156, 163, 175);
    doc.setFont('helvetica', 'normal');
    doc.text(`${bms.length} tautan`, 297 - 10, startY + 4, { align: 'right' });

    startY += 7;

    // Tabel bookmark
    const tableRows = bms.map((bm, i) => [
      String(i + 1),
      bm.isFavorite ? '★' : '',
      bm.title,
      extractDomain(bm.url),
      bm.url,
      bm.tags?.length ? bm.tags.map((t) => `#${t}`).join(' ') : '–',
      formatDate(bm.createdAt),
    ]);

    autoTable(doc, {
      startY,
      margin: { left: 8, right: 8 },
      head: [['#', '★', 'Judul', 'Domain', 'URL', 'Label', 'Ditambah']],
      body: tableRows,
      theme: 'striped',
      styles: {
        fontSize: 7.5,
        cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
        overflow: 'linebreak',
        textColor: [30, 30, 50],
      },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 255],
      },
      columnStyles: {
        0: { cellWidth: 8,  halign: 'center', textColor: [156, 163, 175] },
        1: { cellWidth: 8,  halign: 'center', textColor: [245, 158, 11] },
        2: { cellWidth: 48, fontStyle: 'bold' },
        3: { cellWidth: 32, textColor: [107, 114, 128], fontSize: 7 },
        4: { cellWidth: 90, textColor: [79, 70, 229],  fontSize: 6.5 },
        5: { cellWidth: 36, textColor: [99, 102, 241], fontSize: 7 },
        6: { cellWidth: 28, textColor: [107, 114, 128], halign: 'right' },
      },
      didDrawPage: (data) => {
        // Footer di setiap halaman
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text(
          `TautanKu – ${now}`,
          8,
          doc.internal.pageSize.getHeight() - 5
        );
        doc.text(
          `Halaman ${data.pageNumber} dari ${pageCount}`,
          297 - 8,
          doc.internal.pageSize.getHeight() - 5,
          { align: 'right' }
        );
      },
    });

    startY = (doc as any).lastAutoTable.finalY + 6;

    // Beri jarak antar folder — jika hampir penuh, mulai halaman baru
    if (startY > 180) {
      doc.addPage();
      startY = 10;
    }
  }

  // ── Simpan ──────────────────────────────────────────────────────
  const fileName = `TautanKu-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
