// Clean minimal header with just the brand name

interface HeaderProps {
  eventCount: number;
  lastUpdated: string;
}

export function Header({ eventCount, lastUpdated }: HeaderProps) {
  return (
    <header className="mb-2">
      <div className="container mx-auto px-8 py-8">
        <div className="relative">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-normal text-white drop-shadow-lg font-connihof tracking-tight">
              momentmillionär
            </h1>
          </div>
          <div className="absolute top-0 right-0">
            <a
              href="https://tally.so/r/m606Pk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-2xl hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm border border-white/20"
            >
              <span>➕</span>
              <span className="text-sm font-medium">Event hinzufügen</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
