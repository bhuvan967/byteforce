import React, { useState } from 'react';
import { auth, googleProvider } from '../../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';

// --- SVG Illustration ---
function SkillsIllustration() {
  return (
    <svg width="350" height="270" viewBox="0 0 350 270" fill="none">
      <rect x="66" y="180" width="220" height="30" rx="14" fill="#6c63ff" opacity="0.35"/>
      <rect x="80" y="100" width="190" height="60" rx="18" fill="#6c63ff"/>
      <rect x="110" y="110" width="60" height="14" rx="4" fill="#fff"/>
      <rect x="110" y="134" width="125" height="10" rx="4" fill="#fff"/>
      <circle cx="200" cy="125" r="17" fill="#ffe066"/>
      <rect x="80" y="40" width="140" height="40" rx="18" fill="#3557e3"/>
      <rect x="105" y="60" width="55" height="10" rx="4" fill="#fff"/>
      <rect x="105" y="45" width="100" height="6" rx="3" fill="#fff" opacity="0.7"/>
      <ellipse cx="260" cy="205" rx="50" ry="15" fill="#6c63ff" opacity="0.12"/>
      <rect x="200" y="65" width="40" height="15" rx="4" fill="#6c63ff"/>
      <rect x="112" y="155" width="50" height="24" rx="7" fill="#ffe066"/>
      <rect x="190" y="155" width="35" height="9" rx="4" fill="#fff" opacity="0.6"/>
      <rect x="220" y="50" width="40" height="7" rx="3" fill="#22223b" />
      <rect x="235" y="55" width="8" height="13" rx="4" fill="#22223b" />
      <rect x="80" y="220" width="34" height="10" rx="4" fill="#3557e3"/>
      <rect x="120" y="230" width="34" height="10" rx="4" fill="#ffe066"/>
      <rect x="170" y="220" width="34" height="10" rx="4" fill="#6c63ff"/>
    </svg>
  );
}

// --- Styles (unchanged) ---
const containerStyle = {
  minHeight: '100vh',
  background: '#f2f4f8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Poppins, Arial, sans-serif'
};
const cardStyle = {
  display: 'flex',
  background: 'white',
  borderRadius: 24,
  boxShadow: '0 8px 40px 0 #6c63ff43',
  overflow: 'hidden',
  width: 850,
  minHeight: 520
};
const leftStyle = {
  flex: 1,
  background: 'linear-gradient(120deg, #6c63ff 0%, #3b35c6 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0
};
const textLeftStyle = {
  color: '#fff',
  fontWeight: 700,
  fontSize: 26,
  marginTop: '20px',
  textAlign: 'center'
};
const rightStyle = {
  flex: 1,
  padding: '54px 48px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};
const switchBtnRowStyle = {
  marginBottom: '12px',
  textAlign: 'right'
};
const switchBtnStyle = (active, disabled) => ({
  border: 'none',
  borderRadius: 8,
  padding: '9px 24px',
  fontWeight: 700,
  fontSize: 15,
  background: active ? '#6c63ff' : '#ebeefd',
  color: active ? '#fff' : '#444',
  boxShadow: active ? '0 4px 16px #6c63ff33' : 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  marginLeft: 8,
  outline: 'none',
  opacity: disabled ? 0.65 : 1
});
const formHeadingStyle = {
  fontWeight: 700,
  fontSize: 29,
  marginBottom: 16,
  color: '#282828'
};
const subtitleStyle = {
  color: '#7a7b93',
  fontSize: 15,
  marginBottom: 24,
};
const inputStyle = {
  width: '100%',
  borderRadius: 8,
  padding: '12px 13px',
  border: '1px solid #c3c7e8',
  outline: 'none',
  marginBottom: 20,
  fontSize: 16,
  background: '#f8fafc',
  transition: 'border 0.2s'
};
const checkboxRowStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 25
};
const checkboxStyle = {
  accentColor: '#6c63ff',
  width: 16,
  height: 16,
  marginRight: 7
};
const labelSmallStyle = {
  fontSize: 14,
  color: '#777',
  marginLeft: 4
};
const primaryBtnStyle = {
  border: 'none',
  borderRadius: 8,
  width: '100%',
  color: '#fff',
  padding: '14px 0',
  fontWeight: 700,
  fontSize: 17,
  background: 'linear-gradient(90deg, #3557e3 0%, #6c63ff 100%)',
  transition: 'background 0.2s',
  marginTop: 8,
  boxShadow: '0 2px 16px #6c63ff30',
  cursor: 'pointer',
  letterSpacing: 1
};
const googleBtnStyle = {
  margin: '10px 0',
  width: '100%',
  padding: '14px 0',
  background: '#fff',
  borderRadius: 8,
  border: '1px solid #dadce0',
  color: '#282828',
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 1px 6px #dadce044'
};
const iconStyle = {
  marginRight: 8
};
const mutedTextStyle = {
  marginTop: 36,
  textAlign: 'center',
  color: '#999',
  fontSize: 14
};
const linkStyle = {
  color: '#3557e3',
  textDecoration: 'underline',
  cursor: 'pointer',
  marginLeft: 3
};

