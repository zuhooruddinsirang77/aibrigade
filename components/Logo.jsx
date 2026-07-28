export default function Logo({ dark = false, size = "1.5rem", className = "" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.webp"
      alt="AIBrigade"
      className={className}
      style={{
        display: "block",
        height: size,
        width: "auto",
        flexShrink: 0,
        filter: dark ? "invert(1)" : "none",
      }}
    />
  );
}
