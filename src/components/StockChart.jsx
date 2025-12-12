import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                <p className="text-sm font-medium text-popover-foreground">{format(new Date(label), 'MMM d, yyyy')}</p>
                <p className="text-lg font-bold text-primary">
                    ${payload[0].value.toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
};

const StockChart = ({ data, color }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground border border-dashed rounded-xl bg-card/50">
                No data available for this range
            </div>
        );
    }

    // Calculate min/max for Y axis to make the chart look dynamic
    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const padding = (maxPrice - minPrice) * 0.1;

    // Determine gradient color based on prop (default to primary if not specified, but usually passed as hex)
    // We'll use CSS variables or raw hex. 
    // Green: #22c55e (green-500)
    // Red: #ef4444 (red-500)
    const strokeColor = color === 'green' ? '#22c55e' : '#ef4444';
    const fillColor = color === 'green' ? '#22c55e' : '#ef4444';

    return (
        <div className="w-full h-[500px] transition-all duration-300">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => format(new Date(str), 'MMM d')}
                        minTickGap={50}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        domain={[minPrice - padding, maxPrice + padding]}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val.toFixed(0)}`}
                        dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={strokeColor}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StockChart;
