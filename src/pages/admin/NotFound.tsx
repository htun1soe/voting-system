import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(260_30%_97%)] px-6">
      <div className="text-center max-w-md">
        <h1 className="font-serif font-bold text-8xl text-[hsl(265_85%_55%)] mb-4">404</h1>
        <h2 className="font-serif font-bold text-2xl text-[hsl(265_30%_15%)] mb-2">Page Not Found</h2>
        <p className="text-[hsl(265_10%_45%)] mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl green-bg text-white font-semibold hover:scale-105 transition-all"
        >
          <HomeIcon className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;