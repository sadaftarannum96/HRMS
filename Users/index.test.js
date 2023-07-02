import {
  render,
  screen,
  waitFor,
  within,
  fireEvent,
} from '@testing-library/react';
import {AuthContext} from 'contexts/auth.context';
import {DataContext} from 'contexts/data.context';
import Users from './index';
import {BrowserRouter as Router} from 'react-router-dom';
import usersAllDetails from 'test-utils/msw_mocks/responseData/usersAllDetails';
import userEvent from '@testing-library/user-event';
import {deactivateUser, updateUser} from './users.api';
import {Toast} from 'erp-react-components';
import {simulateSelectEvent} from 'test-utils/helpers';
import studios from 'test-utils/msw_mocks/responseData/studios';

jest.mock('./users.api', () => {
  return {
    ...jest.requireActual('./users.api'),
    deactivateUser: jest.fn(),
    updateUser: jest.fn(),
  };
});

describe('users', () => {
  beforeEach(() => {
    deactivateUser.mockImplementation(async (data) => {
      return Promise.resolve({message: 'User Deleted Successfully'});
    });
    updateUser.mockImplementation(async (data) => {
      return Promise.resolve({message: 'User Updated Successfully'});
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('renders as expected', async () => {
    const permissions = {
      Users: {
        isAdd: true,
        isEdit: true,
        isView: true,
      },
    };
    const users = usersAllDetails.response.result;

    render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <DataContext.Provider
            value={{
              fetchDepartments: jest.fn(),
              fetchStudios: jest.fn(),
              fetchRoles: jest.fn(),
              departments: [],
            }}
          >
            <Router>
              <Users />
            </Router>
          </DataContext.Provider>
        </AuthContext.Provider>
        <Toast />
      </>,
    );
    await waitFor(() => {
      const loader = within(screen.getByTestId('data-section')).queryByRole(
        'progressbar',
      );
      expect(loader).toBeNull();
    });
    // screen.debug();
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');

    //checking headers are rendered properly
    const headerCells = within(rows[0]).getAllByRole('columnheader');
    expect(headerCells[0]).toHaveTextContent('Name');
    expect(headerCells[1]).toHaveTextContent('User Name');
    expect(headerCells[2]).toHaveTextContent('Email ID');
    expect(headerCells[3]).toHaveTextContent('Role');
    expect(headerCells[4]).toHaveTextContent('Location');

    //checking data is rendered properly
    const firstCells = within(rows[1]).getAllByRole('cell');
    expect(firstCells[0]).toHaveTextContent(users[0]?.name);
    expect(firstCells[1]).toHaveTextContent(users[0]?.userName);
    expect(firstCells[2]).toHaveTextContent(users[0]?.emailId);
    expect(firstCells[3]).toHaveTextContent(users[0]?.roles);
    expect(firstCells[4]).toHaveTextContent(users[0]?.location);
  });

  test('delete a user', async () => {
    const permissions = {
      Users: {
        isAdd: true,
        isEdit: true,
        isView: true,
      },
    };
    const {container} = render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <DataContext.Provider
            value={{
              fetchDepartments: jest.fn(),
              fetchStudios: jest.fn(),
              fetchRoles: jest.fn(),
              departments: [],
            }}
          >
            <Router>
              <Users />
            </Router>
          </DataContext.Provider>
        </AuthContext.Provider>
        <Toast />
      </>,
    );
    await waitFor(() => {
      const loader = within(screen.getByTestId('data-section')).queryByRole(
        'progressbar',
      );
      expect(loader).toBeNull();
    });
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const firstCells = within(rows[1]).getAllByRole('cell');
    const button = within(firstCells[5]).getByRole('button');
    fireEvent.click(button);
    //open a tooltip
    const actionsMenu = await screen.findByRole('menu');
    expect(actionsMenu).toBeInTheDocument();
    //delete the user
    const deleteButton = within(actionsMenu).getByRole('button', {name: 'Delete'});
    fireEvent.click(deleteButton); // This element declared `pointer-events: none` in the stylesheet.
    //confirm delete modal
    const deleteModal = screen.getByRole('dialog', {
      name: 'Deactivate Confirmation',
    });
    const deleteUserButton = within(deleteModal).getByRole('button', {
      name: 'Yes',
    });
    userEvent.click(deleteUserButton); //button
    await waitFor(() => {
      expect(deactivateUser).toHaveBeenCalledTimes(1);
      const toastContainer = screen.getByRole('toast-container');
      expect(toastContainer).toHaveTextContent('User Deleted Successfully');
    });
  });

  test('edit a user', async () => {
    const permissions = {
      Users: {
        isAdd: true,
        isEdit: true,
        isView: true,
      },
    };

    const {container} = render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <DataContext.Provider
            value={{
              fetchDepartments: jest.fn(),
              fetchStudios: jest.fn(),
              fetchRoles: jest.fn(),
              departments: [],
              studios: studios.response.result,
            }}
          >
            <Router>
              <Users />
            </Router>
          </DataContext.Provider>
        </AuthContext.Provider>
        <Toast />
      </>,
    );
    await waitFor(() => {
      const loader = within(screen.getByTestId('data-section')).queryByRole(
        'progressbar',
      );
      expect(loader).toBeNull();
    });
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const firstCells = within(rows[1]).getAllByRole('cell');
    const button = within(firstCells[5]).getByRole('button');
    fireEvent.click(button);
    //open a tooltip
    const actionsMenu = await screen.findByRole('menu');
    expect(actionsMenu).toBeInTheDocument();
    //delete the user
    const editButton = within(actionsMenu).getByRole('button', {name: 'Edit'});
    fireEvent.click(editButton);
    const editModal = screen.getByRole('dialog');
    await simulateSelectEvent('studioIds', 1);
    const pickColor = within(editModal).getByPlaceholderText('Pick Color');
    await userEvent.type(pickColor, '#fcb900');
    const saveButton = within(editModal).getByRole('button', {name: 'Save'});
    userEvent.click(saveButton);
    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledTimes(1);
      const toastContainer = screen.getByRole('toast-container');
      expect(toastContainer).toHaveTextContent('User Updated Successfully');
      expect(editModal).not.toBeInTheDocument();
    });
  }, 60000);
});
