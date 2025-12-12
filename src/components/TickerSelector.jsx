import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming alias is configured or relative path

// We might need to adjust import path for utils if alias not set in vite.config
// For safety, let's use relative path:
// import { cn } from '../lib/utils';
// Actually, I didn't set up alias in vite.config.js, so I should use relative paths or update vite config.
// I'll use relative path for now.

const TickerSelector = ({ tickers, selectedTicker, onSelect }) => {
    const [search, setSearch] = useState("");

    const filteredTickers = tickers.filter(t => t.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-r border-border w-80">
            <div className="p-4 border-b border-border">
                <h2 className="text-xl font-bold tracking-tight mb-4">Market</h2>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search tickers..."
                        className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                {filteredTickers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No tickers found</div>
                ) : (
                    <div className="space-y-1">
                        {filteredTickers.map(ticker => (
                            <button
                                key={ticker}
                                onClick={() => onSelect(ticker)}
                                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                  ${selectedTicker === ticker
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`}
                            >
                                {ticker}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TickerSelector;
