import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext'; // Updated path

const Header = () => {
  const {currentUser, logout} = useAuth ();
  const navigate = useNavigate ();

  const handleLogout = async () => {
    try {
      await logout ();
      navigate ('/login'); // Redirect to login page after successful logout
    } catch (error) {
      console.error ('Failed to log out', error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <header className="bg-gray-900 shadow-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        {/* --- App Title --- */}
        <h1 className="text-2xl font-bold text-cyan-400">RepForge</h1>

        {/* --- User Info and Logout Button --- */}
        {currentUser &&
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">{currentUser.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Logout
            </button>
          </div>}
      </div>
    </header>
  );
};

export default Header;
