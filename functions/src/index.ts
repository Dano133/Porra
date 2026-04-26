/**
 * Punto de entrada de Cloud Functions.
 * Cada feature vive en su propio archivo y se exporta aquí.
 */
import * as admin from 'firebase-admin';
admin.initializeApp();

export { registerParticipant } from './registerParticipant';
export { submitPrediction } from './submitPrediction';
export { recalculateScores } from './recalculateScores';
export { sendEmail } from './sendEmail';
export { dailySnapshot, biweeklyEmail } from './scheduled';
