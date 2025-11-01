import React from 'react';

export default function QuestionPanel({ aiText = '' }) {
  return (
    <div className="question-panel">
      <h3>Question</h3>
      <div className="question-box">{aiText || 'The interviewer will speak and show questions here.'}</div>
      <div className="ai-status">AI: {aiText ? 'Speaking' : 'Ready'}</div>
    </div>
  );
}
