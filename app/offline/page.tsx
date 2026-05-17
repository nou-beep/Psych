// Static page shown when the service worker has no cached entry for a
// route the user is trying to visit while offline. Kept deliberately
// simple — no imports from contexts, so it works even if hydration
// fails.

export const metadata = {
  title: "Offline — Psych",
};

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        padding: "2rem",
        gap: "0.75rem",
      }}
    >
      <div style={{ fontSize: 48 }} aria-hidden>
        ✦
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>
        You&rsquo;re offline
      </h1>
      <p style={{ maxWidth: 360, fontSize: 14, opacity: 0.75 }}>
        Psych is local-first — your cases, notes, and reports are saved in
        this device&rsquo;s storage. Reconnect to load any pages you
        haven&rsquo;t visited yet.
      </p>
    </div>
  );
}
