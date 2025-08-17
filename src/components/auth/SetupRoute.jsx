import React from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth'; // MODIFIED

const SetupRoute = ({children}) => {
  const {currentUser, userProfile} = useAuth ();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (userProfile && !userProfile.isSetupComplete) {
    return <Navigate to="/setup" />;
  }

  return children;
};

export default SetupRoute;
