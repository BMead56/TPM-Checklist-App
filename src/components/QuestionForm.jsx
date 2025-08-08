import React, { useEffect, useRef, useState } from 'react';
import { fetchQuestions, fetchNameByBadge } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = import.meta.env.VITE_LOCAL_HOST;

function QuestionForm({ plantId, lineId, onSubmit }) {
  const [name, setName] = useState('');
  const [badge, setBadge] = useState('');
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});

  const [activeCameraQID, setActiveCameraQID] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Load questions
  useEffect(() => {
    if (!lineId) return;

    fetchQuestions(lineId).then((data) => {
      const initial = {};
      data.forEach((q) => {
        initial[q.QID] = { checked: false, photoTaken: false, imageFile: null, previewUrl: null };
      });
      setQuestions(data);
      setResponses(initial);
    });
  }, [lineId]);

  // Auto fetch name by badge
  useEffect(() => {
    if (badge.length >= 5) {
      fetchNameByBadge(badge)
        .then((data) => setName(data?.name || ''))
        .catch(() => setName(''));
    } else {
      setName('');
    }
  }, [badge]);

  // Start camera
  const startCamera = async (qid) => {
    stopCamera(); // Close any existing
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setActiveCameraQID(qid);
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Camera access denied or unavailable.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;
    setActiveCameraQID(null);
  };

  // Capture photo
  const handleCapture = (qid) => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg'); // base64 string

    setResponses((prev) => ({
      ...prev,
      [qid]: {
        ...prev[qid],
        photoTaken: true,
        photoConfirmed: false,
        imageData,
        previewUrl: imageData,
      },
    }));

    stopCamera();
  };


  const handleRetake = (qid) => {
    setResponses((prev) => ({
      ...prev,
      [qid]: {
        ...prev[qid],
        photoTaken: false,
        photoConfirmed: false,
        imageFile: null,
        previewUrl: null,
      },
    }));
    startCamera(qid);
  };

  const handleResponseChange = (qid, checked) => {
    setResponses((prev) => ({
      ...prev,
      [qid]: {
        ...prev[qid],
        checked,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to submit?')) return;
    const respID = uuidv4();

    try {
      const formattedResponses = Object.entries(responses).map(([qid, data]) => ({
        respID,
        plantId,
        lineId,
        qid,
        name,
        badge,
        timestamp: new Date().toISOString(),
        response: data.checked,
        imageData: data.imageData || null, // include imageData if present
      }));

      await fetch(`${BASE_URL}/api/tpm/submitResponses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedResponses),
      });

      alert('Checklist submitted successfully!');
      onSubmit();
    } catch (err) {
      console.error('Error submitting responses:', err);
      alert('Submission failed.');
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (activeCameraQID && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play();
    }
  }, [activeCameraQID]);

  const allPhotosConfirmed = questions.every(q =>
    !responses[q.QID]?.checked ||
    !(q.ReqImg === true || q.ReqImg === 1 || q.ReqImg === '1') ||
    responses[q.QID]?.photoConfirmed
  );

  const handleUsePhoto = (qid) => {
    setResponses((prev) => ({
      ...prev,
      [qid]: {
        ...prev[qid],
        photoConfirmed: true,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 bg-white p-6 rounded-xl shadow">
      <h3 className="text-xl font-semibold">Checklist Questions</h3>

      <div>
        <label className="block mb-1">Name:</label>
        <input
          type="text"
          value={name}
          readOnly
          className="w-full px-3 py-2 border rounded bg-gray-100"
        />
      </div>

      <div>
        <label className="block mb-1">Badge Number:</label>
        <input
          type="text"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {questions.map((q) => (
        <div key={q.QID} className="border p-4 rounded space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={responses[q.QID]?.checked || false}
              onChange={(e) => handleResponseChange(q.QID, e.target.checked)}
            />
            {q.Question}
          </label>

          {/* Photo Required */}
          {responses[q.QID]?.checked &&
            (q.ReqImg === true || q.ReqImg === 1 || q.ReqImg === '1') && (
              <>
                {!responses[q.QID].photoTaken && activeCameraQID !== q.QID && (
                  <button
                    type="button"
                    onClick={() => startCamera(q.QID)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Start Camera
                  </button>
                )}

                {activeCameraQID === q.QID && (
                  <div className="mt-2">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full max-w-sm border rounded" />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleCapture(q.QID)}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Capture
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {responses[q.QID].photoTaken && responses[q.QID].previewUrl && !responses[q.QID].photoConfirmed && (
                  <div className="mt-2">
                    <img
                      src={responses[q.QID].previewUrl}
                      alt="Preview"
                      className="w-full max-w-sm border rounded"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleUsePhoto(q.QID)}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Use Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRetake(q.QID)}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Retake
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
        disabled={!allPhotosConfirmed}
      >
        Submit
      </button>
    </form>
  );
}

export default QuestionForm;
