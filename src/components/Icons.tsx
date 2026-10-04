import React from 'react';

/* ──────────────────────────────────────────
   DomainRadar Professional SVG Icon System
   ────────────────────────────────────────── */

export type IconName =
  | 'radar'
  | 'shield-lock'
  | 'chart-line'
  | 'database'
  | 'file-check'
  | 'cpu'
  | 'target'
  | 'search'
  | 'arrow-right'
  | 'check-circle'
  | 'layers'
  | 'folder-kanban'
  | 'zapper'
  | 'clipboard-paste'
  | 'info'
  | 'trending-up'
  | 'trending-down'
  | 'receipt'
  | 'scale'
  | 'star'
  | 'link'
  | 'download'
  | 'trash'
  | 'edit'
  | 'x'
  | 'menu'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-up'
  | 'chevron-down'
  | 'home'
  | 'lock'
  | 'zap'
  | 'shield-check'
  | 'sparkles'
  | 'clock'
  | 'globe'
  | 'bookmark-plus'
  | 'bookmark-check'
  | 'help-circle'
  | 'refresh-cw'
  | 'sliders'
  | 'award'
  | 'archive'
  | 'file-text'
  | 'compass'
  | 'tag'
  | 'alert-circle'
  | 'list-todo'
  | 'arrow-up-right'
  | 'external-link'
  | 'git-branch'
  | 'copy'
  | 'check'
  | 'code'
  | 'rotate-ccw'
  | 'printer'
  | 'radio'
  | 'activity'
  | 'shield-alert';

interface ProfessionalIconProps {
  className?: string;
  size?: number;
}

/** Radar / domain intelligence – hero icon */
function IconRadar({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3 L14.5 8.5 L8 8.5Z" fill="currentColor" />
    </svg>
  );
}

