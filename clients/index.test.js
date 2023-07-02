import {render, screen, waitFor, within} from '@testing-library/react';
import {AuthContext} from 'contexts/auth.context';
import {DataContext} from 'contexts/data.context';
import Clients from './index';
import {BrowserRouter as Router} from 'react-router-dom';
import {Toast} from 'erp-react-components';
import clientsData from 'test-utils/msw_mocks/responseData/clientsData';
import {act} from 'react-dom/test-utils';
import {getClientList} from './clients.api';

jest.mock('./clients.api', () => {
  return {
    ...jest.requireActual('./clients.api'),
    getClientList: jest.fn(),
  };
});

describe('users', () => {
  const clients = clientsData.response.result;
  beforeEach(() => {
    getClientList.mockImplementation(async (data) => {
      return Promise.resolve({
        message: 'Client data fetched Successfully',
        result: clients,
      });
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
    await act(async () =>
      render(
        <>
          <AuthContext.Provider
            value={{
              permissions: permissions,
            }}
          >
            <DataContext.Provider>
              <Router>
                <Clients />
              </Router>
            </DataContext.Provider>
          </AuthContext.Provider>
          <Toast />
        </>,
      ),
    );
    await waitFor(() => {
      expect(getClientList).toHaveBeenCalled();
    });
    await waitFor(() => {
      const loader = within(screen.getByTestId('data-section')).queryByRole(
        'progressbar',
      );
      expect(loader).toBeNull();
    });
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');

    const activeLength =
      (clients.filter((d) => d.clientCrmId === clients[0].id)[0] || {})
        ?.projects?.length || 0;

    //checking headers are rendered properly
    const headerCells = within(rows[0]).getAllByRole('columnheader');
    expect(headerCells[0]).toHaveTextContent('Client');
    expect(headerCells[1]).toHaveTextContent('Country');
    expect(headerCells[2]).toHaveTextContent('City');
    expect(headerCells[3]).toHaveTextContent('Active');

    //checking data is rendered properly
    const firstCells = within(rows[1]).getAllByRole('cell');
    expect(firstCells[0]).toHaveTextContent(clients[0]?.name || '--');
    expect(firstCells[1]).toHaveTextContent(clients[0]?.country?.name || '--');
    expect(firstCells[2]).toHaveTextContent(clients[0]?.city?.name || '--');
    expect(firstCells[3]).toHaveTextContent(`${activeLength} (view)`);
  });
});
