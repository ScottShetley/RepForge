import React, {useState, useEffect, useRef} from 'react';

const REST_DURATIONS = {
  easy: 90,
  challenging: 180,
  failed: 300,
};

const RestTimer = ({onTimerComplete}) => {
  const [timeLeft, setTimeLeft] = useState (null);
  const [timerActive, setTimerActive] = useState (false);
  const intervalRef = useRef (null);
  const audioRef = useRef (null);

  useEffect (() => {
    // Preload the audio file
    audioRef.current = new Audio ('/timer-complete.mp3');
  }, []);

  useEffect (
    () => {
      if (timerActive && timeLeft > 0) {
        intervalRef.current = setInterval (() => {
          setTimeLeft (prev => prev - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        setTimerActive (false);
        if (audioRef.current) {
          audioRef.current.play ();
        }
        onTimerComplete (); // Notify parent that timer is done
      }
      return () => clearInterval (intervalRef.current);
    },
    [timerActive, timeLeft, onTimerComplete]
  );

  const startTimer = difficulty => {
    clearInterval (intervalRef.current);
    const duration = REST_DURATIONS[difficulty];
    setTimeLeft (duration);
    setTimerActive (true);
  };

  const formatTime = seconds => {
    const minutes = Math.floor (seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString ().padStart (2, '0')}`;
  };

  if (timerActive) {
    return (
      <div className="flex-1 text-center font-mono text-xl text-cyan-400">
        {formatTime (timeLeft)}
      </div>
    );
  }

  return (
    <div className="flex-1 flex justify-center items-center space-x-2">
      <button
        onClick={() => startTimer ('easy')}
        className="text-xs font-semibold bg-green-600 hover:bg-green-500 rounded px-2 py-1"
      >
        1:30
      </button>
      <button
        onClick={() => startTimer ('challenging')}
        className="text-xs font-semibold bg-yellow-600 hover:bg-yellow-500 rounded px-2 py-1"
      >
        3:00
      </button>
      <button
        onClick={() => startTimer ('failed')}
        className="text-xs font-semibold bg-red-600 hover:bg-red-500 rounded px-2 py-1"
      >
        5:00
      </button>
    </div>
  );
};

export default RestTimer;
