/* eslint-disable @next/next/no-img-element */
export default function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo.svg"
      alt="TVL - The Value of Law"
      width={size}
      height={size}
      className={className}
    />
  );
}
