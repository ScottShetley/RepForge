import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Workout from './pages/Workout'; // Import the new Workout page

function App () {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-800 text-white">
          <Routes>
            {/* Publicly accessible login page */}
            <Route path="/login" element={<Login />} />

            {/* Protected dashboard page */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* NEW: Protected workout page */}
            <Route
              path="/workout"
              element={
                <ProtectedRoute>
                  <Workout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
