

import Navbar from './Navbar';
import { DashboardContent } from './DashboardContent';

export const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="pt-8 px-6 lg:px-8">
        {children ? children : <DashboardContent />}
      </main>
    </div>
  );
};