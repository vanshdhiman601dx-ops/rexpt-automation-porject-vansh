import { loadEnv } from './loadEnv.js';
import dev from './env.dev.js';
import qa from './env.qa.js';
import stage from './env.stage.js';
import prod from './env.prod.js';

loadEnv();

const environments = {
  dev,
  qa,
  stage,
  prod,
};

const environmentName = process.env.TEST_ENV || 'dev';

const selectedEnvironment = environments[environmentName] || environments.dev;

export default {
  ...selectedEnvironment,
  auth: {
    finalUrl: process.env.AUTH_FINAL_URL || 'https://rexptin.vercel.app/fast-agent-detail',
  },
  login: {
    email: process.env.EMAIL_FOR_LOGIN || process.env.LOGIN_TEST_EMAIL || 'vanshdhiman601.dx@gmail.com',
  },
  moreButton: {
    email: process.env.EMAIL_FOR_MORE_BUTTON_FLOW,
  },
  googleAccount: {
    email: process.env.GOOGLE_TEST_EMAIL || process.env.EMAIL_FOR_LOGIN,
    password: process.env.GOOGLE_TEST_PASSWORD || process.env.GOOGLE_LOGIN_PASSWORD,
  },
  signup: {
    email: process.env.SIGNUP_TEST_EMAIL || 'vanshdhiman601.dx+01@gmail.com',
    detailsUrl: process.env.SIGNUP_DETAILS_URL || 'https://rexptin.vercel.app',
  },
};