// --- Google Button ---
function GoogleButton({ text, onClick }) {
  return (
    <button style={googleBtnStyle} onClick={onClick}>
      <svg style={iconStyle} width="22" height="22" viewBox="0 0 48 48">
        <g>
          <path fill="#4285f4" d="M24 9.5c3.54 0 6.61 1.22 9.08 3.61l6.64-6.91C36.13 2.06 30.56 0 24 0 14.83 0 7.1 5.06 2.95 12.36l8.02 6.24c2.13-6.44 8.2-10.86 15.11-10.86z"/>
          <path fill="#34a853" d="M46.09 24.51c0-1.78-.16-3.5-.45-5.17H24v9.8h13.55c-.6 3.23-2.39 5.96-4.99 7.81l7.82 6.04C43.72 39.75 46.09 32.77 46.09 24.51z"/>
          <path fill="#fbbc05" d="M10.97 28.6A14.91 14.91 0 0 1 9.38 24c0-1.6.28-3.15.79-4.6l-7.85-6.27A23.918 23.918 0 0 0 0 24c0 5.09 1.68 9.81 4.55 13.59l8.42-7.06z"/>
          <path fill="#ea4335" d="M24 47.98c6.44 0 11.81-2.12 15.76-5.74l-7.82-6.04c-2.19 1.48-5 2.37-7.94 2.37-6.13 0-11.22-4.1-13.08-9.65l-8.42 7.06c3.91 6.21 11.14 10 19.5 10z"/>
        </g>
      </svg>
      {text}
    </button>
  );
}