/** Shield + lock – security / privacy icon */
function IconShieldLock({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3L4 6.5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11v-6L12 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <rect x="9" y="13" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 13v-2a2 2 0 0 1 4 0v2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Chart / analytics – outcomes icon */
function IconChartLine({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 17l4-6 4 3 6-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="5" r="2" fill="currentColor" />
    </svg>
  );
}

/** Database / storage icon */
function IconDatabase({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

/** File + check – audit dossier */
function IconFileCheck({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 15l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** CPU / processing icon */
function IconCpu({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.3" />
      {[
        [1, 9, 1, 11], [1, 13, 1, 15], [9, 1, 11, 1], [13, 1, 15, 1],
        [23, 9, 23, 11], [23, 13, 23, 15], [13, 23, 15, 23], [9, 23, 11, 23],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/** Target / precision icon */
function IconTarget({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

/** Search / domain lookup */
function IconSearch({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Arrow right – CTA buttons */
function IconArrowRight({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Check circle – verified / success */
function IconCheckCircle({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Layers – bulk / multi */
function IconLayers({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Folder kanban – watchlist */
function IconFolderKanban({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="13" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="19" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Zapper / spark – Mode A buy diligence */
function IconZapper({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Clipboard paste */
function IconClipboardPaste({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5" y="3" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 10h4M10 13h4M10 16h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Info */
function IconInfo({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="11" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="8" r="0.5" fill="currentColor" />
    </svg>
  );
}

/** Trending up */
function IconTrendingUp({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="16 7 22 7 22 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Receipt */
function IconReceipt({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="13" x2="12" y2="13" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Scale / legal */
function IconScale({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 8l8-5 8 5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 8v6a4 4 0 0 0 4 4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 8v6a4 4 0 0 1-4 4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Star – rating / priority */
function IconStar({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3l3.09 6.26L22 10.27l-5 4.87 1.18 6.88L12 18.77l-6.18 3.25L7 15.14 2 10.27l6.91-1.01L12 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Link */
function IconLink({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Download */
function IconDownload({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" />
      <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Trash */
function IconTrash({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Edit / pencil */
function IconEdit({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** X / close */
function IconX({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Menu / hamburger */
function IconMenu({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Chevron right */
function IconChevronRight({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Chevron left */
function IconChevronLeft({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Home */
function IconHome({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 12l9-9 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Lock */
function IconLock({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Zap (solid fill variant) */
function IconZapSolid({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor" />
    </svg>
  );
}

/** Shield check – protection verified */
function IconShieldCheck({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3L4 6.5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11v-6L12 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Sparkles / magic */
function IconSparkles({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" fill="currentColor" opacity="0.9" />
      <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z" fill="currentColor" opacity="0.6" />
      <path d="M5 16l.5 1.5L7 18l-1.5.5L5 20l-.5-1.5L3 18l1.5-.5L5 16z" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

/** Map of icon name → component */
const iconMap: Record<IconName, React.FC<ProfessionalIconProps>> = {
  radar: IconRadar,
  'shield-lock': IconShieldLock,
  'chart-line': IconChartLine,
  database: IconDatabase,
  'file-check': IconFileCheck,
  cpu: IconCpu,
  target: IconTarget,
  search: IconSearch,
  'arrow-right': IconArrowRight,
  'check-circle': IconCheckCircle,
  layers: IconLayers,
  'folder-kanban': IconFolderKanban,
  zapper: IconZapper,
  'clipboard-paste': IconClipboardPaste,
  info: IconInfo,
  'trending-up': IconTrendingUp,
  receipt: IconReceipt,
  scale: IconScale,
  star: IconStar,
  link: IconLink,
  download: IconDownload,
  trash: IconTrash,
  edit: IconEdit,
  x: IconX,
  menu: IconMenu,
  'chevron-right': IconChevronRight,
  'chevron-left': IconChevronLeft,
  home: IconHome,
  lock: IconLock,
  zap: IconZapSolid,
  'shield-check': IconShieldCheck,
  'trending-down': IconTrendingUp,
  'help-circle': IconInfo,
  'bookmark-plus': IconBookmarkPlus,
  'bookmark-check': IconBookmarkCheck,
  'refresh-cw': IconRefreshCw,
  sliders: IconSliders,
  award: IconAward,
  'chevron-up': IconChevronUp,
  'chevron-down': IconChevronDown,
  archive: IconArchive,
  'file-text': IconFileText,
  compass: IconCompass,
  tag: IconTag,
  'alert-circle': IconAlertCircle,
  'list-todo': IconListTodo,
  'arrow-up-right': IconArrowUpRight,
  'external-link': IconExternalLink,
  'git-branch': IconGitBranch,
  copy: IconCopy,
  check: IconCheck,
  'code': IconCode,
  'rotate-ccw': IconRotateCcw,
  printer: IconPrinter,
  radio: IconRadio,
  activity: IconActivity,
  'shield-alert': IconShieldAlert,
  clock: IconClock,
  globe: IconGlobe,
  sparkles: IconSparkles,
};

/** Bookmark Plus */
function IconBookmarkPlus({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="8" x2="12" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Bookmark Check */
function IconBookmarkCheck({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Refresh / Rotate */
function IconRefreshCw({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M21 2v6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 22v-6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 8A9 9 0 0 0 5.12 4.12L3 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16a9 9 0 0 0 15.88-3.88L21 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Sliders */
function IconSliders({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <line x1="4" y1="21" x2="4" y2="14" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="10" x2="4" y2="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="21" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="8" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="21" x2="20" y2="16" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="12" x2="20" y2="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="1" y1="14" x2="7" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="16" x2="23" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Award */
function IconAward({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Chevron up */
function IconChevronUp({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Chevron down */
function IconChevronDown({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Archive */
function IconArchive({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** File text */
function IconFileText({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Compass */
function IconCompass({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Tag */
function IconTag({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Alert circle */
function IconAlertCircle({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
    </svg>
  );
}

/** List todo */
function IconListTodo({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Arrow up right */
function IconArrowUpRight({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** External link */
function IconExternalLink({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="1.5" />
      <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Git branch */
function IconGitBranch({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <line x1="6" y1="3" x2="6" y2="15" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 9a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Copy */
function IconCopy({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Check */
function IconCheck({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Code / development */
function IconCode({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <polyline points="16 18 22 12 16 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="8 6 2 12 8 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14" y1="4" x2="10" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Rotate ccw */
function IconRotateCcw({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Printer */
function IconPrinter({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 9V2h12v7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Radio */
function IconRadio({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.76 16.24a6 6 0 0 1 0-8.49" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.93 19.07a10 10 0 0 1 0-14.14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Activity */
function IconActivity({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Shield alert */
function IconShieldAlert({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3L4 6.5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11v-6L12 3z" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
    </svg>
  );
}

/** Clock */
function IconClock({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Globe */
function IconGlobe({ className = '', size = 24 }: ProfessionalIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Universal professional icon component.
 * Usage: `<Icon name="radar" className="text-emerald-600" size={20} />`
 */
export const Icon: React.FC<{ name: IconName } & Omit<ProfessionalIconProps, 'size'> & { size?: number }> = ({
  name,
  className = '',
  size = 24,
}) => {
  const Comp = iconMap[name];
  if (!Comp) return null;
  return <Comp className={className} size={size} />;
};