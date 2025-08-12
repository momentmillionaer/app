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
          <h1 className="text-4xl lg:text-5xl font-normal text-white drop-shadow-lg font-connihof tracking-tight">
            momentmillionär
          </h1>
          <p className="text-white/80 text-sm mt-2">Events in Graz - {eventCount} Events verfügbar</p>
        </div>
      </div>
    </header>
  );
}
