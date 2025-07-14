// Clean minimal header with just the brand name

interface HeaderProps {
  eventCount: number;
  lastUpdated: string;
}

export function Header({ eventCount, lastUpdated }: HeaderProps) {
  return (
    <header className="mb-8">
      <div className="container mx-auto px-8 py-6">
        <div className="text-center">
          <h1 className="text-2xl lg:text-3xl font-normal text-white drop-shadow-lg font-connihof">
            momentmillionär
          </h1>
        </div>
      </div>
    </header>
  );
}
