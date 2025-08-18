import React from 'react';
import Calendar from 'react-calendar';

const WorkoutCalendar = ({workouts, onDateClick}) => {
  const workoutDates = workouts.map (workout => {
    return new Date (workout.createdAt.seconds * 1000).toDateString ();
  });

  const tileClassName = ({date, view}) => {
    if (view === 'month' && workoutDates.includes (date.toDateString ())) {
      return 'workout-day';
    }
    return null;
  };

  const handleDateClick = date => {
    const dateString = date.toDateString ();
    const workoutForDate = workouts.find (
      w => new Date (w.createdAt.seconds * 1000).toDateString () === dateString
    );
    if (workoutForDate) {
      onDateClick (workoutForDate);
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md mb-8">
      <Calendar
        onClickDay={handleDateClick}
        tileClassName={tileClassName}
        className="react-calendar"
      />
    </div>
  );
};

export default WorkoutCalendar;
