import React, { useState } from 'react';
import ChecklistForm from './components/ChecklistForm.jsx';
import QuestionForm from './components/QuestionForm.jsx';
import './index.css';
import Logo from './assets/AFL.png';

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
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src={Logo}
          alt="Company Logo"
          style={{ height: '1.5em', verticalAlign: 'middle', marginRight: 0 }}
        />
        TPM Checklist
      </h1>

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
