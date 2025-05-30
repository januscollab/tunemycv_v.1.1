
import React from 'react';
import { Link } from 'react-router-dom';

const AuthButtons: React.FC = () => {
  return (
    <div className="flex items-center space-x-4">
      <Link
        to="/auth?mode=signin"
        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        Sign In
      </Link>
      <Link
        to="/auth?mode=signup"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Sign Up
      </Link>
    </div>
  );
};

export default AuthButtons;
