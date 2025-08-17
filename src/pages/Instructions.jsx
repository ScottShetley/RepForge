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
                Logging a Workout
              </h2>
              <p>
                Navigate to the "New Workout" page. The application will automatically suggest your next workout (A or B) based on your history. To log a set, simply click on the corresponding circle. It will fill in to indicate completion.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Progression, Failures & Deloads
              </h2>
              {/* MODIFIED: Changed "StrongLifts 5x5" to "RepForge" */}
              <p className="mb-2">
                The app automates the RepForge progression rules:
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

            <section>
              <h2 className="mb-2 text-2xl font-semibold text-cyan-400">
                Adjusting & Swapping
              </h2>
              <p className="mb-2">
                You have full control over your workout session:
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
                When you are done with your main lifts, click the "Finish & Save Workout" button. This will lock in your progression for the day. The app does not automatically switch to the next workout; your next session will be ready for you the next time you visit the "New Workout" page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Instructions;
