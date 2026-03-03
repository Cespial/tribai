/**
 * Tribai custom SVG icons — triangle/constellation motif.
 * 24x24 viewBox, strokeWidth 1.5, currentColor throughout.
 * Drop-in replacements for lucide-react icons in landing page.
 */

interface IconProps {
  className?: string;
}

/** BookOpen replacement — Book with 3 constellation nodes on spine */
export function TribaiIconET({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M2 6c0-1.1.9-2 2-2h5.5a2.5 2.5 0 0 1 2.5 2.5V20l-.5-.5a2 2 0 0 0-2.8 0L8 20V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 6c0-1.1-.9-2-2-2h-5.5A2.5 2.5 0 0 0 12 6.5V20l.5-.5a2 2 0 0 1 2.8 0L16 20V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="1.2" fill="currentColor"/>
      <circle cx="12" cy="11.5" r="1" fill="currentColor" opacity="0.5"/>
      <circle cx="12" cy="16" r="1" fill="currentColor" opacity="0.5"/>
      <line x1="12" y1="8.2" x2="12" y2="10.5" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
      <line x1="12" y1="12.5" x2="12" y2="15" stroke="currentColor" strokeWidth="0.8" opacity="0.3"/>
    </svg>
  );
}

/** Calculator replacement — Calculator with triangle in display, gold "=" */
export function TribaiIconCalculator({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 6l3 4.5L15 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      <circle cx="12" cy="8" r="0.8" fill="currentColor"/>
      <rect x="7" y="13" width="2" height="1.5" rx="0.4" fill="currentColor" opacity="0.4"/>
      <rect x="11" y="13" width="2" height="1.5" rx="0.4" fill="currentColor" opacity="0.4"/>
      <rect x="15" y="13" width="2" height="1.5" rx="0.4" fill="currentColor" opacity="0.4"/>
      <rect x="7" y="17" width="2" height="1.5" rx="0.4" fill="currentColor" opacity="0.4"/>
      <rect x="11" y="17" width="2" height="1.5" rx="0.4" fill="currentColor"/>
      <rect x="15" y="17" width="2" height="1.5" rx="0.4" fill="currentColor" opacity="0.4"/>
    </svg>
  );
}

/** MessageSquareText replacement — Chat bubble with triangular neural net */
export function TribaiIconAI({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="9" r="1.3" fill="currentColor"/>
      <circle cx="8" cy="13" r="1" fill="currentColor" opacity="0.5"/>
      <circle cx="16" cy="13" r="1" fill="currentColor" opacity="0.5"/>
      <line x1="12" y1="10.3" x2="8.8" y2="12.2" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
      <line x1="12" y1="10.3" x2="15.2" y2="12.2" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
      <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="0.8" opacity="0.2"/>
    </svg>
  );
}

/** CalendarClock replacement — Calendar with gold triangle date marker */
export function TribaiIconCalendar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 13l2.5 4h-5z" fill="currentColor" opacity="0.8"/>
      <circle cx="12" cy="13.5" r="0.8" fill="currentColor"/>
    </svg>
  );
}

/** Scale replacement — Balance with gold pivot node, triangular arms */
export function TribaiIconBalance({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
      <path d="M4 8l4 7h-8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      <path d="M16 8l4 7h-8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      <line x1="6" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="9" y1="21" x2="15" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/** Target replacement — Concentric rings with central triangle */
export function TribaiIconTarget({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
      <path d="M12 8l3 6h-6z" fill="currentColor" opacity="0.7"/>
      <circle cx="12" cy="10.5" r="0.8" fill="currentColor"/>
    </svg>
  );
}

/** FileSearch replacement — Two documents with gold triangle diff marker */
export function TribaiIconComparador({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="11" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="10" y="6" width="11" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <line x1="6" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <line x1="6" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <path d="M16 13l2 3h-4z" fill="currentColor" opacity="0.8"/>
    </svg>
  );
}

/** ShieldCheck replacement — Shield with decision tree, gold checkmark node */
export function TribaiIconGuias({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 2l8 4v5c0 5.25-3.5 10-8 11.5C7.5 21 4 16.25 4 11V6l8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="8" r="1" fill="currentColor" opacity="0.5"/>
      <circle cx="9" cy="12" r="1" fill="currentColor" opacity="0.4"/>
      <circle cx="15" cy="12" r="1" fill="currentColor" opacity="0.4"/>
      <circle cx="12" cy="16" r="1.3" fill="currentColor"/>
      <line x1="12" y1="9" x2="9.5" y2="11.2" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
      <line x1="12" y1="9" x2="14.5" y2="11.2" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
      <line x1="9.5" y1="12.8" x2="11.5" y2="15" stroke="currentColor" strokeWidth="0.8" opacity="0.3"/>
      <line x1="14.5" y1="12.8" x2="12.5" y2="15" stroke="currentColor" strokeWidth="0.8" opacity="0.3"/>
    </svg>
  );
}

/** Bookmark replacement — Bookmark with triangular node network inside */
export function TribaiIconWorkspace({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="8" r="1.2" fill="currentColor"/>
      <circle cx="9" cy="13" r="0.9" fill="currentColor" opacity="0.4"/>
      <circle cx="15" cy="13" r="0.9" fill="currentColor" opacity="0.4"/>
      <line x1="12" y1="9.2" x2="9.5" y2="12.3" stroke="currentColor" strokeWidth="0.7" opacity="0.3"/>
      <line x1="12" y1="9.2" x2="14.5" y2="12.3" stroke="currentColor" strokeWidth="0.7" opacity="0.3"/>
      <line x1="9.9" y1="13" x2="14.1" y2="13" stroke="currentColor" strokeWidth="0.7" opacity="0.2"/>
    </svg>
  );
}

/** Clock replacement — Clock with triangular markers and gold center */
export function TribaiIconClock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <line x1="12" y1="12" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="12" x2="16" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 2.5l0.8 1.5h-1.6z" fill="currentColor" opacity="0.4"/>
      <path d="M21.5 12l-1.5 0.8v-1.6z" fill="currentColor" opacity="0.4"/>
      <path d="M12 21.5l-0.8-1.5h1.6z" fill="currentColor" opacity="0.4"/>
      <path d="M2.5 12l1.5-0.8v1.6z" fill="currentColor" opacity="0.4"/>
    </svg>
  );
}

/** DollarSign replacement — $ with gold node at center curve */
export function TribaiIconMoney({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M16 8c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  );
}

/** GraduationCap replacement — Document with gold triangle certification seal */
export function TribaiIconCertification({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="9" y1="6" x2="15" y2="6" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <line x1="9" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <path d="M12 13l3.5 5.5h-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      <circle cx="12" cy="15.5" r="1" fill="currentColor"/>
    </svg>
  );
}

/** Bot replacement — Brain silhouette with triangular neural network */
export function TribaiIconBrain({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3C8.5 3 5.5 5.5 5.5 9c0 2 1 3.8 2.5 5l1 6.5h6l1-6.5c1.5-1.2 2.5-3 2.5-5 0-3.5-3-6-5.5-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="8" r="1.3" fill="currentColor"/>
      <circle cx="9" cy="12" r="1" fill="currentColor" opacity="0.5"/>
      <circle cx="15" cy="12" r="1" fill="currentColor" opacity="0.5"/>
      <line x1="12" y1="9.3" x2="9.5" y2="11.2" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
      <line x1="12" y1="9.3" x2="14.5" y2="11.2" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
      <line x1="10" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="0.8" opacity="0.25"/>
      <line x1="9.5" y1="17" x2="14.5" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
    </svg>
  );
}
