export default function CrownLogo({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: Math.round(size * 0.25),
        background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.75}
        height={size * 0.75}
        viewBox="0 0 24 24"
        fill="#01e29e"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* crown body */}
        <path d="M2 16 L5 9 L9 12.5 L12 4.5 L15 12.5 L19 9 L22 16 Z" />
        {/* bottom bar */}
        <rect x="2" y="17.5" width="20" height="2.8" rx="1.4" />
        {/* tip orbs */}
        <circle cx="5"  cy="7.5" r="1.8" />
        <circle cx="12" cy="3"   r="1.8" />
        <circle cx="19" cy="7.5" r="1.8" />
      </svg>
    </div>
  );
}
