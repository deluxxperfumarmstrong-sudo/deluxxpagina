export default function IconoEstrella({ className = "w-7 h-7" }: { className?: string }) {
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
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.5L12 17.4l-5.9 3 1.3-6.5-4.9-4.5 6.6-.8z" />
    </svg>
  );
}
