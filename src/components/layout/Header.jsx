import React from 'react';
import {useNavigate, NavLink} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth'; // MODIFIED

const Header = () => {
  const {currentUser, logout} = useAuth ();
  const navigate = useNavigate ();

  const handleLogout = async () => {
    try {
      await logout ();
      navigate ('/login');
    } catch (error) {
      console.error ('Failed to log out', error);
    }
  };

  const linkStyle =
    'px-3 py-2 rounded-md text-sm font-medium transition-colors';
  const activeLinkStyle = 'bg-gray-700 text-white';
  const inactiveLinkStyle = 'text-gray-300 hover:bg-gray-700 hover:text-white';

  return (
    <header className="bg-gray-900 shadow-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-cyan-400">RepForge</h1>
          {currentUser &&
            <nav className="flex space-x-4">
              <NavLink
                to="/"
                end
                className={({isActive}) =>
                  `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/workout"
                className={({isActive}) =>
                  `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
              >
                New Workout
              </NavLink>
              <NavLink
                to="/instructions"
                className={({isActive}) =>
                  `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
              >
                Instructions
              </NavLink>
            </nav>}
        </div>
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
