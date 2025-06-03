
import React from 'react';
import { Link } from 'react-router-dom';

const NavigationLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        {/* Light logo for light backgrounds, dark logo for dark backgrounds */}
        <img 
          src="/lovable-uploads/3a4313a6-1ceb-4eea-93eb-0619b6452a30.png" 
          alt="TuneMyCV Logo" 
          className="h-10 w-auto mr-2 block dark:hidden"
        />
        <img 
          src="/lovable-uploads/0a954f23-ade3-4c24-8a1a-d548bf6299d2.png" 
          alt="TuneMyCV Logo" 
          className="h-10 w-auto mr-2 hidden dark:block"
        />
      </Link>
    </div>
  );
};

export default NavigationLogo;
