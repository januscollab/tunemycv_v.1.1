
import React from 'react';
import { Link } from 'react-router-dom';

const AuthButtons: React.FC = () => {
  return (
    <Link
      to="/auth"
      className="bg-zapier-orange text-white px-6 py-2 rounded-lg text-caption font-semibold hover:bg-zapier-orange/90 transition-colors"
    >
      Sign In
    </Link>
  );
};

export default AuthButtons;
