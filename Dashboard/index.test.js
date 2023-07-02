import React from 'react';
import {fireEvent, render, screen, within} from '@testing-library/react';
import Dashboard from './index';
import {DataContext} from 'contexts/data.context';
import userEvent from '@testing-library/user-event';
import {BrowserRouter as Router} from 'react-router-dom';

describe('Dashboard', () => {
  render(
    <DataContext.Provider
      value={{
        priorityList: [],
        fetchPriorityList: jest.fn(),
        fetchAllUsersLessData: jest.fn(),
      }}
    >
      <Router>
        <Dashboard />
      </Router>
    </DataContext.Provider>,
  );
  test('should render Dashboard', async () => {
    const dashboard = screen.getByText('Dashboard');
    expect(dashboard).toBeInTheDocument();
    const btn = screen.getByRole('button', {name: 'Bulletin'});
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn)
    //here we are cheking modal of bulletIn open or not
    const modalBulletIn = await screen.getByRole('dialog', {name: 'Bulletin'});
    expect(modalBulletIn).toBeInTheDocument();
    expect(modalBulletIn).toHaveTextContent('Bulletin');

    const myCalendar = screen.getByText('My Calendar');
    expect(myCalendar).toBeInTheDocument();
    const fvProjects = screen.getByText('Favourite Projects');
    expect(fvProjects).toBeInTheDocument();
    const toDoList = screen.getByText('To do List');
    expect(toDoList).toBeInTheDocument();
  });
});
