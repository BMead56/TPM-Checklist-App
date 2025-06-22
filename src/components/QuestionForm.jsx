import React, { useEffect, useRef, useState } from 'react';
import { fetchQuestions } from '../services/api';

function QuestionForm({ lineId, plant, onSubmit }) {
  const [name, setName] = useState('');
  const [badge, setBadge] = useState('');
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!lineId) return;

    fetchQuestions(lineId).then((data) => {
      const initialResponses = {};
      data.forEach((q) => {
        initialResponses[q.QID] = { 
          checked: false,
          photoTaken: false,
        };
      });

      setQuestions(data);
      setResponses(initialResponses);
    });
  }, [lineId]);

  const handleResponseChange = (questionId, checked) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        checked,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    const confirmed = window.confirm('Are you sure you want to submit?');
    if (!confirmed) return;
    
    setIsSubmitting(true); // Disable further submissions

    const formattedResponses = Object.entries(responses).map(([qid, data]) => ({
      plant: plant,
      line: lineId,
      name: name,
      badge: badge,
      qid: qid,
      response: data.checked,
      timestamp: new Date().toISOString(),
      imagePath: data.imagePath || null
    }));
    
    fetch('http://localhost:3000/submitResponses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedResponses)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to submit');
        return res.json();
      })
      .then(() => {
        alert('Checklist submitted successfully!');
        onSubmit(formattedResponses); // keep your existing logic clean
      })
      .catch(err => {
        console.error('Submission error:', err);
        alert('There was a problem submitting the checklist.');
      })
      .finally(() => {
        setIsSubmitting(false); // re-enable submisstion
      });
    
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error('Camera access failed:', err);
      alert('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
    setPhotoTaken(false);
  };

  const handlePhotoCapture = (questionId) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        photoTaken: true,
      },
    }));
    stopCamera();
  };

  const handleRetakePhoto = () => {
    setPhotoTaken(false);
    startCamera();
  };

  useEffect(() => {
    return () => stopCamera(); // cleanup
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <h3>Checklist Questions</h3>

      {/* Name Field */}
      <div className="form-question">
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
      </div>

      {/* Badge Field */}
      <div className="form-question">
        <label>
          Badge Number:
          <input
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            required
          />
        </label>
      </div>

      {/* Checklist Questions */}
      {questions.map((q) => (
        <div key={q.QID} className="form-question">
          <label>
            <input
              type="checkbox"
              checked={responses[q.QID]?.checked || false}
              onChange={(e) => handleResponseChange(q.QID, e.target.checked)}
            />
            {q.Question}
          </label>

          {(responses[q.QID]?.checked && (q.ReqImg === true || q.ReqImg === 1 || q.ReqImg === "1")) && (
            <div className="camera-controls">
              {!cameraActive && !photoTaken && (
                <button type="button" onClick={startCamera}>Start Camera</button>
              )}
              {cameraActive && !photoTaken && (
                <button type="button" onClick={() => handlePhotoCapture(q.QID)}>Capture Photo</button>
              )}
              {photoTaken && (
                <button type="button" onClick={handleRetakePhoto}>Retake Photo</button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Live Video Preview */}
      {cameraActive && (
        <div style={{ marginTop: '1rem' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>
      )}

      {/* Submit */}
      <div className="form-buttons">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {isSubmitting && (
        <div className="loading-indicator">
          <span className="spinner" /> Submitting your responses...
        </div>
      )}
    </form>
  );
}

export default QuestionForm;
