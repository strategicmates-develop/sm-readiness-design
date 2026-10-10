// MOCK of the public assessments API, so the wizard runs with no backend.
//
// REAL CONTRACT (do not lose it):
//   POST /api/v1/public/assessments/readiness   (no auth)
//   Body:    the payload built by buildReadinessPayload() in readiness/readinessForm.js
//   200:     { data: { token: string, result: <readiness result> } }
//            the real client unwraps it and resolves with `{ token, result }`
//   Errors:  422 { message, errors: { 'contact.email': ['...'], 'answers.q05': ['...'] } }
//            409 already submitted, 429 throttled (any other failure = generic error)
//   See CONTRACT.md for the exact payload and result shapes.
//
// Mock behaviour: waits 900 ms, then resolves with the `ready` fixture, or with the
// `on_track` fixture when business.years_operating < 1.
// To see the error states, run this in the browser console before submitting:
//   window.__smMock = { nextError: 422 }   // or 409 / 429 / 500
// It applies to the next submission only and is then cleared.
import { READINESS_RESULT_READY, READINESS_RESULT_ON_TRACK } from '../readiness/readinessFixtures';

const MOCK_DELAY_MS = 900;

function buildHttpError(status) {
  const data = status === 422
    ? {
        message: 'The given data was invalid.',
        errors: { 'contact.email': ['The email must be a valid email address.'] },
      }
    : { message: 'Mock error' };
  return Object.assign(new Error(`HTTP ${status}`), { response: { status, data } });
}

export const assessmentsApi = {
  submitReadiness: (payload) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const forcedStatus = window.__smMock?.nextError;
        if (forcedStatus) {
          window.__smMock = { ...window.__smMock, nextError: null };
          reject(buildHttpError(forcedStatus));
          return;
        }
        const isOnTrack = Number(payload?.business?.years_operating) < 1;
        resolve({
          token: 'mock-token',
          result: isOnTrack ? READINESS_RESULT_ON_TRACK : READINESS_RESULT_READY,
        });
      }, MOCK_DELAY_MS);
    }),
};