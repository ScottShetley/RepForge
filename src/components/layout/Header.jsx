import React, {useState} from 'react';
import {useNavigate, NavLink} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';

const HamburgerIcon = ({onClick}) => (
  <button
    onClick={onClick}
    className="p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  </button>
);

const CloseIcon = ({onClick}) => (
  <button
    onClick={onClick}
    className="p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>
);

const Header = () => {
  const {currentUser, logout} = useAuth ();
  const navigate = useNavigate ();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState (false);

  const handleLogout = async () => {
    try {
      await logout ();
      navigate ('/login');
    } catch (error) {
      console.error ('Failed to log out', error);
    }
  };

  const linkStyle =
    'rounded-md px-3 py-2 text-sm font-medium transition-colors';
  const activeLinkStyle = 'bg-gray-700 text-white';
  const inactiveLinkStyle = 'text-gray-300 hover:bg-gray-700 hover:text-white';

  const mobileLinkStyle = 'block rounded-md px-3 py-2 text-base font-medium';

  return (
    <header className="sticky top-0 z-40 bg-gray-900 shadow-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        {/* Left Section: Logo and Desktop Nav */}
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-cyan-400">RepForge</h1>
          {currentUser &&
            <nav className="hidden space-x-4 md:flex">
              <NavLink
                to="/"
                end
                className={({isActive}) =>
                  `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/select-workout" // MODIFIED
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
              <NavLink
                to="/settings"
                className={({isActive}) =>
                  `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
              >
                Settings
              </NavLink>
            </nav>}
        </div>

        {/* Right Section: User Info and Logout (Desktop) */}
        {currentUser &&
          <div className="hidden items-center space-x-4 md:flex">
            <span className="text-sm text-gray-300">{currentUser.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Logout
            </button>
          </div>}

        {/* Mobile Menu Button */}
        {currentUser &&
          <div className="flex items-center md:hidden">
            {isMobileMenuOpen
              ? <CloseIcon onClick={() => setIsMobileMenuOpen (false)} />
              : <HamburgerIcon onClick={() => setIsMobileMenuOpen (true)} />}
          </div>}
      </div>

      {/* Mobile Menu Flyout */}
      {isMobileMenuOpen &&
        currentUser &&
        <div className="bg-gray-900 md:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
            <NavLink
              to="/"
              end
              onClick={() => setIsMobileMenuOpen (false)}
              className={({isActive}) =>
                `${mobileLinkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/select-workout" // MODIFIED
              onClick={() => setIsMobileMenuOpen (false)}
              className={({isActive}) =>
                `${mobileLinkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
            >
              New Workout
            </NavLink>
            <NavLink
              to="/instructions"
              onClick={() => setIsMobileMenuOpen (false)}
              className={({isActive}) =>
                `${mobileLinkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
            >
              Instructions
            </NavLink>
            <NavLink
              to="/settings"
              onClick={() => setIsMobileMenuOpen (false)}
              className={({isActive}) =>
                `${mobileLinkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
            >
              Settings
            </NavLink>
          </div>
          <div className="border-t border-gray-700 pt-4 pb-3">
            <div className="flex items-center px-5">
              <div className="text-sm font-medium text-gray-300">
                {currentUser.email}
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              <button
                onClick={handleLogout}
                className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>}
    </header>
  );
};

export default Header;
