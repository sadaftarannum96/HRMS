import {render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {simulateSelectEvent} from 'test-utils/helpers';
import QuoteSetup from './quoteSetup';
import {createQuoteSetup} from './quoteSetup.api';
import {AuthContext} from 'contexts/auth.context';
import quoteSetupList from 'test-utils/msw_mocks/responseData/quoteSetupList';

jest.mock('./quoteSetup.api', () => {
  return {
    ...jest.requireActual('./quoteSetup.api'),
    createQuoteSetup: jest.fn(),
  };
});

describe('quote setup component', () => {
  beforeEach(() => {
    createQuoteSetup.mockImplementation(async (data) => {
      return Promise.resolve({message: 'Quote setup created successfully'});
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
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
  const data = quoteSetupList.response.result;
  test('quote setup should render form', async () => {
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <QuoteSetup />
      </AuthContext.Provider>,
    );
    const quoteType = screen.getByTestId('quoteType');
    expect(quoteType).toBeInTheDocument();
    const variableType = screen.getByTestId('variableType');
    expect(variableType).toBeInTheDocument();
    const variableName = screen.getByTestId('variableName');
    expect(variableName).toBeInTheDocument();
    const content = screen.getByTestId('content');
    expect(content).toBeInTheDocument();
    const saveBtn = screen.getByRole('button', {name: 'Save'});
    expect(saveBtn).toBeInTheDocument();
    const cancelBtn = screen.getByRole('button', {name: 'Cancel'});
    expect(cancelBtn).toBeInTheDocument();
    const quoteSetupList = screen.getByTestId('quoteSetupList');
    await waitFor(() => {
      const loader = within(quoteSetupList).queryByRole('progressbar');
      expect(loader).toBeNull();
    });
    data.forEach((item, index) => {
      const oneSection = within(quoteSetupList).getByTestId(item?.id);
      expect(oneSection).toBeInTheDocument();
      const quoteType = within(oneSection).getByText('Quote Type');
      expect(quoteType).toBeInTheDocument();
      const quoteTypeValue = within(oneSection).getByText(item?.quoteType);
      expect(quoteTypeValue).toBeInTheDocument();
      const variableType = within(oneSection).getByText('Variable Type');
      expect(variableType).toBeInTheDocument();
      const variableTypeValue = within(oneSection).getByText(
        item?.variableType,
      );
      expect(variableTypeValue).toBeInTheDocument();
      const variableName = within(oneSection).getByText('Variable Name');
      expect(variableName).toBeInTheDocument();
      const variableNameValue = within(oneSection).getByText(
        item?.variableName,
      );
      expect(variableNameValue).toBeInTheDocument();
      const content = within(oneSection).getByText('Content');
      expect(content).toBeInTheDocument();
      const contentValue = within(oneSection).getByText(item?.content);
      expect(contentValue).toBeInTheDocument();
    });
  }, 60000);

  test('submit form with valid values', async () => {
    render(
      <AuthContext.Provider
        value={{
          permissions: permissions,
        }}
      >
        <QuoteSetup />
      </AuthContext.Provider>,
    );
    const input = screen.getByTestId('content');
    await userEvent.type(input, 'something');
    await simulateSelectEvent('quoteType', 1);
    await simulateSelectEvent('variableType', 1);
    await simulateSelectEvent('variableName', 1);
    const saveBtn = screen.getByRole('button', {name: 'Save'});
    userEvent.click(saveBtn);
  }, 60000);
});
