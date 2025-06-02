
import React from 'react';
import { Link } from 'react-router-dom';

const NavigationLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center">
        <img 
          src="/lovable-uploads/7aefb742-801d-4494-af3e-defd30462f1c.png" 
          alt="TuneMyCV Logo" 
          className="h-8 w-auto mr-2"
        />
      </Link>
    </div>
  );
};

export default NavigationLogo;
