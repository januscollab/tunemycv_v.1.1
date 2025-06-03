
import React from 'react';
import { Link } from 'react-router-dom';

const NavigationLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <img 
          src="/lovable-uploads/3a4313a6-1ceb-4eea-93eb-0619b6452a30.png" 
          alt="TuneMyCV Logo" 
          className="h-10 w-auto mr-2"
        />
      </Link>
    </div>
  );
};

export default NavigationLogo;
