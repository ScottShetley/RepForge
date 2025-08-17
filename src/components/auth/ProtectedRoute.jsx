import React from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth'; // MODIFIED: Corrected import path

const ProtectedRoute = ({children}) => {
  const {currentUser} = useAuth ();

  if (!currentUser) {
    // If the user is not logged in, redirect them to the /login page
    return <Navigate to="/login" />;
  }

  // If the user is logged in, render the component they were trying to access
  return children;
};

export default ProtectedRoute;
