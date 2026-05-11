import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type DocumentItem = {
  id: string;
  title: string;
  meta: string;
  ext: 'JPG' | 'PNG' | 'PDF';
  isImg: boolean;
  url: string;      // preview/download source (REAL)
  fileName: string; // download name
};

@Component({
  selector: 'app-admin-review-app',
  imports: [CommonModule],
  templateUrl: './admin-review-app.component.html',
  styleUrl: './admin-review-app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class AdminReviewAppComponent {
  applicantName = signal<string>('Ahmed Mansour');

  // source of truth (documents)
  documents = signal<DocumentItem[]>([
    {
      id: 'doc-1',
      title: 'National ID - Front',
      meta: '2.4 MB • Uploaded May 12',
      ext: 'JPG',
      isImg: true,
      url: '/images/Logo.jpeg',
      fileName: 'national-id-front.jpg',
    },
    {
      id: 'doc-2',
      title: 'National ID - Back',
      meta: '2.1 MB • Uploaded May 12',
      ext: 'JPG',
      isImg: true,
      url: '/images/Logo.jpeg',
      fileName: 'national-id-back.jpg',
    },
    {
      id: 'doc-3',
      title: 'Property Title Deed',
      meta: '4.8 MB • Uploaded May 14',
      ext: 'PDF',
      isImg: false,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'property-title-deed.pdf',
    },
    {
      id: 'doc-4',
      title: 'Commercial Register',
      meta: '3.2 MB • Uploaded May 14',
      ext: 'PDF',
      isImg: false,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'commercial-register.pdf',
    }
  ]);

  // Request status
  requestStatus = signal<RequestStatus>('PENDING');

  requestStatusLabel = computed(() => {
    const s = this.requestStatus();
    if (s === 'APPROVED') return 'Approved';
    if (s === 'REJECTED') return 'Rejected';
    return 'Pending Review';
  });

  statusBadgeClass = computed(() => {
    const s = this.requestStatus();
    if (s === 'APPROVED') return 'bg-emerald-200 text-emerald-900';
    if (s === 'REJECTED') return 'bg-red-100 text-red-800';
    return 'bg-[#FFD9C4] text-[#8C3D1A]';
  });

  // Gallery expand/collapse
  isGalleryExpanded = signal<boolean>(false);

  toggleGallery(): void {
    this.isGalleryExpanded.set(!this.isGalleryExpanded());
  }

  // Preview modal state
  isPreviewOpen = signal<boolean>(false);
  private readonly previewDocId = signal<string>('');

  private readonly previewDoc = computed(() => {
    const id = this.previewDocId();
    return this.documents().find(d => d.id === id) ?? null;
  });

  previewTitle = computed(() => this.previewDoc()?.title ?? '');
  previewMeta = computed(() => this.previewDoc()?.meta ?? '');
  previewUrl = computed(() => this.previewDoc()?.url ?? '');
  previewIsImg = computed(() => this.previewDoc()?.isImg ?? false);
  previewFileName = computed(() => this.previewDoc()?.fileName ?? '');

  openPreview(doc: DocumentItem): void {
    this.previewDocId.set(doc.id);
    this.isPreviewOpen.set(true);
  }

  closePreview(): void {
    this.isPreviewOpen.set(false);
    this.previewDocId.set('');
  }

  async downloadPreview(): Promise<void> {
    const doc = this.previewDoc();
    if (!doc) return;
    await this.downloadDoc(doc);
  }

  // FIX: Real download using the URL in data, with correct filename/ext.
  async downloadDoc(doc: DocumentItem): Promise<void> {
    const href = doc.url;
    const fileName = this.ensureFileName(doc);

    // Try direct anchor first (best for same-origin and some CDNs)
    const a = document.createElement('a');
    a.href = href;
    a.download = fileName;
    a.target = '_blank';
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Force download via blob if allowed by CORS
    try {
      const res = await fetch(href, { cache: 'no-store', mode: 'cors' });
      if (!res.ok) return;

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a2 = document.createElement('a');
      a2.href = blobUrl;
      a2.download = fileName;
      a2.style.display = 'none';

      document.body.appendChild(a2);
      a2.click();
      document.body.removeChild(a2);

      URL.revokeObjectURL(blobUrl);
    } catch {
      // no console logs
    }
  }

  private ensureFileName(doc: DocumentItem): string {
    const fromData = (doc.fileName ?? '').trim();
    if (fromData) return fromData;

    const base = (doc.title ?? 'document')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const ext = (doc.ext ?? 'PDF').toLowerCase();
    return `${base}.${ext}`;
  }

  // -------------------------
  // Accept / Reject modals
  // -------------------------
  isAcceptOpen = signal(false);
  isRejectOpen = signal(false);

  rejectionReason = signal<string>('');
  rejectError = signal<string>('');

  openAcceptModal(): void {
    this.isAcceptOpen.set(true);
  }

  closeAcceptModal(): void {
    this.isAcceptOpen.set(false);
  }

  confirmAccept(): void {
    this.requestStatus.set('APPROVED');
    this.isAcceptOpen.set(false);
    this.isRejectOpen.set(false);
  }

  openRejectModal(): void {
    this.rejectError.set('');
    this.rejectionReason.set('');
    this.isRejectOpen.set(true);
  }

  closeRejectModal(): void {
    this.isRejectOpen.set(false);
    this.rejectError.set('');
  }

  confirmReject(): void {
    const reason = (this.rejectionReason() ?? '').trim();
    if (!reason) {
      this.rejectError.set('Rejection reason is required.');
      return;
    }

    this.requestStatus.set('REJECTED');
    this.isRejectOpen.set(false);
    this.isAcceptOpen.set(false);
    this.rejectError.set('');
  }

  // Backward compatible handlers (if referenced elsewhere)
  approveRequest(): void {
    this.openAcceptModal();
  }

  rejectRequest(): void {
    this.openRejectModal();
  }
}