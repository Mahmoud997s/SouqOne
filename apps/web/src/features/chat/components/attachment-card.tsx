'use client';

import { Download } from 'lucide-react';

interface AttachmentCardProps {
  fileName: string;
  fileSize: string;
  fileType: string;
  url: string;
  isMine: boolean;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  pdf: { bg: 'bg-error-container', text: 'text-error', icon: 'picture_as_pdf' },
  doc: { bg: 'bg-primary/10', text: 'text-primary', icon: 'description' },
  xls: { bg: 'bg-green-100', text: 'text-green-700', icon: 'table_chart' },
  default: { bg: 'bg-surface-container-high', text: 'text-outline', icon: 'attach_file' },
};

function getStyle(type: string) {
  const ext = type.toLowerCase().split('/').pop() || '';
  if (ext.includes('pdf')) return TYPE_STYLES.pdf;
  if (ext.includes('doc') || ext.includes('word')) return TYPE_STYLES.doc;
  if (ext.includes('xls') || ext.includes('sheet')) return TYPE_STYLES.xls;
  return TYPE_STYLES.default;
}

export function AttachmentCard({ fileName, fileSize, fileType, url, isMine }: AttachmentCardProps) {
  const style = getStyle(fileType);

  return (
    <div className={`flex ${isMine ? 'justify-start' : 'justify-end self-end'} mb-1`}>
      <div className="max-w-[80%] bg-surface-container-lowest border border-surface-variant/30 p-3 rounded-2xl shadow-sm flex items-center gap-3">
        <div className={`w-10 h-10 ${style.bg} ${style.text} rounded-lg flex items-center justify-center shrink-0`}>
          <span className="material-symbols-outlined">{style.icon}</span>
        </div>
        <div className="flex-1 min-w-0 pl-4">
          <p className="text-xs font-bold truncate">{fileName}</p>
          <p className="text-[11px] text-outline">{fileSize}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 transition-colors shrink-0"
        >
          <Download size={18} />
        </a>
      </div>
    </div>
  );
}
