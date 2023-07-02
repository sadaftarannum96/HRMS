// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import {server} from './test-utils/msw_mocks/server.js';
// import 'whatwg-fetch';
import './test-utils/jestEnvVars';
import {matchRequestUrl} from 'msw';

window.HTMLElement.prototype.scrollIntoView = function() {};
global.ResizeObserver = require('resize-observer-polyfill');
// console.error = () => {
//   console.log('an error here');
// };
//i18next
jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));
/*
================= MSW =======================
*/

// https://mswjs.io/docs/extensions/life-cycle-events#tracking-a-request
export function waitForRequest(method, url) {
  let requestId = '';
  return new Promise((resolve, reject) => {
    server.events.on('request:start', (req) => {
      const matchesMethod =
        req.method.toLowerCase() === (method || 'get').toLowerCase();
      const matchesUrl = matchRequestUrl(req.url, url);
      if (matchesMethod && matchesUrl) {
        requestId = req.id;
      }
    });
    server.events.on('request:match', (req) => {
      if (req.id === requestId) {
        resolve(req);
      }
    });
    server.events.on('request:unhandled', (req) => {
      if (req.id === requestId) {
        console.log(`The ${req.method} ${req.url.href} request was unhandled.`);
        reject(
          new Error(`The ${req.method} ${req.url.href} request was unhandled.`),
        );
      }
    });
  });
}
/*
================= MSW =======================
*/
beforeAll(() => {
  // Establish API mocking before all tests.
  server.listen({onUnhandledRequest: 'error'});
  // server.printHandlers()
});
afterEach(() => {
  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.

  server.resetHandlers();
});
afterAll(() => {
  // Clean up after the tests are finished.
  server.close();
});
