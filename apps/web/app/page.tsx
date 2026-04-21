export default function Home() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        gap: '2rem',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '3rem', fontWeight: 700, margin: 0 }}>CardApp</h1>
      <p style={{ fontSize: '1.25rem', color: '#666', margin: 0 }}>
        Keep score for your card games
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <a
          href="#"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          Download for iOS
        </a>
        <a
          href="#"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          Download for Android
        </a>
      </div>
    </main>
  );
}
