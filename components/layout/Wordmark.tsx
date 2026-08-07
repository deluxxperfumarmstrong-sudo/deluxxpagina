import Link from "next/link";

export default function Wordmark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const displaySize = size === "lg" ? "text-5xl md:text-7xl" : "text-2xl";
  return (
    <Link href="/" className="inline-flex flex-col leading-none group">
      <span className={`font-display ${displaySize} text-primary tracking-tight`}>
        DELUXX
      </span>
      <span className="font-[var(--font-body)] text-[0.55em] tracking-[0.25em] uppercase text-accent border-t border-accent pt-1 self-start mt-1">
        Perfum
      </span>
    </Link>
  );
}
