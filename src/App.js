import React from 'react';
import './App.css';
import Home from './components/pages/Home';
import Compiler from './components/pages/Compiler';
import Dashboard from './components/pages/dashboard';
import Compete from './components/pages/Compete';
import Projects from './components/pages/Projects';
import ProjectIDE from './components/pages/ProjectIDE';
import Ques1 from './components/pages/que1';
import Ques2 from './components/pages/que2';
import Ques3 from './components/pages/que3';
import Ques4 from './components/pages/que4';
import SettingsPage from './components/pages/settings';

function App() {
  const path = window.location.pathname;
  if (path.startsWith('/ide')) return <Compiler />;
  if (path.startsWith('/ques1')) return <Ques1 />;
  if (path.startsWith('/ques2')) return <Ques2 />;
  if (path.startsWith('/ques3')) return <Ques3 />;
  if (path.startsWith('/ques4')) return <Ques4 />;
  if (path.startsWith('/settings')) return <SettingsPage />;
  if (path.startsWith('/dashboard')) return <Dashboard />;
  if (path.startsWith('/projects/') && path.split('/projects/')[1]) return <ProjectIDE />;
  if (path.startsWith('/projects')) return <Projects />;
  if (path.startsWith('/compete')) {
    // Try to get username from localStorage (set in dashboard)
    const username = localStorage.getItem('username') || '';
    return <Compete username={username} />;
  }
  return <Home />;
}

export default App;
