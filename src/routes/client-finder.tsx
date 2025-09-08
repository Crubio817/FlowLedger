import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ClientFinderRoute: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the module-based client finder
    navigate('/modules/client-finder', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#101010] text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto"></div>
        <p className="text-[var(--text-2)]">Redirecting to Client Finder module...</p>
      </div>
    </div>
  );
};

export default ClientFinderRoute;
