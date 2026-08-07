export default function IconoBillete({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="1.5" y="5.5" width="21" height="13" rx="1" />
      <circle cx="12" cy="12" r="3" />
      <path d="M5 8.5v0M19 15.5v0" />
    </svg>
  );
}
