import { useEffect, useRef, useState } from 'react';

export const useHandTracking = () => {
  const videoRef = useRef(null);
  const [handData, setHandData] = useState({ x: 0, y: 0, isFiring: false, detected: false });

  useEffect(() => {
    let cameraInstance = null;
    let handsInstance = null;

    const initializeTracking = async () => {
      // 1. Dynamic import or check for loaded script windows
      if (!window.Hands || !window.Camera) {
        // Fallback to manual script insertion if local node resolution fails
        await new Promise((resolve) => {
          const script1 = document.createElement('script');
          script1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
          const script2 = document.createElement('script');
          script2.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
          
          document.head.appendChild(script1);
          document.head.appendChild(script2);
          
          script2.onload = () => resolve();
        });
      }

      if (!videoRef.current) return;

      handsInstance = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      handsInstance.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      handsInstance.onResults((results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          const palm = landmarks[9];
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];

          const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) +
            Math.pow(thumbTip.y - indexTip.y, 2)
          );

          const isFiring = distance < 0.06;
          const normalizedX = -(palm.x * 2 - 1);
          const normalizedY = -(palm.y * 2 - 1);

          setHandData({ x: normalizedX, y: normalizedY, isFiring, detected: true });
        } else {
          setHandData((prev) => ({ ...prev, detected: false }));
        }
      });

      cameraInstance = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await handsInstance.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      cameraInstance.start().catch((err) => console.log("Camera access delayed/denied:", err));
    };

    initializeTracking();

    return () => {
      if (cameraInstance) cameraInstance.stop();
      if (handsInstance) handsInstance.close();
    };
  }, []);

  return { videoRef, handData };
};