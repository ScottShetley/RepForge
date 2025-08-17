import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './context/AuthProvider'; // MODIFIED: Import from new file
import ProtectedRoute from './components/auth/ProtectedRoute';
import SetupRoute from './components/auth/SetupRoute';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Workout from './pages/Workout';
import Instructions from './pages/Instructions';
import Setup from './pages/Setup';

function App () {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-800 text-white">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/setup"
              element={
                <ProtectedRoute>
                  <Setup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <SetupRoute>
                  <Dashboard />
                </SetupRoute>
              }
            />
            <Route
              path="/workout"
              element={
                <SetupRoute>
                  <Workout />
                </SetupRoute>
              }
            />
            <Route
              path="/instructions"
              element={
                <SetupRoute>
                  <Instructions />
                </SetupRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
