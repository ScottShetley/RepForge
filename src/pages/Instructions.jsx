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
                From the Dashboard, you have two options: "Start RepForge Workout" for your main strength progression, or "Start Circuit Workout" for machine-based training. The application will automatically suggest your next RepForge workout (A or B) based on your history.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Progression, Failures & Deloads
              </h2>
              <p className="mb-2">
                The app automates the RepForge progression rules for the main workout:
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
                  If you fail the same weight three times in a row, the app will automatically deload the weight by 10% to help you break through the plateau.
                </li>
              </ul>
            </section>

            {/* --- NEW SECTION --- */}
            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Circuit Training
              </h2>
              <p>
                The Circuit Tracker is designed for machine-based workouts. Simply enter the weight and number of reps you performed for each exercise. Only exercises where you have entered both a weight and reps will be saved to your workout history.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Adjusting & Swapping (RepForge Workout)
              </h2>
              <p className="mb-2">
                You have full control over your RepForge workout session:
              </p>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>
                  <strong>Adjust Weight:</strong>
                  {' '}
                  Click the pencil icon next to a core lift to make a one-time weight adjustment for the current session. This is useful if you feel strong or need to correct the weight.
                </li>
                <li>
                  <strong>Swap Exercise:</strong>
                  {' '}
                  Use the "Swap" button to substitute an exercise with another from the library that targets the same muscle group.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Finishing Your Session
              </h2>
              <p>
                When you are done, click the "Save and Finish" button. This will lock in your progression for the day and save the session to your history. The app will have your next workout ready for you the next time you visit.
              </p>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Instructions;
