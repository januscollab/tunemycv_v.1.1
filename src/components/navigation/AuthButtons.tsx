
import React from 'react';
import { Link } from 'react-router-dom';

const AuthButtons: React.FC = () => {
  return (
    <Link
      to="/auth"
      className="bg-apricot text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-apricot/90 transition-colors"
    >
      Sign In
    </Link>
  );
};

export default AuthButtons;
