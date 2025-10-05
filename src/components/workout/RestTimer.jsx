import React, {useState, useEffect, useRef} from 'react';

const RestTimer = ({isVisible, onStart, onClose}) => {
  const [timeLeft, setTimeLeft] = useState (0);
  const [isCounting, setIsCounting] = useState (false);
  const audioRef = useRef (null);

  // Use a ref to hold a stable reference to the onClose callback
  const onCloseRef = useRef (onClose);
  useEffect (
    () => {
      onCloseRef.current = onClose;
    },
    [onClose]
  );

  // Preload the audio file
  useEffect (() => {
    audioRef.current = new Audio ('/timer-complete.mp3');
  }, []);

  // Corrected countdown logic using a robust interval pattern
  useEffect (
    () => {
      if (!isCounting) {
        return;
      }

      const interval = setInterval (() => {
        setTimeLeft (prev => {
          if (prev <= 1) {
            clearInterval (interval);
            setIsCounting (false);
            if (audioRef.current) {
              audioRef.current.play ();
            }
            onCloseRef.current (); // Call the latest version of onClose
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup function
      return () => clearInterval (interval);
    },
    [isCounting]
  ); // Effect now correctly depends only on isCounting

  const handleStartTimer = duration => {
    setTimeLeft (duration);
    setIsCounting (true);
    onStart (duration);
  };

  const handleStopTimer = () => {
    setIsCounting (false); // This will trigger the useEffect cleanup
    onClose ();
  };

  const formatTime = seconds => {
    const minutes = Math.floor (seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString ().padStart (2, '0')}`;
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-gray-900/90 p-4 shadow-lg backdrop-blur-sm">
      {!isCounting
        ? <div className="flex w-full max-w-md items-center justify-between">
            <span className="text-lg font-bold text-white">Start Rest:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleStartTimer (60)}
                className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white transition-transform hover:scale-105"
              >
                1:00
              </button>
              <button
                onClick={() => handleStartTimer (120)}
                className="rounded-lg bg-yellow-500 px-4 py-2 font-bold text-white transition-transform hover:scale-105"
              >
                2:00
              </button>
              <button
                onClick={() => handleStartTimer (180)}
                className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition-transform hover:scale-105"
              >
                3:00
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-2xl text-gray-400 hover:text-white"
            >
              &times;
            </button>
          </div>
        : <div className="flex w-full max-w-md items-center justify-between">
            <span className="text-lg font-bold text-white">Resting...</span>
            <span className="font-mono text-4xl text-cyan-400">
              {formatTime (timeLeft)}
            </span>
            <button
              onClick={handleStopTimer}
              className="rounded-lg bg-gray-600 px-4 py-2 font-bold text-white transition-colors hover:bg-gray-500"
            >
              Skip
            </button>
          </div>}
    </div>
  );
};

export default RestTimer;
