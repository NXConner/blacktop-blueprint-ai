import { Hero } from '@/components/homepage/Hero';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <div className="px-4 py-8">
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
