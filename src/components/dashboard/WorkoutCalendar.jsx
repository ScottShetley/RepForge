import React from 'react';
import Calendar from 'react-calendar';

const WorkoutCalendar = ({workouts, onDateClick, heatmapDates}) => {
  const workoutDateSet = new Set (heatmapDates);

  const tileClassName = ({date, view}) => {
    // Only apply class in month view
    if (view === 'month' && workoutDateSet.has (date.toDateString ())) {
      return 'workout-day';
    }
    return null;
  };

  const handleDateClick = date => {
    const dateString = date.toDateString ();
    // Find the latest workout for a given date if multiple exist
    const workoutsForDate = workouts.filter (
      w => new Date (w.createdAt.seconds * 1000).toDateString () === dateString
    );
    if (workoutsForDate.length > 0) {
      // Assuming the most recent workout is the one to show, which should be first in the sorted list
      onDateClick (workoutsForDate[0]);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-8">
      <Calendar
        onClickDay={handleDateClick}
        tileClassName={tileClassName}
        className="react-calendar"
      />
    </div>
  );
};

export default WorkoutCalendar;
