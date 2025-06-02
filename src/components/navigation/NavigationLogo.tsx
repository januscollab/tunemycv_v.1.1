
import React from 'react';
import { Link } from 'react-router-dom';

const NavigationLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center">
        <img 
          src="/lovable-uploads/9c0fa345-67f1-4945-aec9-6e428b4de6b2.png" 
          alt="TuneMyCV Logo" 
          className="h-8 w-auto mr-2"
        />
      </Link>
    </div>
  );
};

export default NavigationLogo;
