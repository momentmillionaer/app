// Clean minimal header with just the brand name

interface HeaderProps {
  eventCount: number;
  lastUpdated: string;
}

export function Header({ eventCount, lastUpdated }: HeaderProps) {
  return (
    <header className="mb-2">
      <div className="container mx-auto px-8 py-8">
        <div className="text-center">
          <h1 style={{color: '#000000', fontSize: '48px', fontWeight: 'bold', textAlign: 'center', margin: '20px 0'}}>
            momentmillionär
          </h1>
          <div style={{background: '#ff0000', color: '#ffffff', padding: '20px', fontSize: '24px', fontWeight: 'bold', margin: '20px 0', border: '5px solid #000000'}}>
            SICHTBARKEITSTEST: {eventCount} Events geladen ✅
          </div>
          
        </div>
      </div>
    </header>
  );
}
