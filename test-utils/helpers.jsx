import {
  within,
  screen,
  render,
  waitFor,
  waitForElementToBeRemoved,
  act,
  fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {MemoryRouter} from 'react-router-dom';

export async function simulateSelectEvent(
  testId,
  optionNumTobeSelected,
  options,
) {
  const dropdownTestId = testId + '-dropdown';
  if (typeof optionNumTobeSelected !== 'number')
    throw (
      'Please pass index arg to simulateSelectEvent; currently, arguments passed are - testId:' +
      testId +
      ', optionSelected' +
      optionNumTobeSelected
    );
  const selectInput = (
    options?.container ? within(options?.container) : screen
  ).getByTestId(testId);

  // const optionIdxTobeSelected = selectInput.classList.contains('is-multi-select') ? optionNumTobeSelected : optionNumTobeSelected - 1;

  expect(selectInput).toBeInTheDocument();
  const selectClickTarget = within(selectInput).getByRole('button');
  userEvent.click(selectClickTarget);
  // console.log(testId);
  const dropdown = await screen.findByRole('listbox', {
    testId: testId + '-dropdown',
  });
  expect(dropdown).toBeInTheDocument();
  await waitFor(() => {
    const w = within(dropdown).queryByText('No Options');
    if (w) screen.debug(dropdown, 10000);
    expect(w).not.toBeInTheDocument();
  });

  const optionElements = await within(dropdown).findAllByRole('listitem');
  if (!optionElements?.length) {
    screen.debug(dropdown, 1000);
  }
  expect(optionElements.length).toBeGreaterThanOrEqual(1);
  const optionIdxTobeSelected =
    optionElements[0].textContent === 'Select All'
      ? optionNumTobeSelected
      : optionNumTobeSelected - 1;
  jest.useFakeTimers(); //settitmeout is used in select component, to emitChange

  if (
    !optionElements[optionIdxTobeSelected].getAttribute('aria-selected') ||
    optionElements[optionIdxTobeSelected].getAttribute('aria-selected') ===
      'false'
  ) {
    fireEvent.click(optionElements[optionIdxTobeSelected]);
  }
  act(() => {
    jest.advanceTimersByTime(10);
  });
  await waitFor(() => {
    // screen.debug(selectClickTarget, 10000);
    expect(selectClickTarget).toHaveTextContent(
      optionElements[optionIdxTobeSelected].textContent,
    );
  });

  const dropdownMenu = screen.queryByRole('listbox', {testId: dropdownTestId});
  if (dropdownMenu) {
    //close popup incase of multiselect
    userEvent.click(document.body);
    await waitFor(() => {
      expect(
        screen.queryByRole('listbox', {testId: dropdownTestId}),
      ).toBeNull();
    });
  }
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  document.body.click();
  // screen.debug(selectClickTarget)
}

export async function querySelectInputByTestId(testId) {
  if (typeof testId !== 'number')
    throw (
      'Please pass testId arg to querySelectInputByTestId; currently, arguments passed are - testId:' +
      testId
    );
  const selectInput = await screen.findByTestId(testId);
  const selectClickTarget = within(selectInput).getByRole('button'); //,{
  userEvent.click(selectClickTarget);
  const dropdown = await screen.findByRole('listbox', {testId: testId});
  // await waitFor(async ()=>{
  //   const w = await within(dropdown).queryByText('No Options')
  //   expect(w).not.toBeInTheDocument()
  // })
  const optionElements = await within(dropdown).getAllByRole('listitem');
  return {selectClickTarget, dropdown, optionElements};
}

export const renderWithRouter = (
  ui,
  {route = '/', history, container} = {},
) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <>
      <MemoryRouter initialEntries={[route || '/users']}>{ui}</MemoryRouter>
    </>,
    {container},
  );
};
