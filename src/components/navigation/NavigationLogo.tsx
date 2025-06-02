
import React from 'react';
import { Link } from 'react-router-dom';

const NavigationLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center">
        <img 
          src="/lovable-uploads/27d510c8-5f8c-4af0-bab4-85845bfde88b.png" 
          alt="TuneMyCV Logo" 
          className="h-8 w-auto mr-2"
        />
      </Link>
    </div>
  );
};

export default NavigationLogo;
