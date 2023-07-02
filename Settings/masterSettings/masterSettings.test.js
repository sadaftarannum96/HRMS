// https://www.valentinog.com/blog/jest/ -- test case for filter
// todo: need to implement

// https://rishabhsrao.medium.com/mocking-and-testing-fetch-with-jest-c4d670e2e167
import React from 'react';
import {shallow} from 'enzyme';
import {
  languages,
  voiceTypes,
  accents,
  gameTypes,
  sessionTypes,
} from '../../api_urls';
import {AuthContext} from 'contexts/auth.context';
import MasterSettings from '../masterSettings';
import {render} from '@testing-library/react';
let REACT_APP_API_GATEWAY_URL = 'https://side-pydev.ptw.com/';

describe('ExampleComponent', () => {
  it.only('renders as expected', () => {
    render(
      <AuthContext.Provider value={{permissions: {Settings: {}}}}>
        (<MasterSettings />)
      </AuthContext.Provider>,
    );
    // screen.debug();
  });
  it('fetches data from server when server returns a successful response', (done) => {
    // 1
    const mockSuccessResponse = {};
    const mockJsonPromise = Promise.resolve(mockSuccessResponse); // 2
    const mockFetchPromise = Promise.resolve({
      // 3
      json: () => mockJsonPromise,
    });
    jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise); // 4

    const wrapper = shallow(<MasterSettings />); // 5
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `${REACT_APP_API_GATEWAY_URL}${languages}`,
    );

    process.nextTick(() => {
      // 6
      expect(wrapper.state()).toEqual({
        // ... assert the set state
      });

      global.fetch.mockClear(); // 7
      done(); // 8
    });
  });
});
