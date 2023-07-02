import {render, screen, within, waitFor} from '@testing-library/react';
import Todolist from './todolist';
import {AuthContext} from 'contexts/auth.context';
import profileDetails from 'test-utils/msw_mocks/responseData/projectDetails';
import usersLessData from 'test-utils/msw_mocks/responseData/usersLessData';
import priorityList from 'test-utils/msw_mocks/responseData/priorityList';
import projectTask from 'test-utils/msw_mocks/responseData/projectTask';
import {getTodoList} from './projectTabs.api';
import {act} from 'react-dom/test-utils';
import moment from 'moment';

jest.mock('./projectTabs.api', () => {
  return {
    ...jest.requireActual('./projectTabs.api'),
    getTodoList: jest.fn(),
  };
});
describe('TodoList', () => {
  beforeEach(() => {
    getTodoList.mockImplementation(async (data) => {
      return Promise.resolve({
        message: 'Todo List Fetched Successfully',
        result: projectTask.response.result,
        next: null,
      });
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  const profileDetailsRes = profileDetails.response.result[0];
  const usersLessDataRes = usersLessData.response.result;
  const priorityListRes = priorityList.response.result;
  const upadtedPriorityList =
    Object.keys(priorityListRes).map((o) => ({
      label: priorityListRes[o],
      value: o,
    })) || [];
  test('todo list renders as expected', async () => {
    const permissions = {
      Projects: {
        'Project Details': {isAdd: true, isEdit: true, isView: true},
      },
    };
    await act(async () =>
      render(
        <AuthContext.Provider
          value={{
            permissions: permissions,
          }}
        >
          <Todolist
            projectDetails={profileDetailsRes}
            users={usersLessDataRes}
            priorityList={upadtedPriorityList}
            getProjectList={jest.fn()}
            permissions={permissions}
          />
        </AuthContext.Provider>,
      ),
    );
    await waitFor(() => {
      expect(getTodoList).toHaveBeenCalledTimes(1);
    });
    const todoList = screen.getByText('To do List');
    expect(todoList).toBeInTheDocument();
    const dataSection = screen.getByTestId('data-section');
    const uncompletedData = projectTask.response.result.filter(
      (t) => t.status === 0,
    );
    const uncompletedTask =
      within(dataSection).getAllByRole('uncompleted-task');
    expect(uncompletedTask[0]).toBeInTheDocument();
    const taskDate = moment(uncompletedData?.[0]?.taskDate).format('DD-MMMM');
    expect(uncompletedTask[0]).toHaveTextContent(taskDate.split('-')[0]);
    expect(uncompletedTask[0]).toHaveTextContent(taskDate.split('-')[1]);
    expect(uncompletedTask[0]).toHaveTextContent(
      uncompletedData?.[0]?.postedTime,
    );
    expect(uncompletedTask[0]).toHaveTextContent(
      uncompletedData?.[0]?.assignedToUser,
    );
    expect(uncompletedTask[0]).toHaveTextContent(uncompletedData?.[0]?.addTask);

    //Completed tasks
    const completedData = projectTask.response.result.filter(
      (t) => t.status === 1,
    );
    const completedTask = within(dataSection).getAllByRole('completed-task');
    expect(completedTask[0]).toBeInTheDocument();
    const date = moment(completedData?.[0]?.taskDate).format('DD-MMM');
    expect(completedTask[0]).toHaveTextContent(date.split('-')[0]);
    expect(completedTask[0]).toHaveTextContent(date.split('-')[1]);
    expect(completedTask[0]).toHaveTextContent(completedData?.[0]?.postedTime);
    expect(completedTask[0]).toHaveTextContent(
      completedData?.[0]?.assignedToUser,
    );
    expect(completedTask[0]).toHaveTextContent(completedData?.[0]?.addTask);
  }, 60000);
});
