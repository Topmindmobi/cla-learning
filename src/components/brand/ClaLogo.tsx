export function ClaLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect x="1" y="14" width="12" height="6" rx="1.5" fill="currentColor" opacity="0.85" />
      <rect x="15" y="14" width="12" height="6" rx="1.5" fill="currentColor" opacity="0.35" />
      <rect x="1" y="21" width="26" height="6" rx="1.5" fill="currentColor" opacity="0.2" />
      <rect x="8" y="7" width="12" height="6" rx="1.5" fill="#1F4FD8" />
    </svg>
  );
}

export function ClaLogoLight({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect x="1" y="14" width="12" height="6" rx="1.5" fill="#fff" opacity="0.85" />
      <rect x="15" y="14" width="12" height="6" rx="1.5" fill="#fff" opacity="0.35" />
      <rect x="1" y="21" width="26" height="6" rx="1.5" fill="#fff" opacity="0.2" />
      <rect x="8" y="7" width="12" height="6" rx="1.5" fill="#1F4FD8" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="8.2" />
      <path d="M6.2 10.3l2.6 2.6 5-5.4" />
    </svg>
  );
}