// --- Login ---
export function Login({ switchToSignup, goToForget }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agree) {
      alert("You must agree to the terms of service.");
      return;
    }
    setIsLoading(true);
    // Treat identifier as email for Firebase Email/Password login
    signInWithEmailAndPassword(auth, identifier, password)
      .then((cred) => {
        const uid = cred.user?.uid;
        if (uid) {
          localStorage.setItem('uid', uid);
          window.location.href = `/dashboard?uid=${uid}`;
        } else {
          alert('Logged in, but user UID not found.');
        }
      })
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => setIsLoading(false));
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const uid = result.user?.uid;
      if (uid) {
        localStorage.setItem('uid', uid);
        window.location.href = `/dashboard?uid=${uid}`;
      }
    } catch (err) {
      if (err?.code === 'auth/unauthorized-domain') {
        alert('Unauthorized domain for Google sign-in. Please add this domain to Firebase Authentication > Settings > Authorized domains. If you are testing over LAN, add your IP (e.g., 192.168.x.x) and any tunnel domain (e.g., your-subdomain.ngrok-free.app).');
      } else if (err?.code === 'auth/popup-blocked') {
        alert('Popup blocked by the browser. Please allow popups for this site or try again.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        alert('Popup closed before completing sign-in. Please try again.');
      } else {
        alert(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={formHeadingStyle}>Login</div>
      <div style={subtitleStyle}>Sign in to Skillignite and start improving your skills.</div>
      <GoogleButton
        text="Sign in with Google"
        onClick={handleGoogleLogin}
      />
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder="E-mail"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />
        <div style={checkboxRowStyle}>
          <input
            type="checkbox"
            checked={agree}
            onChange={e => setAgree(e.target.checked)}
            style={checkboxStyle}
            id="loginAgree"
          />
          <label style={labelSmallStyle} htmlFor="loginAgree">I agree to the terms of service</label>
        </div>
        <button type="submit" style={primaryBtnStyle} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div style={{ textAlign: "right", marginTop: 8 }}>
        <span style={linkStyle} onClick={goToForget}>Forgot password?</span>
      </div>
      <div style={mutedTextStyle}>
        New to Skillignite?
        <span style={linkStyle} onClick={switchToSignup}>Sign up</span>
      </div>
    </>
  );
}

// --- Signup ---
export function Signup({ switchToLogin }) {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agree) {
      alert("You must agree to the terms of service.");
      return;
    }
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, identifier, password)
      .then(async ({ user }) => {
        if (name) {
          await updateProfile(user, { displayName: name });
        }
        const uid = user?.uid;
        if (uid) {
          localStorage.setItem('uid', uid);
          // Redirect new users to the onboarding question page (ques1)
          window.location.href = `/ques1?uid=${uid}`;
        } else {
          alert('Signup successful, but user UID not found.');
        }
      })
      .catch((err) => alert(err.message))
      .finally(() => setIsLoading(false));
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const uid = result.user?.uid;
      if (uid) {
        localStorage.setItem('uid', uid);
        // Redirect new users who signed up via Google to ques1
        window.location.href = `/ques1?uid=${uid}`;
      }
    } catch (err) {
      if (err?.code === 'auth/unauthorized-domain') {
        alert('Unauthorized domain for Google sign-in. Add this domain in Firebase Authentication > Settings > Authorized domains. Include localhost, 127.0.0.1, your LAN IP, and any tunnel domain you use.');
      } else if (err?.code === 'auth/popup-blocked') {
        alert('Popup blocked by the browser. Please allow popups for this site or try again.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        alert('Popup closed before completing sign-in. Please try again.');
      } else {
        alert(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={formHeadingStyle}>Sign up</div>
      <div style={subtitleStyle}>Register and start learning new skills today!</div>
      <GoogleButton
        text="Sign up with Google"
        onClick={handleGoogleSignUp}
      />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          required
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          type="email"
          required
          placeholder="E-mail"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />
        <div style={checkboxRowStyle}>
          <input
            type="checkbox"
            checked={agree}
            onChange={e => setAgree(e.target.checked)}
            style={checkboxStyle}
            id="signupAgree"
          />
          <label style={labelSmallStyle} htmlFor="signupAgree">I agree to the terms of service</label>
        </div>
        <button type="submit" style={primaryBtnStyle} disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <div style={mutedTextStyle}>
        Already a member?
        <span style={linkStyle} onClick={switchToLogin}>Sign in</span>
      </div>
    </>
  );
}

// --- Forget Password Page ---
export function ForgetPasswordPage({ goToLogin }) {
  const [input, setInput] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input) return alert("Enter your e-mail.");
    // Firebase password reset email
    sendPasswordResetEmail(auth, input)
      .then(() => setSent(true))
      .catch((err) => alert(err.message));
  };

  return (
    <>
      <div style={formHeadingStyle}>Forgot password?</div>
      <div style={subtitleStyle}>
  Enter your e-mail to receive reset instructions.
      </div>
      {sent ? (
        <>
          <div style={{
            margin: "35px 0 35px 0",
            background: "#E7F6D5",
            borderRadius: 10,
            textAlign: "center",
            color: "#43762b",
            padding: 24,
            fontSize: 16,
            fontWeight: 500,
          }}>
            If an account exists for <b>{input}</b>, a reset link has been sent.
          </div>
          <button style={primaryBtnStyle} onClick={goToLogin}>
            Back to Login
          </button>
        </>
      ) : (
        <form onSubmit={handleSend}>
          <input
            style={inputStyle}
            type="email"
            placeholder="E-mail"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button style={primaryBtnStyle}>
            Send reset link
          </button>
        </form>
      )}
      {!sent && (
        <div style={{ marginTop: 18, textAlign: "right" }}>
          <span style={linkStyle} onClick={goToLogin}>Back to Login</span>
        </div>
      )}
    </>
  );
}

// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState('login'); // 'login', 'signup', 'forget'
  const handleGoogleSignIn = () => {};
  const handleGoogleSignUp = () => {};

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Left: Illustration and brand */}
        <div style={leftStyle}>
          <SkillsIllustration />
          <div style={textLeftStyle}>Boost Your Learning<br />with Skillignite!</div>
        </div>
        {/* Right: Form/Page */}
        <div style={rightStyle}>
          <div style={switchBtnRowStyle}>
            <button
              onClick={() => setPage('login')}
              style={switchBtnStyle(page === 'login', page === 'forget')}
              disabled={page === 'forget'}
            >
              Login
            </button>
            <button
              onClick={() => setPage('signup')}
              style={switchBtnStyle(page === 'signup', page === 'forget')}
              disabled={page === 'forget'}
            >
              Sign Up
            </button>
          </div>
          {page === 'login' ? (
            <Login
              switchToSignup={() => setPage('signup')}
              goToForget={() => setPage('forget')}
              onGoogleSignIn={handleGoogleSignIn}
            />
          ) : page === 'signup' ? (
            <Signup
              switchToLogin={() => setPage('login')}
              onGoogleSignUp={handleGoogleSignUp}
            />
          ) : (
            <ForgetPasswordPage
              goToLogin={() => setPage('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
}