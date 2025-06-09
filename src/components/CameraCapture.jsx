// CameraCapture by QID built in to QuestionForm.jsx logic

// import React, { useRef } from 'react';

// const CameraCapture = ({ onCapture }) => {
//   const videoRef = useRef();
//   const canvasRef = useRef();

//   const startCamera = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     videoRef.current.srcObject = stream;
//   };

//   const takePhoto = () => {
//     const ctx = canvasRef.current.getContext('2d');
//     ctx.drawImage(videoRef.current, 0, 0, 320, 240);
//     canvasRef.current.toBlob(blob => {
//       const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
//       onCapture(file);
//     });
//   };

//   return (
//     <div className="camera-controls">
//       <button>Take Photo</button>
//       <button>Retake</button>
//       <video ref={videoRef} autoPlay width="320" height="240" />
//       <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />
//       <button onClick={startCamera}>Start Camera</button>
//       <button onClick={takePhoto}>Capture Photo</button>
//     </div>
//   );
// };

// export default CameraCapture;
