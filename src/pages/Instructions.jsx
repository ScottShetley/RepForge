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
                From the Dashboard, click '+ New Workout' to go to the Workout Selection screen. Here you can choose between Workout A, Workout B, or Circuit Training.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Progression, Failures &amp; Deloads
              </h2>
              <p className="mb-2">
                The app automates the RepForge progression rules for the main workouts (A &amp; B):
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
                  If you fail the same weight three times in a row, the app will automatically deload the weight by 10% (
                  <strong>this percentage can be changed in Settings</strong>
                  ) to help you break through the plateau.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                In-Workout Controls
              </h2>
              <p className="mb-2">
                You have full control over your RepForge workout session:
              </p>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>
                  <strong>Adjust Weight:</strong>
                  {' '}
                  Click the "Adjust" button next to a core lift to make a one-time weight adjustment for the current session.
                </li>
                <li>
                  <strong>Swap Exercise:</strong>
                  {' '}
                  Use the "Swap" button to substitute an exercise with another from the library.
                </li>
                <li>
                  <strong>Plate Calculator:</strong>
                  {' '}
                  Click the "Calc" button to open a tool that helps you determine which plates to load on the barbell for your target weight.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Using the Rest Timer
              </h2>
              <p>
                After you log a completed set in a RepForge workout, a rest timer will automatically appear. You can select your desired rest period to stay on track during your session.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Circuit Training
              </h2>
              <p>
                The Circuit Tracker is designed for accessory or machine-based workouts. Simply enter the weight and number of reps you performed for each exercise. Only exercises where you have entered data will be saved to your workout history.
              </p>
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
                charts visualize your gains on core lifts over time.
                {' '}
                <strong>
                  Note: A chart will only appear for a given lift after you have completed at least three workouts containing it.
                </strong>
                {' '}
                You can also click any highlighted day on the
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
                Navigate to the Settings page to tailor RepForge to your needs. Here you can adjust the default
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
                to start your journey from scratch.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Finishing Your Session
              </h2>
              <p>
                When you are done, click the "Save and Finish" button. This will lock in your progression for the day and save the session to your history.
              </p>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Instructions;
