import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import MasterBulletin from '.';
import {AuthContext} from 'contexts/auth.context';
import {DataContext} from 'contexts/data.context';
import {simulateSelectEvent} from 'test-utils/helpers';
import studios from 'test-utils/msw_mocks/responseData/studios';
import usersLessData from 'test-utils/msw_mocks/responseData/usersLessData';
import {createBulletin} from './masterBulletin.api'

jest.mock('./masterBulletin.api',()=>{
  return {
    ...jest.requireActual('./masterBulletin.api'),
    createBulletin: jest.fn(),
  }
});

describe('should render masterbulletin', () => {
  beforeEach(() => {
    createBulletin.mockImplementation(async(data) => {
      return Promise.resolve({message: 'Bulletin created successfully'});
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  const permissions = {
    Settings: {
      'Master Bulletin': {isAdd: true, isEdit: true, isView: true},
    },
  };
  test('master bulletin form', async () => {
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <MasterBulletin />
      </AuthContext.Provider>,
    );
    const input = screen.getByTestId('textarea');
    expect(input).toBeInTheDocument();
    const studios = screen.getByTestId('studios');
    expect(studios).toBeInTheDocument();
    const users = screen.getByTestId('users');
    expect(users).toBeInTheDocument();
    const date = moment().format('YYYY-MM-DD');
    const publishDatePicker = screen.getByPlaceholderText(
      'Select Publish Date',
    );
    userEvent.type(publishDatePicker, date);
    const expireDatePicker = screen.getByPlaceholderText('Select Expire Date');
    userEvent.type(expireDatePicker, date);

    const checkbox = screen.getByLabelText('Post as Admin');
    expect(checkbox).toBeInTheDocument();
  });

  test('submit form with valid values', async () => {
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <DataContext.Provider
          value={{
            fetchStudios: jest.fn(),
            fetchAllUsersLessData: jest.fn(),
            fetchDevices: jest.fn(),
            studios: studios.response.result,
            usersLessData: usersLessData.response.result,
          }}
        >
          <MasterBulletin />
        </DataContext.Provider>
      </AuthContext.Provider>,
    );

    const input = screen.getByTestId('textarea');
    await userEvent.type(input, 'something');
    await simulateSelectEvent('studios', 1);
    await simulateSelectEvent('users', 1);
    const date = moment().format('YYYY-MM-DD');
    const publishDatePicker = screen.getByPlaceholderText(
      'Select Publish Date',
    );
    await userEvent.type(publishDatePicker, date);
    const expireDatePicker = screen.getByPlaceholderText('Select Expire Date');
    await userEvent.type(expireDatePicker, date);

    const checkbox = screen.getByLabelText('Post as Admin');
    expect(checkbox).toBeInTheDocument();

    const createBtn = screen.getByRole('button', {name: 'Post'});
    userEvent.click(createBtn);
    await waitFor(()=>{
     expect(createBulletin).toHaveBeenCalledTimes(1);
    });
  },60000);
});
