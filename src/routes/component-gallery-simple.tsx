import React from 'react';
import StandardHeader from '../components/StandardHeader.tsx';

const ComponentGalleryRoute: React.FC = () => {
  return (
    <div className="space-y-6">
      <StandardHeader
        title="Component Gallery"
        subtitle="Design system components and UI elements"
        color="emerald"
      />
      
      <div className="p-6">
        <div className="text-center text-zinc-400">
          <p>Component Gallery is temporarily unavailable.</p>
          <p>Please check back later for component demonstrations.</p>
        </div>
      </div>
    </div>
  );
};

export default ComponentGalleryRoute;
