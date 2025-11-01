import React, { useEffect, useRef } from 'react';

export default function VideoGrid({ onSnapshot }) {
  const videoRef = useRef(null);

  useEffect(() => {
    let stream;
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        console.warn('Camera/mic not available', e);
      }
    }
    start();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext('2d');
    // mirror-correct the snapshot so it matches the displayed (unmirrored) video
    // drawImage uses the raw video pixels; flip horizontally so snapshot aligns with UI
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    const data = canvas.toDataURL('image/png');
    if (onSnapshot) onSnapshot(data);
  };

  return (
    <div className="video-grid">
      <div className="video-large">
        <video ref={videoRef} autoPlay playsInline muted style={{width:'100%',height:'100%',borderRadius:8,transform:'scaleX(-1)'}} />
        <button style={{position:'absolute',right:20,top:20}} onClick={handleSnapshot}>Snapshot</button>
      </div>
      <div className="video-small">Interviewer (AI)</div>
    </div>
  );
}
