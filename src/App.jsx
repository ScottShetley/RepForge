import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App () {
  return (
    <Router>
      <AuthProvider>
        <div className="bg-gray-800 text-white min-h-screen">
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
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
