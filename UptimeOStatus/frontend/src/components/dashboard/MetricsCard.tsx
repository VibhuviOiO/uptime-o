import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline">
            <p className="text-base font-semibold text-card-foreground">{value}</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center text-sm">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              isPositive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {change}
          </span>
          <span className="ml-2 text-muted-foreground">vs last month</span>
        </div>
      </div>
    </div>
  );
};