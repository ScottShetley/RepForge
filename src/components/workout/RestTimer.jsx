import React, {useState, useEffect, useRef} from 'react';

const RestTimer = ({isVisible, onStart, onClose}) => {
  const [timeLeft, setTimeLeft] = useState (0);
  const [isCounting, setIsCounting] = useState (false);
  const intervalRef = useRef (null);
  const audioRef = useRef (null);

  // Preload the audio file
  useEffect (() => {
    audioRef.current = new Audio ('/timer-complete.mp3');
  }, []);

  // Countdown logic
  useEffect (
    () => {
      if (isCounting && timeLeft > 0) {
        intervalRef.current = setInterval (() => {
          setTimeLeft (prev => prev - 1);
        }, 1000);
      } else if (timeLeft === 0 && isCounting) {
        setIsCounting (false);
        if (audioRef.current) {
          audioRef.current.play ();
        }
        onClose (); // Close the timer UI when done
      }
      return () => clearInterval (intervalRef.current);
    },
    [isCounting, timeLeft, onClose]
  );

  const handleStartTimer = duration => {
    clearInterval (intervalRef.current);
    setTimeLeft (duration);
    setIsCounting (true);
    onStart (duration); // Notify parent that timer has started
  };

  const handleStopTimer = () => {
    clearInterval (intervalRef.current);
    setIsCounting (false);
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
                onClick={() => handleStartTimer (90)}
                className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white transition-transform hover:scale-105"
              >
                1:30
              </button>
              <button
                onClick={() => handleStartTimer (180)}
                className="rounded-lg bg-yellow-500 px-4 py-2 font-bold text-white transition-transform hover:scale-105"
              >
                3:00
              </button>
              <button
                onClick={() => handleStartTimer (300)}
                className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition-transform hover:scale-105"
              >
                5:00
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
