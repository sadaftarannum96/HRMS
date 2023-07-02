import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {AuthContext} from 'contexts/auth.context';
import {DataContext} from 'contexts/data.context';
import PoBook from './index';
import {BrowserRouter as Router} from 'react-router-dom';
import {Toast} from 'erp-react-components';
import purchaseOrderData from 'test-utils/msw_mocks/responseData/purchaseOrderData';
import moment from 'moment';
import userEvent from '@testing-library/user-event';
import {deletePo} from './poBook.api';
import {handlePrint} from './poBookPdf';

jest.mock('./poBook.api', () => {
  return {
    ...jest.requireActual('./poBook.api'),
    deletePo: jest.fn(),
  };
});

//poBook export pdf mock
jest.mock('./poBookPdf', () => {
  return {
    ...jest.requireActual('./poBookPdf'),
    handlePrint: jest.fn(),
  };
});

describe('poBook', () => {
  beforeEach(() => {
    deletePo.mockImplementation(async (data) => {
      return Promise.resolve({message: 'Purchase order deleted successfully'});
    });
    handlePrint.mockImplementation(async (data) => {
      return Promise.resolve({
        message: 'Purchase Order Downloaded Successfully',
      });
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  const data = purchaseOrderData.response;
  const permissions = {
    Finance: {
      isAdd: true,
      isEdit: true,
      isView: true,
      'Project Finance': {
        isAdd: true,
        isEdit: true,
        isView: true,
      },
      Quotes: {
        isAdd: true,
        isEdit: true,
        isView: true,
      },
      'PO Book': {
        isAdd: true,
        isEdit: true,
        isView: true,
      },
      Suppliers: {
        isAdd: true,
        isEdit: true,
        isView: true,
      },
    },
  };
  test('renders as expected', async () => {
    render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <DataContext.Provider
            value={{
              getCurrency: jest.fn(),
              fetchLineOfBusinessList: jest.fn(),
              fetchLanguages: jest.fn(),
              languages: [],
              currencyList: [],
            }}
          >
            <Router>
              <PoBook />
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
    const listText = screen.getByText('List Of Purchase Orders');
    expect(listText).toBeInTheDocument();
    const allCount = screen.getByText(`(${data?.poCount?.total || 0})`);
    expect(allCount).toBeInTheDocument();
    const receivedCount = screen.getByText(`(${data?.poCount?.received || 0})`);
    expect(receivedCount).toBeInTheDocument();
    const notReceivedCount = screen.getByText(
      `(${data?.poCount?.notReceived || 0})`,
    );
    expect(notReceivedCount).toBeInTheDocument();
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    //checking headers are rendered properly
    const headerCells = within(rows[0]).getAllByRole('columnheader');
    expect(headerCells[1]).toHaveTextContent('PO No');
    expect(headerCells[2]).toHaveTextContent('Project');
    expect(headerCells[3]).toHaveTextContent('Client');
    expect(headerCells[4]).toHaveTextContent('Job Date');
    expect(headerCells[5]).toHaveTextContent('Supplier');
    expect(headerCells[6]).toHaveTextContent('Details');
    expect(headerCells[7]).toHaveTextContent('Outstanding Costs');
    //checking data is rendered properly
    const firstCells = within(rows[1]).getAllByRole('cell');
    expect(firstCells[1]).toHaveTextContent(data.result[0]?.poNumber);
    expect(firstCells[2]).toHaveTextContent(data.result[0]?.project);
    expect(firstCells[3]).toHaveTextContent(data.result[0]?.clientName);
    expect(firstCells[4]).toHaveTextContent(
      data.result[0]?.jobDate
        ? moment(data.result[0]?.jobDate).format('DD/MM/YYYY')
        : '--',
    );
    expect(firstCells[5]).toHaveTextContent(data.result[0]?.supplier);
    expect(firstCells[6]).toHaveTextContent(data.result[0]?.details || '--');
    const outStandingCostsValue = data.result[0]?.outStandingCosts
      ? data.result[0]?.currency
        ? `${data.result[0]?.currency.symbol} ${data.result[0]?.outStandingCosts}`
        : data.result[0]?.outStandingCosts
      : '--';
    expect(firstCells[7]).toHaveTextContent(outStandingCostsValue);
  });
  
  test('Delete po', async () => {
    const {container} = render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <DataContext.Provider
            value={{
              getCurrency: jest.fn(),
              fetchLineOfBusinessList: jest.fn(),
              fetchLanguages: jest.fn(),
              languages: [],
              currencyList: [],
            }}
          >
            <Router>
              <PoBook />
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
    const button = within(firstCells[8]).getByRole('button');
    fireEvent.click(button);
    //open a tooltip
    const actionsMenu = await screen.findByRole('menu');
    expect(actionsMenu).toBeInTheDocument();
    //delete the po
    const deleteButton = within(actionsMenu).getByRole('button', {name: 'Delete'});
    fireEvent.click(deleteButton); // This element declared `pointer-events: none` in the stylesheet.
    //confirm delete modal
    const deleteModal = screen.getByRole('dialog', {
      name: 'Delete Confirmation',
    });
    const deleteUserButton = within(deleteModal).getByRole('button', {
      name: 'Delete',
    });
    userEvent.click(deleteUserButton); //button
    await waitFor(() => {
      expect(deletePo).toHaveBeenCalledTimes(1);
      const toastContainer = screen.getByRole('toast-container');
      expect(toastContainer).toHaveTextContent(
        'Purchase order deleted successfully',
      );
    }, 60000);
  });

  test('Download po', async () => {
    const {container} = render(
      <>
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <DataContext.Provider
            value={{
              getCurrency: jest.fn(),
              fetchLineOfBusinessList: jest.fn(),
              fetchLanguages: jest.fn(),
              languages: [],
              currencyList: [],
            }}
          >
            <Router>
              <PoBook />
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
    const button = within(firstCells[8]).getByRole('button');
    fireEvent.click(button);
    //open a tooltip
    const actionsMenu = await screen.findByRole('menu');
    expect(actionsMenu).toBeInTheDocument();
    //delete the po
    const downloadButton = within(actionsMenu).getByRole('button', {
      name: 'Download',
    });
    fireEvent.click(downloadButton); // This element declared `pointer-events: none` in the stylesheet.
    await waitFor(() => {
      expect(handlePrint).toHaveBeenCalledTimes(1);
      const toastContainer = screen.getByRole('toast-container');
      expect(toastContainer).toHaveTextContent(
        'Purchase Order Downloaded Successfully',
      );
    });
  });
});
