import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

function Login({ onClose, switchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      onClose();
    } catch (error) {
      setError('Failed to log in: ' + error.message);
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
          <h2>Sign In</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
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
            />
          </div>
          
          <button 
            disabled={loading} 
            className="btn btn-primary btn-full"
            type="submit"
          >
            {loading ? 'Signing In...' : 'Sign In'}
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
          Sign in with Google
        </button>
        
        <div className="login-footer">
          Don't have an account? 
          <button className="link-btn" onClick={switchToRegister}>
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;