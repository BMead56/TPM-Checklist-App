import React, { useState } from 'react';
import ChecklistForm from './components/ChecklistForm.jsx';
import QuestionForm from './components/QuestionForm.jsx';
import Logo from './assets/AFL.png';

function App() {
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const handleChecklistSubmit = (responses) => {
    console.log('Submitted responses:', responses);
    setSelectedLineId(null);
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex justify-center items-start p-8 bg-[#bbbdc4] text-[#333] font-sans">
      <div className="w-full max-w-[800px] p-8 bg-[#f9f4f4f1] rounded-lg shadow-lg animate-fadeIn space-y-8">
        <h1 className="flex items-center gap-3 text-left text-[2.5rem] mb-6 font-bold">
          <img
            src={Logo}
            alt="Company Logo"
            className="h-8 align-middle mr-0"
            style={{ height: '1.5em', verticalAlign: 'middle', marginRight: 0 }}
          />
          TPM Checklist
        </h1>

        <ChecklistForm
          key={resetKey}
          onLineSelected={setSelectedLineId}
          onPlantSelected={setSelectedPlant}
        />

        {selectedLineId && (
          <QuestionForm
            lineId={selectedLineId}
            plantId={selectedPlant}
            onSubmit={handleChecklistSubmit}
          />
        )}
      </div>
    </div>
  );
}

export default App;
