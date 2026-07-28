import Link from "next/link";

export default function CasePlaceholder({ name }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        background: "#161d25",
        color: "#fff",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "clamp(2rem,6vw,4rem)", margin: 0 }}>
        &lt;<span style={{ color: "#9248E4" }}>{name}</span>/&gt;
      </h1>
      <p style={{ opacity: 0.7, maxWidth: "40ch" }}>
        Case-study page placeholder. The home page links here; drop the real case content in{" "}
        <code>app/{name.toLowerCase()}/page.jsx</code>.
      </p>
      <Link href="/" style={{ color: "#9248E4", fontWeight: 600 }}>
        ← Back home
      </Link>
    </main>
  );
}
