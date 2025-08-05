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
    if (!window.confirm('Are you sure you want to submit?')) return;

    const formattedResponses = Object.entries(responses).map(([qid, data]) => ({
      lineId,
      qid,
      name,
      timestamp: new Date().toISOString(),
      response: data.checked,
      imagePath: data.imagePath || null,
    }));

    fetch('http://localhost:3000/submitResponses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedResponses),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to submit');
        return res.json();
      })
      .then(() => {
        alert('Checklist submitted successfully!');
        onSubmit(formattedResponses);
      })
      .catch((err) => {
        console.error('Submission error:', err);
        alert('There was a problem submitting the checklist.');
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

useEffect(() => {
  if (badge.length >= 5) {
    fetch(`http://localhost:3000/getNameByBadge/${badge}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch name');
        }
        return res.json();
      })
      .then(data => {
        if (data?.name) {
          setName(data.name);
        } else {
          setName('');
        }
      })
      .catch((err) => {
        console.error('Error fetching name:', err);
        setName('');
      });
  } else {
    setName('');
  }
}, [badge]);

  

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md max-w-3xl mx-auto space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Checklist Questions</h3>

      {/* Name Field */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Name:</label>
        <input
          type="text"
          value={name}
          readOnly
          className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* Badge Field */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Badge Number:</label>
        <input
          type="text"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Checklist Questions */}
      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.QID} className="border p-4 rounded-lg">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={responses[q.QID]?.checked || false}
                onChange={(e) => handleResponseChange(q.QID, e.target.checked)}
                className="h-5 w-5"
              />
              <span className="text-gray-800">{q.Question}</span>
            </label>

            {(responses[q.QID]?.checked &&
              (q.ReqImg === true || q.ReqImg === 1 || q.ReqImg === '1')) && (
              <div className="mt-2 flex gap-3">
                {!cameraActive && !photoTaken && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Start Camera
                  </button>
                )}
                {cameraActive && !photoTaken && (
                  <button
                    type="button"
                    onClick={() => handlePhotoCapture(q.QID)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Capture Photo
                  </button>
                )}
                {photoTaken && (
                  <button
                    type="button"
                    onClick={handleRetakePhoto}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Retake Photo
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Video Preview */}
      {cameraActive && (
        <div className="mt-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-md rounded-lg border"
          />
        </div>
      )}

      {/* Submit */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </div>
    </form>
  );
}

export default QuestionForm;
