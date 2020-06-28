import { createLogger } from './logger';
import { SmartHomeJwt } from 'actions-on-google';

const log = createLogger('config');

let jwt: SmartHomeJwt | undefined;

try {
    // Hardcoded string
    jwt = require('../../google_service_key.json');
} catch (error) {
    log.error(new Error('Error requiring google service key'));
}

export const config = {
    GOOGLE_SERVICE_KEY: jwt as SmartHomeJwt,
    REMOTE_CLOUD_BASE_PATH: '/api',
    REMOTE_CLOUD_HOSTNAME: 'https://cloud.crownstone.rocks',

    EVENT_SERVER_URL: process.env.EVENT_SERVER_URL,
    EVENT_SERVER_JWT: process.env.EVENT_SERVER_JWT,
};
