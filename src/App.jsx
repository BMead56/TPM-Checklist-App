import React, { useState } from 'react';
import ChecklistForm from './components/ChecklistForm.jsx';
import QuestionForm from './components/QuestionForm.jsx';
import './index.css';

function App() {
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [resetKey, setResetKey] = useState(0); // 🔁 used to reset the form

  const handleChecklistSubmit = (responses) => {
    const confirmed = window.confirm('Are you sure you want to submit?');
    if (!confirmed) return;
    console.log('Submitted responses:', responses);
    alert('Checklist submitted successfully!');
    setSelectedLineId(null);       // reset questions
    setResetKey(prev => prev + 1); // ChecklistForm reset
  };

  return (
    <div className="app-container">
      <h1>TPM Checklist</h1>

      <ChecklistForm
        key={resetKey} // reset dropdowns
        onLineSelected={setSelectedLineId}
      />

      {selectedLineId && (
        <QuestionForm
          lineId={selectedLineId}
          onSubmit={handleChecklistSubmit}
        />
      )}
    </div>
  );
}

export default App;
