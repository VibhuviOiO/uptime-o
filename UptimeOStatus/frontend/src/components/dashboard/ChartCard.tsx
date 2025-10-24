import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface ChartCardProps {
  title: string;
  description: string;
  data: any[];
  type: 'bar' | 'line';
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  data,
  type
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-card p-6 shadow-sm">
      <div className="mb-6">
  <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-xs text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-xs text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};