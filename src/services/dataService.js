import Papa from 'papaparse';
import { format, parseISO, isValid } from 'date-fns';

export const fetchData = async () => {
    try {
        const response = await fetch('/data.csv');
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const data = results.data;

                    // Group by Ticker
                    const tickers = {};

                    data.forEach(row => {
                        // Columns: Date, TICKER, Close_Price
                        const ticker = row.TICKER;
                        if (!ticker) return;

                        if (!tickers[ticker]) {
                            tickers[ticker] = [];
                        }

                        // Parse data
                        // Assume 1st column is Date, 3rd is Price. Using header names is safer.
                        // HEADERS: Date, TICKER, Close_Price_Raw
                        const dateStr = row.Date;
                        const price = parseFloat(row.Close_Price_Raw);

                        if (dateStr && !isNaN(price)) {
                            tickers[ticker].push({
                                date: dateStr,
                                price: price
                            });
                        }
                    });

                    // Sort each ticker's data by date
                    Object.keys(tickers).forEach(ticker => {
                        tickers[ticker].sort((a, b) => new Date(a.date) - new Date(b.date));
                    });

                    resolve(tickers);
                },
                error: (err) => {
                    reject(err);
                }
            });
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        return {};
    }
};
