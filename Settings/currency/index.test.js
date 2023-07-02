import {render, screen, waitFor, within} from '@testing-library/react';
import currencyList from 'test-utils/msw_mocks/responseData/currencyList';
import Currency from './index';
import userEvent from '@testing-library/user-event';
import {getCurrency} from './currrency.api';

jest.mock('./currrency.api', () => {
  return {
    ...jest.requireActual('./currrency.api'),
    getCurrency: jest.fn(),
  };
});

describe('setting currency tab', () => {
  beforeEach(() => {
    getCurrency.mockImplementation(async (data) => {
      return Promise.resolve({
        message: 'Currency data fetched',
        result: currencyList.response.result,
      });
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  const data = currencyList.response.result;
  test('render as expected', async () => {
    render(<Currency />);
    const searchInput = screen.getByRole('textbox', {name: 'Search'});
    expect(searchInput).toBeInTheDocument();
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
    expect(headerCells[0]).toHaveTextContent('Name');
    expect(headerCells[1]).toHaveTextContent('Symbol');
    expect(headerCells[2]).toHaveTextContent('Abbreviation');
    expect(rows?.length).toBe(data?.length + 1);
    data?.forEach((item, index) => {
      const cells = within(rows[index + 1]).getAllByRole('cell');
      expect(cells[0]).toHaveTextContent(item?.name || '--');
      expect(cells[1]).toHaveTextContent(item?.symbol || '--');
      expect(cells[2]).toHaveTextContent(item?.abbreviation || '--');
    });
  });
  test('currency tab search', async () => {
    render(<Currency />);
    const searchInput = screen.getByRole('textbox', {name: 'Search'});
    expect(searchInput).toBeInTheDocument();
    await userEvent.type(searchInput, 'Euro');
    userEvent.keyboard('{enter}'); //for enter
    await waitFor(() => {
      expect(getCurrency).toHaveBeenCalled();
    });
  });
  test('currency exchange rate modal', async () => {
    render(<Currency />);
    await waitFor(() => {
      const loader = within(screen.getByTestId('data-section')).queryByRole(
        'progressbar',
      );
      expect(loader).toBeNull();
    });
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const firstCells = within(rows[1]).getAllByRole('cell');
    const exchangeRateButton = within(firstCells[3]).getByRole('button', {
      name: 'Exchange Rates',
    });
    await userEvent.click(exchangeRateButton);
    //modal
    const exchangeRateModal = screen.getByRole('dialog');
    expect(exchangeRateModal).toBeInTheDocument();
    // todo: need to work on that exchange rate modal data once exchange rate functionality done
  });
});
