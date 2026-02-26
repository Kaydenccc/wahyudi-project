export function ShuttlecockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Cork base */}
      <ellipse cx="12" cy="18" rx="3.5" ry="2.5" />
      {/* Feathers */}
      <path d="M12 15.5V6" />
      <path d="M8.5 15.5C8.5 15.5 7 12 7 9c0-2.5 2-5.5 5-7" />
      <path d="M15.5 15.5C15.5 15.5 17 12 17 9c0-2.5-2-5.5-5-7" />
      <path d="M9.5 15C9.5 15 9 11 10 7.5" />
      <path d="M14.5 15C14.5 15 15 11 14 7.5" />
    </svg>
  );
}
