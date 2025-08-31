import React from 'react';
import MainLayout from '../components/layout/MainLayout';

const Instructions = () => {
  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="mx-auto max-w-4xl rounded-lg bg-gray-700 p-6 shadow-lg">
          <h1 className="mb-6 border-b border-gray-600 pb-4 text-3xl font-bold text-white">
            How to Use RepForge
          </h1>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Starting a Workout
              </h2>
              <p>
                From the Dashboard, click '+ New Workout' to go to the Workout Selection screen. Here you can choose between a RepForge Workout (A or B) or Circuit Training.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                RepForge Workouts: Progression, Failures &amp; Deloads
              </h2>
              <p className="mb-2">
                The app automates the progression rules for the main RepForge workouts (A & B):
              </p>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>
                  <strong>Progression:</strong>
                  {' '}
                  If you successfully complete all sets for a core lift, the weight will automatically increase for your next session.
                </li>
                <li>
                  <strong>Failure:</strong>
                  {' '}
                  If you fail to complete all sets, the weight for that exercise will remain the same for your next attempt.
                </li>
                <li>
                  <strong>Deload:</strong>
                  {' '}
                  If you fail the same weight three times in a row, the app will deload the weight by 10% (this can be changed in Settings).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                RepForge Workouts: In-Workout Controls
              </h2>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>
                  <strong>Adjust Weight:</strong>
                  {' '}
                  Click the "Adjust" button to make a one-time weight adjustment for the current session.
                </li>
                <li>
                  <strong>Swap Exercise:</strong>
                  {' '}
                  Use the "Swap" button to substitute an exercise with another from the library.
                </li>
                <li>
                  <strong>Plate Calculator:</strong>
                  {' '}
                  Click the "Calc" button to help you determine which plates to load on the barbell.
                </li>
                <li>
                  <strong>Rest Timer:</strong>
                  {' '}
                  After you log a completed set, a rest timer will appear. You can select your desired rest period to stay on track.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Circuit Training
              </h2>
              <p className="mb-2">
                The Circuit Tracker is designed for a fast-paced, machine-based workout. The goal is to complete all exercises as a circuit, moving from one to the next with minimal rest.
              </p>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>
                  <strong>The 30-Minute Goal:</strong>
                  {' '}
                  Aim to complete the entire circuit in under 30 minutes. If you succeed, you'll earn a trophy badge on your dashboard!
                </li>
                <li>
                  <strong>How to Track:</strong>
                  {' '}
                  Click "Start Workout" to begin the session timer. For each exercise, enter the weight you used and click the success toggle to confirm you completed all 3 sets of 12 reps.
                </li>
                <li>
                  <strong>Progression is Manual:</strong>
                  {' '}
                  If you successfully complete the circuit, you should challenge yourself by manually increasing the weight on some exercises in your next session.
                </li>
                <li>
                  <strong>Saving:</strong>
                  {' '}
                  Click "Finish Workout" at any time to stop the timer and save your progress to your history.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Exploring Your Dashboard
              </h2>
              <p>
                Your dashboard is your mission control. The
                {' '}
                <strong>Strength Progression</strong>
                {' '}
                charts visualize your gains on core lifts over time, while the new
                {' '}
                <strong>Circuit Duration</strong>
                {' '}
                chart tracks your speed. You can also click any highlighted day on the
                {' '}
                <strong>Workout Calendar</strong>
                {' '}
                to view a summary of that session.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Customizing Your Settings
              </h2>
              <p>
                Navigate to the Settings page to adjust the default
                {' '}
                <strong>Weight Increment</strong>
                {' '}
                for successful progressions, change the
                {' '}
                <strong>Deload Percentage</strong>
                {' '}
                for when you plateau, and, if needed,
                {' '}
                <strong>Reset All Progress</strong>
                {' '}
                to start over.
              </p>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Instructions;
