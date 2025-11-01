import React from 'react';

export default function Transcript({ lines = [] }) {
  return (
    <div className="transcript">
      <h4>Transcript</h4>
      <div className="transcript-body">
        {lines.length === 0 ? <i>(Live transcript will appear here)</i> : (
          <div className="transcript-list">
            {lines.map((l, i) => <div key={i} className="transcript-line">{l}</div>)}
          </div>
        )}
      </div>
      <div className="transcript-actions">
        <button>Save</button>
        <button>Export</button>
      </div>
    </div>
  );
}
