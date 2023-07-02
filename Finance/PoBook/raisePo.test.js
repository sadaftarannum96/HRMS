import {render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RaisePo from './raisePo';
import projectList from 'test-utils/msw_mocks/responseData/projectList';
import {simulateSelectEvent} from 'test-utils/helpers';
import moment from 'moment';
import languages from 'test-utils/msw_mocks/responseData/languages';
import currencyList from 'test-utils/msw_mocks/responseData/currencyList';
import {mapToLabelValue} from 'helpers/helpers';

describe('Raise PO Component', () => {
  const projectListRes = projectList.response.result;
  const suppliersList = [
    {category: 'Agent', label: 'Jobs (Agent)', value: 9},
    {category: 'Vendor', label: 'Farukh (Vendor)', value: 8},
  ];
  const updatedCurrencyList = mapToLabelValue(currencyList.response.result);
  const onCreateOrder = jest.fn();
  test('render as expected', async () => {
    render(<RaisePo projectList={projectListRes} />);
    const projectSelect = screen.getByTestId('projectId');
    expect(projectSelect).toBeInTheDocument();
    const milestoneSelect = screen.getByTestId('milestoneId');
    expect(milestoneSelect).toBeInTheDocument();
    const supplierSelect = screen.getByTestId('supplierId');
    expect(supplierSelect).toBeInTheDocument();
    const categorySelect = screen.getByTestId('category');
    expect(categorySelect).toBeInTheDocument();
    const datePicker = screen.getByLabelText('Job Date*');
    expect(datePicker).toBeInTheDocument();
    const languageSelect = screen.getByTestId('languageId');
    expect(languageSelect).toBeInTheDocument();
    const poNumber = screen.getByLabelText('PO Number');
    expect(poNumber).toBeInTheDocument();
    const talentSelect = screen.getByTestId('talentId');
    expect(talentSelect).toBeInTheDocument();
    const detailsTextarea = screen.getByLabelText('Details');
    expect(detailsTextarea).toBeInTheDocument();
    const oneOffCost = screen.getByLabelText('One-Off Costs');
    expect(oneOffCost).toBeInTheDocument();
    const currencySelect = screen.getByTestId('currencyId');
    expect(currencySelect).toBeInTheDocument();
    const rates = screen.getByLabelText('Rates');
    expect(rates).toBeInTheDocument();
    const rateTypeSelect = screen.getByTestId('rateType');
    expect(rateTypeSelect).toBeInTheDocument();
    const rateInput = screen.getByTestId('rateInput');
    expect(rateInput).toBeInTheDocument();
  });
  test('submit form with valid values', async () => {
    render(
      <RaisePo
        projectList={projectListRes}
        suppliersList={suppliersList}
        poCategoryList={[
          {label: 'Actors/Talent', value: 'Actors/Talent'},
          {label: 'Audit Edit & QA', value: 'Audit Edit & QA'},
        ]}
        languages={languages.response.result}
        currencyList={updatedCurrencyList}
        poRateTypeList={[
          {label: 'Daily', value: 'Daily'},
          {label: 'Hourly', value: 'Hourly'},
          {label: 'Session', value: 'Session'},
        ]}
        buyoutCategoryList={[
          {label: 'Buyout', value: 'Buyout'},
          {label: 'Trailer Buyout', value: 'Trailer Buyout'},
        ]}
        onCreateOrder={onCreateOrder}
      />,
    );
    await simulateSelectEvent('projectId', 1);
    await simulateSelectEvent('milestoneId', 1);
    await simulateSelectEvent('supplierId', 1);
    await simulateSelectEvent('category', 1);
    const datePicker = screen.getByLabelText('Job Date*');
    const date = moment().format('YYYY-MM-DD');
    await userEvent.type(datePicker, date);
    await simulateSelectEvent('languageId', 1);
    const poNumber = screen.getByLabelText('PO Number');
    await userEvent.type(poNumber, '123PO2');
    await simulateSelectEvent('talentId', 1);
    const detailsTextarea = screen.getByLabelText('Details');
    await userEvent.type(detailsTextarea, 'text added for details');
    const oneOffCost = screen.getByLabelText('One-Off Costs');
    await userEvent.type(oneOffCost, '5');
    await simulateSelectEvent('currencyId', 1);
    const rates = screen.getByLabelText('Rates');
    await userEvent.type(rates, '10');
    await simulateSelectEvent('rateType', 1);
    const rateInput = screen.getByTestId('rateInput');
    await userEvent.type(rateInput, '8');
    if (suppliersList[0].category === 'Agent') {
      const buyoutSection = screen.getByTestId('buyOutSection');
      expect(buyoutSection).toBeInTheDocument();
      const unitInput = within(buyoutSection).getByRole('input', {
        name: `buyOutType[0].unit`,
      });
      await userEvent.type(unitInput, '12');
      await simulateSelectEvent(`buyOutType[0].category`, 1);
      const buyoutRateInput = screen.getByRole('input', {
        name: `buyOutType[0].rate`,
      });
      await userEvent.type(buyoutRateInput, '3');
    }
    const saveButton = screen.getByRole('button', {name: 'Save'});
    userEvent.click(saveButton);
    await waitFor(() => {
      expect(onCreateOrder).toHaveBeenCalledTimes(1);
    });
  }, 60000);
});
