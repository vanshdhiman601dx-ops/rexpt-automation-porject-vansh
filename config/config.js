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
  googleAccount: {
    email: process.env.GOOGLE_TEST_EMAIL,
    password: process.env.GOOGLE_TEST_PASSWORD,
  },
  signup: {
    email: process.env.SIGNUP_TEST_EMAIL || 'vanshdhiman601.dx+01@gmail.com',
    detailsUrl: process.env.SIGNUP_DETAILS_URL || 'https://rexptin.vercel.app/details',
  },
};
