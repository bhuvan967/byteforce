import React from 'react';

export default function Controls({ onExit }) {
  return (
    <div className="interview-controls">
      <button className="ctrl-btn">Toggle Mic</button>
      <button className="ctrl-btn">Toggle Camera</button>
      <button className="ctrl-btn exit" onClick={onExit}>Exit Interview</button>
    </div>
  );
}
