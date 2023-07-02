import {
  render,
  screen,
  within,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {simulateSelectEvent} from '../test-utils/helpers';

import ToDolist from './todo_list';
import project from '../test-utils/msw_mocks/responseData/project';
import projectTask from '../test-utils/msw_mocks/responseData/projectTask';
import moment from 'moment';
import {deleteTodoList, updateTodoList} from './dashboard.api';

jest.mock('./dashboard.api', () => {
  return {
    ...jest.requireActual('./dashboard.api'),
    deleteTodoList: jest.fn(),
    updateTodoList: jest.fn(),
  };
});

describe('Todo list', () => {
  beforeEach(() => {
    deleteTodoList.mockImplementation(async (data) => {
      return Promise.resolve({message: 'Project task deleted successfully'});
    });
    updateTodoList.mockImplementation(async (data) => {
      return Promise.resolve({message: 'Project task updated successfully'});
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  const projectList = project.response.result;
  const projectTaskList = projectTask.response.result;
  const fetchTodoList = jest.fn(() => {
    console.log('fetch todolist has been called');
  });
  test('renders as expected', () => {
    render(
      <ToDolist
        projectList={projectList}
        priorityList={[]}
        fetchtodoCompletedList={fetchTodoList}
        users={[]}
        todoList={projectTaskList}
      />,
    );
    const taskDate = moment(projectTaskList?.[0]?.taskDate).format('DD-MMMM');
    const todoList = screen.getAllByTestId('todoList');
    expect(todoList[0]).toHaveTextContent(taskDate.split('-')[0]);
    expect(todoList[0]).toHaveTextContent(taskDate.split('-')[1]);
    expect(todoList[0]).toHaveTextContent(projectTaskList?.[0]?.postedTime);
    expect(todoList[0]).toHaveTextContent(projectTaskList?.[0]?.assignedToUser);
    expect(todoList[0]).toHaveTextContent(projectTaskList?.[0]?.project);
    expect(todoList[0]).toHaveTextContent(projectTaskList?.[0]?.addTask);
  }, 60000);
  test('submit form with valid values', async () => {
    render(
      <ToDolist
        projectList={projectList}
        priorityList={[]}
        fetchtodoCompletedList={fetchTodoList}
        users={[]}
        todoList={projectTaskList}
      />,
    );
    const Select = screen.getAllByPlaceholderText('Select');
    await userEvent.type(Select[0], moment().format('YYYY-MM-DD'));
    const addTaskInput = screen.getByPlaceholderText('Add task');
    await userEvent.type(addTaskInput, 'For testing');
    await simulateSelectEvent('projectId', 1);
    const saveButton = screen.getByRole('button', {name: 'Save'});
    await userEvent.click(saveButton);
    await waitFor(() => {
      expect(fetchTodoList).toHaveBeenCalledTimes(1);
    });
  }, 60000);
  test('delete todo in dashboard', async () => {
    render(
      <ToDolist
        projectList={projectList}
        priorityList={[]}
        fetchtodoCompletedList={fetchTodoList}
        users={[]}
        todoList={projectTaskList}
      />,
    );
    const todoList = screen.getAllByTestId('todoList');
    const button = within(todoList[0]).getByRole('button');
    userEvent.click(button);
    //open a tooltip
    const actionsMenu = await screen.findByRole('menu');
    expect(actionsMenu).toBeInTheDocument();
    //delete the todo
    const deleteButton = within(actionsMenu).getByRole('button', {name: 'Delete'});
    userEvent.click(deleteButton);
    await waitFor(() => {
      expect(deleteTodoList).toHaveBeenCalledTimes(1);
    });
  });
  test('completed todo in dashboard', async () => {
    render(
      <ToDolist
        projectList={projectList}
        priorityList={[]}
        fetchtodoCompletedList={fetchTodoList}
        users={[]}
        todoList={projectTaskList}
      />,
    );
    const todoList = screen.getAllByTestId('todoList');
    const button = within(todoList[0]).getByRole('button');
    userEvent.click(button);
    //open a tooltip
    const actionsMenu = await screen.findByRole('menu');
    expect(actionsMenu).toBeInTheDocument();
    //delete the todo
    const completedButton = within(actionsMenu).getByRole('button', {
      name: 'Completed',
    });
    userEvent.click(completedButton);
    await waitFor(() => {
      expect(updateTodoList).toHaveBeenCalledTimes(1);
    });
  });
});
