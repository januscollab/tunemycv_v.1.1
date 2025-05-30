
import React from 'react';
import { Link } from 'react-router-dom';

const NavigationLogo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">TuneMyCV</span>
    </Link>
  );
};

export default NavigationLogo;
