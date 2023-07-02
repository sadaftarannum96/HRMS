import {render, screen} from '@testing-library/react';
import SetupSessions from './setupSessions';
import {BrowserRouter as Router} from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import projectDetails from '../../../test-utils/msw_mocks/responseData/projectDetails';
import usersLessData from '../../../test-utils/msw_mocks/responseData/usersLessData';
import sessionStatus from '../../../test-utils/msw_mocks/responseData/sessionTypes';
import {DataContext} from 'contexts/data.context';
import {simulateSelectEvent} from 'test-utils/helpers';
import studios from 'test-utils/msw_mocks/responseData/studios';

describe('setupSession', () => {
  const projectDetailsRes = projectDetails.response.result;
  const users = usersLessData.response.result;

  test('render as expected', async () => {
    render(
      <DataContext.Provider
        value={{
          fetchAllUsersLessData: jest.fn(),
          fetchSessionStatus: jest.fn(),
          fetchDevices: jest.fn(),
          fetchRoles: jest.fn(),
          fetchStudios: jest.fn(),
          fetchLanguages: jest.fn(),
          getCurrency: jest.fn(),
          usersLessData: users,
          devices: [],
          roles: [],
          studios: studios.response.result,
        }}
      >
        <Router>
          <SetupSessions
            location={{
              state: {projectDetails: projectDetailsRes[0], viewSession: false},
            }}
          />
        </Router>
      </DataContext.Provider>,
    );
    const sessionID = screen.getByLabelText('Session ID');
    expect(sessionID).toBeInTheDocument();
    const sessionType = screen.getByTestId('sessionTypeId');
    expect(sessionType).toBeInTheDocument();
    const client = screen.getByLabelText('Client');
    expect(client).toBeInTheDocument();
    // const talent = screen.getByTestId('talentIds');
    // expect(talent).toBeInTheDocument();
    // const character = screen.getByTestId('characterIds');
    // expect(character).toBeInTheDocument();
    const director = screen.getByTestId('directorId');
    expect(director).toBeInTheDocument();
    const status = screen.getByTestId('status');
    expect(status).toBeInTheDocument();
    const timezoneId = screen.getByTestId('timezoneId');
    expect(timezoneId).toBeInTheDocument();

    const roomFinderBtn = screen.getByRole('button', {
      name: 'Schedule Session',
    });
    await userEvent.click(roomFinderBtn);
    // here we are cheking modal of room finder open or not
    const roomFinder = screen.getByRole('dialog');
    expect(roomFinder).toBeInTheDocument();
    const closeBtn = screen.getByRole('button', {name: 'Close'});
    userEvent.click(closeBtn);
    const pmNotes = screen.getByTestId('pmNotes');
    expect(pmNotes).toBeInTheDocument();
    const description = screen.getByTestId('description');
    expect(description).toBeInTheDocument();
  });
  test('submit form with valid values', async () => {
    const projectDetailsRes = projectDetails.response.result;
    const users = usersLessData.response.result;
    const sessionStatusRes = sessionStatus.response.result;
    render(
      <DataContext.Provider
        value={{
          fetchAllUsersLessData: jest.fn(),
          fetchSessionStatus: jest.fn(),
          fetchDevices: jest.fn(),
          fetchRoles: jest.fn(),
          fetchStudios: jest.fn(),
          fetchLanguages: jest.fn(),
          getCurrency: jest.fn(),
          usersLessData: users,
          devices: [],
          roles: [],
          sessionStatus: sessionStatusRes,
        }}
      >
        <Router>
          <SetupSessions
            location={{
              state: {
                projectDetails: projectDetailsRes[0],
                viewSession: false,
                selectedMilestone: 1,
              },
            }}
          />
        </Router>
      </DataContext.Provider>,
    );
    await simulateSelectEvent('sessionTypeId', 1);
    await simulateSelectEvent('talentIds', 1);
    await simulateSelectEvent('timezoneId', 1);
    await simulateSelectEvent('status', 1);
    await simulateSelectEvent('directorId', 1);
    const pmNotes = screen.getByTestId('pmNotes');
    userEvent.type(pmNotes, 'This is pm notes');
    const description = screen.getByTestId('description');
    userEvent.type(description, 'This is description');
    const createButton = screen.getByRole('button', {name: 'Create'});
    userEvent.click(createButton);
  }, 60000);
});
