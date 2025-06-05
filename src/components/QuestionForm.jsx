import React, { useEffect, useRef, useState } from 'react';
import { fetchQuestions } from '../services/api';

function QuestionForm({ lineId, onSubmit }) {
  const [name, setName] = useState('');
  const [badge, setBadge] = useState('');
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);

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

    const confirmed = window.confirm("Are you sure you want to submit?");
    if (!confirmed) return;

    const fullSubmission = {
      name,
      badge,
      responses,
    };

    onSubmit(fullSubmission);
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
              checked={responses[q.QID] || false}
              onChange={(e) => handleResponseChange(q.QID, e.target.checked)}
            />
            {q.Question}
          </label>

          {q.ImgRequired && (
            <div className="camera-controls">
              {!cameraActive && !photoTaken && (
                <button type="button" onClick={startCamera}>Start Camera</button>
              )}
              {cameraActive && !photoTaken && (
                <button type="button" onClick={handlePhotoCapture(q.QID)}>Capture Photo</button>
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
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}

export default QuestionForm;
