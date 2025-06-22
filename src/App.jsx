import React, { useState } from 'react';
import ChecklistForm from './components/ChecklistForm.jsx';
import QuestionForm from './components/QuestionForm.jsx';
import './index.css';

function App() {
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [resetKey, setResetKey] = useState(0); // 🔁 used to reset the form

  const handleChecklistSubmit = (responses) => {
    console.log('Submitted responses:', responses);
    setSelectedLineId(null);       // reset questions
    setResetKey(prev => prev + 1); // ChecklistForm reset
  };

  return (
    <div className="app-container">
      <h1>TPM Checklist</h1>

      <ChecklistForm
        key={resetKey} // reset dropdowns
        onLineSelected={setSelectedLineId}
        onPlantSelected={setSelectedPlant}
      />

      {selectedLineId && (
        <QuestionForm
          lineId={selectedLineId}
          plant={selectedPlant}
          onSubmit={handleChecklistSubmit}
        />
      )}
    </div>
  );
}

export default App;
