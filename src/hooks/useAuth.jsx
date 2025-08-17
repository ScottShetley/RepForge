import {useContext} from 'react';
import {AuthContext} from '../context/AuthContext'; // Path is unchanged, but content of AuthContext.jsx is new

export function useAuth () {
  const context = useContext (AuthContext);
  if (context === undefined) {
    throw new Error ('useAuth must be used within an AuthProvider');
  }
  return context;
}
