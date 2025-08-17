import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../hooks/useAuth'; // MODIFIED: Corrected import path

export default function Login () {
  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState ('');
  const [password, setPassword] = useState ('');
  const [error, setError] = useState ('');
  const [loading, setLoading] = useState (false);

  // --- HOOKS ---
  const {signup, login, currentUser} = useAuth ();
  const navigate = useNavigate ();

  // Redirect if user is already logged in
  useEffect (
    () => {
      if (currentUser) {
        navigate ('/'); // Redirect to the main dashboard or workout page
      }
    },
    [currentUser, navigate]
  );

  // --- EVENT HANDLERS ---
  const handleSignUp = async e => {
    e.preventDefault ();
    if (password.length < 6) {
      return setError ('Password must be at least 6 characters long.');
    }

    try {
      setError ('');
      setLoading (true);
      await signup (email, password);
      // The setup route will handle navigation for new users
    } catch (err) {
      setError ('Failed to create an account. Please try again.');
      console.error (err);
    }
    setLoading (false);
  };

  const handleSignIn = async e => {
    e.preventDefault ();
    try {
      setError ('');
      setLoading (true);
      await login (email, password);
      // The setup route will handle navigation for existing users
    } catch (err) {
      setError ('Failed to sign in. Check your email and password.');
      console.error (err);
    }
    setLoading (false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-gray-800 p-10 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold">
            Welcome to RepForge
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in or create an account to continue
          </p>
        </div>

        {/* --- ERROR DISPLAY --- */}
        {error &&
          <div
            className="rounded-md border border-red-500/50 bg-red-500/20 p-3 text-center text-sm text-red-400"
            role="alert"
          >
            {error}
          </div>}

        {/* --- LOGIN FORM --- */}
        <form className="space-y-6">
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail (e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={e => setPassword (e.target.value)}
              />
            </div>
          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Sign Up / Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
