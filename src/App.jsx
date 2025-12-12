import React, { useEffect, useState, useMemo } from 'react';
import { fetchData } from '@/services/dataService';
import TickerSelector from '@/components/TickerSelector';
import StockChart from '@/components/StockChart';
import { addMonths, subMonths, subYears, isAfter, isBefore, differenceInMonths, parseISO, startOfDay, format } from 'date-fns';
import { Calendar } from 'lucide-react';

function App() {
  const [data, setData] = useState({});
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState(null);

  // Date Range State
  // We'll default to the last 1 year of data if available, or just a default range.
  // Since we don't know the dataset range yet, we'll wait for data to load.
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const result = await fetchData();
      const tickerList = Object.keys(result).sort();
      setData(result);
      setTickers(tickerList);

      if (tickerList.length > 0) {
        setSelectedTicker(tickerList[0]);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Set default date range when data for selected ticker changes OR initially loads
  useEffect(() => {
    if (selectedTicker && data[selectedTicker]) {
      const tickerData = data[selectedTicker];
      if (tickerData.length > 0) {
        const lastDate = tickerData[tickerData.length - 1].date;
        const firstDate = tickerData[0].date;

        // Default to 1 Year lookback, but capped at min date
        let start = subYears(parseISO(lastDate), 1);
        const end = parseISO(lastDate);

        if (isBefore(start, parseISO(firstDate))) {
          start = parseISO(firstDate);
        }

        setStartDate(format(start, 'yyyy-MM-dd'));
        setEndDate(format(end, 'yyyy-MM-dd'));
      }
    }
  }, [selectedTicker, data]);

  const currentData = useMemo(() => {
    if (!selectedTicker || !data[selectedTicker] || !startDate || !endDate) return [];

    // Filter by date range
    return data[selectedTicker].filter(d => {
      const date = d.date; // String yyyy-MM-dd matches comparison usually
      return date >= startDate && date <= endDate;
    });
  }, [selectedTicker, data, startDate, endDate]);

  const profitability = useMemo(() => {
    if (currentData.length < 2) return 0;
    const startPrice = currentData[0].price;
    const endPrice = currentData[currentData.length - 1].price;
    return endPrice - startPrice;
  }, [currentData]);

  const handleDateChange = (type, value) => {
    // Validate constraint: Min 1 month, Max 5 years
    let newStart = type === 'start' ? value : startDate;
    let newEnd = type === 'end' ? value : endDate;

    // Basic validation
    if (!newStart || !newEnd) return; // Wait for full input

    const s = parseISO(newStart);
    const e = parseISO(newEnd);

    if (isAfter(s, e)) return; // Invalid range

    const diff = differenceInMonths(e, s);

    if (diff < 1) {
      // Too short: Enforce minimum 1 month
      // We could adjust the other date, but for now let's just return to block invalid state
      console.warn("Minimum duration is 1 month");
      return;
    }

    if (diff > 60) {
      // Too long: Enforce maximum 5 years
      console.warn("Maximum duration is 5 years");
      return;
    }

    if (type === 'start') setStartDate(value);
    if (type === 'end') setEndDate(value);
  };

  const applyPreset = (months) => {
    if (!selectedTicker || !data[selectedTicker]) return;
    const tickerData = data[selectedTicker];
    const lastDate = tickerData[tickerData.length - 1].date;
    const end = parseISO(lastDate);
    const start = subMonths(end, months);

    // Check bounds
    const dataStart = parseISO(tickerData[0].date);
    const finalStart = isBefore(start, dataStart) ? dataStart : start;

    setStartDate(format(finalStart, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <TickerSelector
        tickers={tickers}
        selectedTicker={selectedTicker}
        onSelect={setSelectedTicker}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">
              {selectedTicker || "Select Ticker"}
            </h1>
            {selectedTicker && currentData.length > 0 && (
              <div className={`text-lg font-medium flex items-center gap-2 ${profitability >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${currentData[currentData.length - 1].price.toFixed(2)}
                <span className="text-sm px-2 py-0.5 rounded-full bg-accent/50 text-foreground/80">
                  {profitability >= 0 ? '+' : ''}{profitability.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Date Controls */}
            <div className="flex bg-accent/20 p-1 rounded-lg gap-1">
              {[
                { label: '1M', val: 1 },
                { label: '6M', val: 6 },
                { label: '1Y', val: 12 },
                { label: '5Y', val: 60 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset.val)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md hover:bg-background/80 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="bg-card border border-input rounded px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="bg-card border border-input rounded px-3 py-1 text-xs focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Chart Area */}
        <div className="flex-1 p-6 flex flex-col relative">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground animate-pulse">
              Loading data...
            </div>
          ) : (
            <div className="flex-1 w-full bg-card/30 rounded-xl border border-border/50 p-4 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <StockChart
                data={currentData}
                color={profitability >= 0 ? 'green' : 'red'}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
