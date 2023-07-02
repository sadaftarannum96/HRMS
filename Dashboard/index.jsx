import {useEffect, useContext, useState} from 'react';
import classNames from './dashboard.module.css';
import TopNavBar from 'components/topNavBar';
import {Link} from 'react-router-dom';
import Bulletin from './bulletin';
import {
  getBullitin,
  getFavProjectList,
  removeFavProject,
  fetchNextRecords,
  getLessDataProjectList,
  getTodoList,
  getCompletedList,
  getMoreList,
} from './dashboard.api';
import {DataContext} from '../contexts/data.context';
import {until} from '../helpers/helpers';
import {toastService} from 'erp-react-components';
import ToDolist from './todo_list';
import FavouriteProject from './favouriteProject';
import MyCalendar from './myCalendar';
import {Curtain} from 'erp-react-components';

const Dashboard = (props) => {
  const dataProvider = useContext(DataContext);
  const [loadingBulletin, setLoadingBulletin] = useState(false);
  const [bulletinList, setBulletinList] = useState([]);
  const [favProjectList, setFavProjectList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [projectList, setProjectList] = useState([]);
  const [todoList, setTodoList] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [todoListLoadingMore, setTodoListLoadingMore] = useState(false);
  const [completedListLoadingMore, setCompletedTodoListLoadingMore] =
    useState(false);
  const [todoListNextUrl, setTodoListNextUrl] = useState('');
  const [completedListNextUrl, setCompletedListNextUrl] = useState('');

  useEffect(() => {
    fetchBullitin();
    fetchFavProjectList();
    fetchLessDataProjectList();
    dataProvider.fetchPriorityList();
    fetchtodoCompletedList();
    dataProvider.fetchAllUsersLessData();
  }, []);

  const fetchtodoCompletedList = () => {
    fetchTodoList();
    fetchCompletedList();
  };
  async function fetchLessDataProjectList() {
    const [err, res] = await until(getLessDataProjectList());
    if (err) {
      return console.error(err);
    }
    setProjectList(res.result);
  }

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setFavProjectList(favProjectList.concat(data.result));
    setNextUrl(data.next);
  };

  const fetchTodoList = async () => {
    const [err, data] = await until(getTodoList());
    if (err) {
      return console.error(err);
    }
    setTodoListNextUrl(data.next);
    setTodoList(data.result);
  };

  const fetchCompletedList = async () => {
    const [err, data] = await until(getCompletedList());
    if (err) {
      return console.error(err);
    }
    setCompletedListNextUrl(data.next);
    setCompletedList(data.result);
  };

  const fetchFavProjectList = async () => {
    setLoadingData(true);
    const [err, data] = await until(getFavProjectList());
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setFavProjectList(data.result);
    setNextUrl(data.next);
  };
  let [isOpenNotes, setIsOpenNotes] = useState(false);

  function toggleOpenNotes(type) {
    setIsOpenNotes(!isOpenNotes);
  }
  function closeModalNotes(e) {
    setIsOpenNotes(false);
  }
  const fetchBullitin = async () => {
    setLoadingBulletin(true);
    const [err, data] = await until(getBullitin());
    setLoadingBulletin(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setBulletinList(data.result);
  };

  const handleRemoveFavProject = async (project_id) => {
    const [err, data] = await until(removeFavProject(project_id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchFavProjectList();
    return toastService.success({msg: data.message});
  };

  const fetchMoreNotes = async (type) => {
    setTodoListLoadingMore(true);
    const [err, res] = await until(getMoreList(todoListNextUrl));
    setTodoListLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setTodoListNextUrl(res.next);
    setTodoList(todoList.concat(res.result));
  };

  const fetchMoreCompletedNotes = async () => {
    setCompletedTodoListLoadingMore(true);
    const [err, res] = await until(getMoreList(completedListNextUrl));
    setCompletedTodoListLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setCompletedListNextUrl(res.next);
    setCompletedList(completedList.concat(res.result));
  };

  return (
    <>
      <TopNavBar>
        <li>
          <Link to="#">{'Dashboard'}</Link>
        </li>
      </TopNavBar>{' '}
      <div className={"side-container " + classNames["dashboard-container"]}>
        <div className={'side-custom-scroll flex-grow-1 '}>
          <div className={'pb-0 pr-1 mr-1 ' + classNames['dashbaord_box']}>
            <p className="mb-0 dashboard_title">My Calendar</p>
            <hr className="mt-2 mb-0" />
            <MyCalendar />
          </div>
          <div className="row m-0 mt-3 side-custom-scroll flex-grow-1 pr-1 h-100">
            <div className={"col-md-1_30 pl-0 pr-3 d-flex flex-column side-custom-scroll flex-grow-1  h-100 " + classNames["dashboard-col-res"]}>
              <div
                className={
                  ' d-flex flex-column side-custom-scroll flex-grow-1 h-100 ' +
                  classNames['dashbaord_box']
                }
              >
                <p className="mb-0 dashboard_title">Favourite Projects</p>
                <hr className="mt-2 mb-3" />
                <FavouriteProject
                  favProjectList={favProjectList}
                  handleRemoveFavProject={handleRemoveFavProject}
                  fetchMoreRecords={fetchMoreRecords}
                  loadingData={loadingData}
                  loadingMore={loadingMore}
                />
              </div>
            </div>
            <div className="col-md-8_5 pl-0 pr-0  d-flex flex-column side-custom-scroll flex-grow-1 h-100">
              <div
                className={
                  ' d-flex flex-column side-custom-scroll flex-grow-1 h-100 ' +
                  classNames['dashbaord_box']
                }
              >
                <p className="mb-0 dashboard_title">To do List</p>
                <hr className="mt-2 mb-3" />
                <ToDolist
                  projectList={projectList}
                  priorityList={dataProvider.priorityList}
                  fetchtodoCompletedList={fetchtodoCompletedList}
                  users={dataProvider.usersLessData}
                  todoList={todoList}
                  completedList={completedList}
                  fetchMoreNotes={fetchMoreNotes}
                  todoListLoadingMore={todoListLoadingMore}
                  todoListNextUrl={todoListNextUrl}
                  completedListLoadingMore={completedListLoadingMore}
                  completedListNextUrl={completedListNextUrl}
                  fetchMoreCompletedNotes={fetchMoreCompletedNotes}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bulletin Modal */}
      <Curtain
        isOpen={isOpenNotes}
        onToggleBtnClick={toggleOpenNotes}
        onClose={closeModalNotes}
        title={'Bulletin'}
        toggleBtnText={'Bulletin'}
      >
        <Bulletin
          bulletinList={bulletinList}
          loadingBulletin={loadingBulletin}
        />
      </Curtain>
    </>
  );
};

export default Dashboard;
