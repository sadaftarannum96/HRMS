import {
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {DataContext} from 'contexts/data.context';
import TierSetup from './index';
import currencyList from 'test-utils/msw_mocks/responseData/currencyList';
import {simulateSelectEvent} from 'test-utils/helpers';
import {createTierSetup} from './tierSetup.api';
import {AuthContext} from 'contexts/auth.context';
import {mapToLabelValue} from 'helpers/helpers';
import tierSetupList from 'test-utils/msw_mocks/responseData/tierSetupList';

jest.mock('./tierSetup.api', () => {
  return {
    ...jest.requireActual('./tierSetup.api'),
    createTierSetup: jest.fn(),
  };
});

describe('TierSetup', () => {
  beforeEach(() => {
    createTierSetup.mockImplementation(async (data) => {
      return Promise.resolve({message: 'Tier setUp created successfully'});
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  const currencyListRes = mapToLabelValue(currencyList.response.result || []);
  const permissions = {
    Settings: {
      ['Quote Setup']: {
        isAdd: true,
        isEdit: true,
        isView: true,
      },
      ['Tier Setup']: {
        isAdd: true,
        isEdit: true,
        isView: true,
      },
      isAdd: true,
      isEdit: true,
      isView: true,
    },
  };
  const data = tierSetupList.response.result;
  test('render as expected', async () => {
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <DataContext.Provider
          value={{
            getCurrency: jest.fn(),
            currencyList: currencyListRes,
          }}
        >
          <TierSetup />
        </DataContext.Provider>
      </AuthContext.Provider>,
    );
    const tierNameSelect = screen.getByTestId('name');
    expect(tierNameSelect).toBeInTheDocument();
    const currencySelect = screen.getByTestId('currencyId');
    expect(currencySelect).toBeInTheDocument();
    const unitsSelect = screen.getByTestId('units');
    expect(unitsSelect).toBeInTheDocument();
    const feeInput = screen.getByLabelText('Fee*');
    expect(feeInput).toBeInTheDocument();
    const buyOutInput = screen.getByLabelText('Buyout*');
    expect(buyOutInput).toBeInTheDocument();
    const saveButton = screen.getByRole('button', {name: 'Save'});
    expect(saveButton).toBeInTheDocument();
    const cancelButton = screen.getByRole('button', {name: 'Cancel'});
    expect(cancelButton).toBeInTheDocument();
    const tierSetupList = screen.getByTestId('tierSetupList');
    await waitFor(() => {
      const loader = within(tierSetupList).queryByRole('progressbar');
      expect(loader).toBeNull();
    });
    data.forEach((item, index) => {
      const oneSection = within(tierSetupList).getByTestId(item?.id);
      expect(oneSection).toBeInTheDocument();
      const name = within(oneSection).getByText('Name');
      expect(name).toBeInTheDocument();
      const nameValue = within(oneSection).getByText(item?.name);
      expect(nameValue).toBeInTheDocument();
      const currency = within(oneSection).getByText('Currency');
      expect(currency).toBeInTheDocument();
      const currencyValue = within(oneSection).getByText(item?.currency?.name);
      expect(currencyValue).toBeInTheDocument();
      const units = within(oneSection).getByText('Units');
      expect(units).toBeInTheDocument();
      const unitsValue = within(oneSection).getByText(item?.units);
      expect(unitsValue).toBeInTheDocument();
      const fee = within(oneSection).getByText('Fee');
      expect(fee).toBeInTheDocument();
      const feeValue = within(oneSection).getByText(item?.fee);
      expect(feeValue).toBeInTheDocument();
      const buyout = within(oneSection).getByText('Buyout');
      expect(buyout).toBeInTheDocument();
      const buyoutValue = within(oneSection).getByText(item?.buyOut);
      expect(buyoutValue).toBeInTheDocument();
    });
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
            getCurrency: jest.fn(),
            currencyList: currencyListRes,
          }}
        >
          <TierSetup />
        </DataContext.Provider>
      </AuthContext.Provider>,
    );
    await simulateSelectEvent('name', 1);
    await simulateSelectEvent('currencyId', 142);
    await simulateSelectEvent('units', 1);
    const feeInput = screen.getByLabelText('Fee*');
    await userEvent.type(feeInput, '500');
    const buyOutInput = screen.getByLabelText('Buyout*');
    await userEvent.type(buyOutInput, '600');
    const saveButton = screen.getByRole('button', {name: 'Save'});
    userEvent.click(saveButton);
  }, 60000);
});
