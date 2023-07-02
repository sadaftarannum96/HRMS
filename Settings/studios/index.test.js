import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import Studios from './index';
import {AuthContext} from 'contexts/auth.context';
import studios from 'test-utils/msw_mocks/responseData/studios';
import userEvent from '@testing-library/user-event';
import {onDeletetudio} from './studios.api';
import {Toast} from 'erp-react-components';

jest.mock('./studios.api', () => {
  return {
    ...jest.requireActual('./studios.api'),
    onDeletetudio: jest.fn(),
  };
});

describe('studios', () => {
  beforeEach(() => {
    onDeletetudio.mockImplementation(async (data) => {
      return Promise.resolve({message: 'Studio Deleted Successfully'});
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  const permissions = {
    Settings: {
      isAdd: true,
      isEdit: true,
      isView: true,
      Studios: {
        isAdd: true,
        isEdit: true,
        isView: true,
      },
    },
  };
  const studiosList = studios.response.result;
  test('render as expected', async () => {
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <Studios />
      </AuthContext.Provider>,
    );
    await waitFor(() => {
      const loader = within(screen.getByTestId('data-section')).queryByRole(
        'progressbar',
      );
      expect(loader).toBeNull();
    });
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    //checking headers are rendered properly
    const headerCells = within(rows[0]).getAllByRole('columnheader');
    expect(headerCells[0]).toHaveTextContent('Studio');
    expect(headerCells[1]).toHaveTextContent('Room');
    studiosList?.forEach((item, index) => {
      const cells = within(rows[index + 1]).getAllByRole('cell');
      expect(cells[0]).toHaveTextContent(item?.name || '--');
      const roomList = (item?.rooms || []).map((b) => b.name).join(', ');
      expect(cells[1]).toHaveTextContent(roomList || '--');
    });
  });
  test('delete studio', async () => {
    const {container} = render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <Studios />
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
    const button = within(firstCells[2]).getByRole('button');
    fireEvent.click(button);
    //open a tooltip
    const actionsMenu = await screen.findByRole('menu');
    expect(actionsMenu).toBeInTheDocument();
    //delete studio
    const deleteButton = within(actionsMenu).getByRole('button', {name: 'Delete'});
    fireEvent.click(deleteButton);
    //confirm delete modal
    const deleteModal = screen.getByRole('dialog', {
      name: 'Delete Confirmation',
    });
    const deleteUserButton = within(deleteModal).getByRole('button', {
      name: 'Delete',
    });
    userEvent.click(deleteUserButton); //button
    await waitFor(() => {
      expect(onDeletetudio).toHaveBeenCalledTimes(1);
      const toastContainer = screen.getByRole('toast-container');
      expect(toastContainer).toHaveTextContent('Studio Deleted Successfully');
    });
  });
});
