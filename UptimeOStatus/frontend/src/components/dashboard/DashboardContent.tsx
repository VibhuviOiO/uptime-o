import { MetricsCard } from './MetricsCard';
import { ChartCard } from './ChartCard';
import { Users, Package, TrendingUp, TrendingDown } from 'lucide-react';

export const DashboardContent = () => {
  const metrics = [
    {
      title: 'Total Users',
      value: '3,782',
      change: '+11.01%',
      isPositive: true,
      icon: Users
    },
    {
      title: 'Active Orders',
      value: '5,359',
      change: '-9.05%',
      isPositive: false,
      icon: Package  
    },
    {
      title: 'Revenue',
      value: '$20,478',
      change: '+12.5%',
      isPositive: true,
      icon: TrendingUp
    },
    {
      title: 'Bounce Rate',
      value: '24.59%',
      change: '-2.1%',
      isPositive: true,
      icon: TrendingDown
    }
  ];

  const monthlySalesData = [
    { month: 'Jan', value: 150 },
    { month: 'Feb', value: 340 },
    { month: 'Mar', value: 180 },
    { month: 'Apr', value: 280 },
    { month: 'May', value: 160 },
    { month: 'Jun', value: 190 },
    { month: 'Jul', value: 260 },
    { month: 'Aug', value: 120 },
    { month: 'Sep', value: 200 },
    { month: 'Oct', value: 340 },
    { month: 'Nov', value: 280 },
    { month: 'Dec', value: 140 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 180, profit: 80 },
    { month: 'Feb', revenue: 190, profit: 90 },
    { month: 'Mar', revenue: 170, profit: 70 },
    { month: 'Apr', revenue: 160, profit: 60 },
    { month: 'May', revenue: 180, profit: 80 },
    { month: 'Jun', revenue: 200, profit: 100 },
    { month: 'Jul', revenue: 230, profit: 130 },
    { month: 'Aug', revenue: 240, profit: 140 },
    { month: 'Sep', revenue: 250, profit: 150 }
  ];

  return (
    <div className="space-y-6">
      
    </div>
  );
};