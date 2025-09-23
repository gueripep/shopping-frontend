import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css'; // Reusing the same styles

function Register({ onClose, switchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signInWithGoogle } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, displayName);
      onClose();
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
    }
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      onClose();
    } catch (error) {
      setError('Failed to sign in with Google: ' + error.message);
    }
    setLoading(false);
  }

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <div className="login-header">
          <h2>Create Account</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Full Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password-confirm">Confirm Password</label>
            <input
              type="password"
              id="password-confirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength="6"
            />
          </div>
          
          <button 
            disabled={loading} 
            className="btn btn-primary btn-full"
            type="submit"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button 
          disabled={loading}
          className="btn btn-google btn-full"
          onClick={handleGoogleSignIn}
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
          Sign up with Google
        </button>
        
        <div className="login-footer">
          Already have an account? 
          <button className="link-btn" onClick={switchToLogin}>
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;