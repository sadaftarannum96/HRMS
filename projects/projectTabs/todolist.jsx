import {useState, useContext, useEffect, useRef} from 'react';
import classNames from './projectTabs.module.css';
import {Image} from 'react-bootstrap';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import {AuthContext} from '../../contexts/auth.context';
import Send from '../../images/Side-images/Icon feather-send.svg';
import {
  until,
  mapToLabelValue,
  cloneObject,
  specialCharacters,
  throttle,
  closeCalendarOnTab,
} from 'helpers/helpers';
import {Formik} from 'formik';
import {
  createTodoList,
  updateTodoList,
  deleteTodoList,
  getCompletedList,
  getTodoList,
  getMoreList,
} from './projectTabs.api';
import {toastService} from 'erp-react-components';
import {Loading} from 'components/LoadingComponents/loading';
import Add from '../../images/Side-images/Icon-feather-plus.svg';
import {CustomSelect} from 'erp-react-components';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import SelectDropdownArrows from 'components/selectDropdownArrows';

const _initialvalues = {
  addTask: '',
  assignTo: null,
  priority: null,
  taskDate: '',
};

const Todolist = (props) => {
  const {permissions} = useContext(AuthContext);
  const [isEditSelected, setIsEditSelected] = useState(false);
  const [popmanageid, setpopmanageid] = useState('');
  const [defaultValues, setDefaultValues] = useState(_initialvalues);
  const [editDefaultValues, setEditDefaultValues] = useState(_initialvalues);
  const [editId, setEditId] = useState(null);
  const [todoList, setTodoList] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [todoListLoadingMore, setTodoListLoadingMore] = useState(false);
  const [completedListLoadingMore, setCompletedTodoListLoadingMore] =
    useState(false);
  const [todoListNextUrl, setTodoListNextUrl] = useState('');
  const [completedListNextUrl, setCompletedListNextUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const datePickerRef = useRef();

  const {projectDetails} = props || {};

  const fetchTodoCompletedList = () => {
    fetchTodoList();
    fetchCompletedList();
  };

  useEffect(() => {
    if (projectDetails?.id) fetchTodoCompletedList();
  }, [projectDetails?.id]);

  const fetchTodoList = async () => {
    const [err, data] = await until(getTodoList(projectDetails?.id));
    if (err) {
      return console.error(err);
    }
    setTodoListNextUrl(data.next);
    setTodoList(data.result);
  };

  const fetchCompletedList = async () => {
    const [err, data] = await until(getCompletedList(projectDetails?.id));
    if (err) {
      return console.error(err);
    }
    setCompletedListNextUrl(data.next);
    setCompletedList(data.result);
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

  const schema = yup.lazy(() =>
    yup.object().shape({
      addTask: yup
        .string()
        .required('Enter task')
        .test(
          'addTask',
          'Special character is not allowed at first place',
          (value) => !specialCharacters.includes(value?.[0]),
        )
        .max(250, 'Maximum of 250 characters')
        .nullable(),
      assignTo: yup.string().required('Select assign').nullable(),
      priority: yup.string().required('Select priority').nullable(),
      taskDate: yup.string().required('Select date').nullable(),
    }),
  );
  const onEditList = (id) => {
    setIsEditSelected(true);
    setEditId(id);
    const filteredData = todoList.filter((d) => d.id === id);
    if (filteredData.length > 0) {
      const data = filteredData[0];
      setEditDefaultValues({
        ...editDefaultValues,
        addTask: data.addTask,
        assignTo: data.assignTo,
        priority: data.priority,
        taskDate: moment(data.taskDate).toDate(),
        id: id,
      });
    }
  };

  const onDeleteList = async (id) => {
    const [err, res] = await until(deleteTodoList(id));
    if (err) {
      return toastService.error({msg: res.message});
    }
    fetchTodoCompletedList();
    // props.getProjectList(props.projectDetails.id);
    setDefaultValues(_initialvalues);
    return toastService.success({msg: res.message});
  };

  const onTaskCompleted = async (id, data) => {
    const formValues = {
      // addTask: data.task,
      // assignTo: data.sideUserId,
      // priority: data.priority,
      // taskDate: data.taskDate,
      status: true,
    };
    const [err, res] = await until(updateTodoList(id, formValues));
    if (err) {
      return toastService.error({msg: err.message});
    }
    fetchTodoCompletedList();
    // props.getProjectList(props.projectDetails.id);
    return toastService.success({msg: res.message});
  };

  const onSubmitForm = async (_dataForm, resetForm, isEdit) => {
    const dataForm = cloneObject(_dataForm);
    for (var i in dataForm) {
      dataForm[i] = dataForm[i] && dataForm[i] !== '' ? dataForm[i] : null;
      if (['id'].includes(i)) {
        delete dataForm[i];
      }
      if (['taskDate'].includes(i)) {
        dataForm[i] =
          dataForm[i] && dataForm[i] !== ''
            ? moment(_dataForm[i]).format('YYYY-MM-DD')
            : null;
      }
    }
    setIsSubmitting(true);
    const [err, res] = await until(
      _dataForm?.id
        ? updateTodoList(_dataForm?.id, dataForm)
        : createTodoList({
            ...dataForm,
            projectId: projectDetails?.id,
            fromDashboard: false,
          }),
    );
    setIsSubmitting(false);
    if (err) {
      return toastService.error({
        msg: err.message,
      });
    }
    if (isEdit) {
      setIsEditSelected(false);
      setEditId(null);
      setpopmanageid(null);
      setEditDefaultValues(_initialvalues);
    } else {
      setDefaultValues(_initialvalues);
    }
    resetForm();
    fetchTodoCompletedList();
    return toastService.success({msg: res.message});
  };

  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );

  const {users, priorityList} = props;
  return (
    <>
      <div>
        <p
          className={classNames['project_title']}
          style={{fontSize: '0.875rem'}}
        >
          To do List
        </p>
        <div
          className={classNames['doc-milestone-box']}
          data-testid="data-section"
        >
          <div
            onScroll={throttled.current}
            className={
              'side-custom-scroll pr-1 flex-grow-1 ' + classNames["doc-milestone-scroll"]
            }
          >
            {/* Unchecked */}
            {todoList
              .filter((o) => o.status === 0)
              .map((list) => {
                const date = moment(list.taskDate).format('DD');
                const month = moment(list.taskDate).format('MMM');
                const accessBtnList = [];
                const anotherBtnList = [];
                const deleteBtn = {
                  onclick: () => onDeleteList(list.id),
                  label: 'Delete',
                  show: true,
                };
                const completedBtn = {
                  onclick: () => onTaskCompleted(list.id, list),
                  label: 'Completed',
                  show: true,
                };
                if (
                  list.taskDate >= moment(new Date()).format('YYYY-MM-DD') &&
                  permissions['Projects']?.['Project Details']?.isEdit
                ) {
                  accessBtnList.push({
                    onclick: () => {
                      onEditList(list.id);
                      setpopmanageid(null);
                    },
                    label: 'Edit',
                    show: true,
                  });
                }

                if (permissions['Projects']?.['Project Details']?.isEdit) {
                  accessBtnList.push(deleteBtn, completedBtn);
                }
                const buttonsList =
                  list.status === 0 ? accessBtnList : anotherBtnList;
                return (
                  <>
                    {isEditSelected && editId === list.id ? (
                      <div className={'mb-3 ' + classNames['doc-todoList-box']}>
                        <Formik
                          initialValues={editDefaultValues}
                          enableReinitialize={true}
                          onSubmit={async (_dataForm, {resetForm}) => {
                            onSubmitForm(_dataForm, resetForm, true);
                          }}
                          validationSchema={schema}
                        >
                          {({
                            values,
                            handleSubmit,
                            handleChange,
                            setFieldValue,
                            setFieldTouched,
                            errors,
                            status,
                            touched,
                            initialValues,
                          }) => {
                            const formErrors = {};
                            status = status || {};
                            for (var f in initialValues) {
                              if (touched[f]) {
                                formErrors[f] = errors[f] || status[f];
                              }
                            }
                            return (
                              <form onSubmit={handleSubmit}>
                                <div className="d-flex justify-content-between">
                                  <div
                                    className={
                                      classNames['todolist_box'] +
                                      ' ' +
                                      classNames['calendar_box']
                                    }
                                  >
                                    <div className="side-datepicker">
                                      <DatePicker
                                        ref={datePickerRef}
                                        name="taskDate"
                                        placeholderText="Select Date"
                                        autoComplete="off"
                                        calendarIcon
                                        dateFormat="yyyy-MM-dd"
                                        className="side_date "
                                        onBlur={() => {}}
                                        onChange={(dateObj) =>
                                          setFieldValue('taskDate', dateObj)
                                        }
                                        minDate={new Date()}
                                        selected={values.taskDate || null}
                                        peekNextMonth
                                        showMonthDropdown
                                        showYearDropdown
                                        scrollableYearDropdown
                                        yearDropdownItemNumber={50}
                                        disabled={
                                          !permissions['Projects']?.[
                                            'Project Details'
                                          ]?.isAdd && !isEditSelected
                                        }
                                        onKeyDown={(e) =>
                                          closeCalendarOnTab(e, datePickerRef)
                                        }
                                        preventOpenOnFocus={true}
                                        onFocus={(e) => e.target.blur()}
                                      />
                                      {formErrors.taskDate && (
                                        <span
                                          className={
                                            'text-danger input-error-msg ' +
                                            classNames['date-error']
                                          }
                                        >
                                          {formErrors.taskDate}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div
                                    className={
                                      'w-100 ' + classNames['add_task_box']
                                    }
                                    style={{
                                      paddingRight: '1.875rem',
                                      padding: '0.875rem 1rem ',
                                    }}
                                  >
                                    <div className="d-flex  justify-content-between">
                                      <div className="d-flex ">
                                        <div
                                          style={{marginTop: '0.35rem'}}
                                          className={
                                            'mr-2 ' + classNames['add_task']
                                          }
                                        >
                                          <Image src={Add} className="" />
                                        </div>
                                        <div className="d-flex flex-column position-relative">
                                          <textarea
                                            name="addTask"
                                            style={{resize: 'none'}}
                                            rows="1"
                                            cols="120"
                                            className={
                                              'side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area  ' +
                                              classNames['add-task_input']
                                            }
                                            autoComplete="off"
                                            placeholder="Add task"
                                            value={values.addTask}
                                            onChange={handleChange}
                                            disabled={
                                              !permissions['Projects']?.[
                                                'Project Details'
                                              ]?.isAdd && !isEditSelected
                                            }
                                          />
                                          {formErrors.addTask && (
                                            <span
                                              className="text-danger input-error-msg add-task-error pl-3"
                                              style={{marginTop: '0rem'}}
                                              disabled={
                                                !permissions['Projects']?.[
                                                  'Project Details'
                                                ]?.isAdd && !isEditSelected
                                              }
                                            >
                                              {formErrors.addTask}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="d-flex ">
                                        <div
                                          style={{borderLeft: '0px solid'}}
                                          className={
                                            'px-0 ' +
                                            classNames['separator-lines']
                                          }
                                        >
                                          <div className="d-flex  ">
                                            <div
                                              className={
                                                classNames['todo-list-user']
                                              }
                                            >
                                              <p
                                                className="mb-0 pl-3"
                                                style={{
                                                  whiteSpace: 'nowrap',
                                                  paddingTop: '0.565rem',
                                                }}
                                              >
                                                Assign To
                                              </p>
                                            </div>
                                            <div
                                              className={
                                                'side-form-group mb-0 mr-3 ' +
                                                classNames['prior-gap']
                                              }
                                            >
                                              <div className="d-block">
                                                <div
                                                  className={
                                                    classNames[
                                                      'priority-select'
                                                    ]
                                                  }
                                                >
                                                  <CustomSelect
                                                    name="assignTo"
                                                    options={mapToLabelValue(
                                                      users ? users : [],
                                                    )}
                                                    placeholder={'Select'}
                                                    menuPosition="bottom"
                                                    renderDropdownIcon={
                                                      SelectDropdownArrows
                                                    }
                                                    onChange={(value) =>
                                                      setFieldValue(
                                                        'assignTo',
                                                        value,
                                                      )
                                                    }
                                                    onBlur={(name) =>
                                                      setFieldTouched(name)
                                                    }
                                                    value={values.assignTo}
                                                    disabled={
                                                      !permissions[
                                                        'Projects'
                                                      ]?.['Project Details']
                                                        ?.isAdd &&
                                                      !isEditSelected
                                                    }
                                                    searchOptions={true}
                                                    unselect={false}
                                                  />
                                                </div>
                                                {errors.assignTo &&
                                                  Object.keys(touched).length >
                                                    0 && (
                                                    <span className="text-danger input-error-msg">
                                                      {errors.assignTo}
                                                    </span>
                                                  )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div
                                          className={
                                            'px-0 ' +
                                            classNames['separator-lines']
                                          }
                                        >
                                          <div className="d-flex">
                                            <div
                                              className={
                                                classNames['todo-list-user']
                                              }
                                            >
                                              <p
                                                className="mb-0 pl-3"
                                                style={{
                                                  paddingTop: '0.565rem',
                                                }}
                                              >
                                                Priority
                                              </p>
                                            </div>
                                            <div
                                              className={
                                                'side-form-group mb-0 mr-3 ' +
                                                classNames['prior-gap']
                                              }
                                            >
                                              <div className="d-block">
                                                <div
                                                  className={
                                                    classNames[
                                                      'priority-select'
                                                    ]
                                                  }
                                                >
                                                  <CustomSelect
                                                    name="priority"
                                                    options={priorityList}
                                                    placeholder={'Select'}
                                                    menuPosition="bottom"
                                                    renderDropdownIcon={
                                                      SelectDropdownArrows
                                                    }
                                                    value={values.priority}
                                                    onChange={(value) =>
                                                      setFieldValue(
                                                        'priority',
                                                        value,
                                                      )
                                                    }
                                                    disabled={
                                                      !permissions[
                                                        'Projects'
                                                      ]?.['Project Details']
                                                        ?.isAdd &&
                                                      !isEditSelected
                                                    }
                                                    unselect={false}
                                                  />
                                                </div>
                                                {errors.priority &&
                                                  Object.keys(touched).length >
                                                    0 && (
                                                    <span className="text-danger input-error-msg">
                                                      {errors.priority}
                                                    </span>
                                                  )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="d-flex align-self-center ml-3">
                                    <button
                                      type="button"
                                      className="btn btn-primary "
                                      onClick={
                                        !(
                                          !permissions['Projects']?.[
                                            'Project Details'
                                          ]?.isAdd && !isEditSelected
                                        )
                                          ? handleSubmit
                                          : () => {}
                                      }
                                      disabled={isSubmitting}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              </form>
                            );
                          }}
                        </Formik>
                      </div>
                    ) : (
                      <div
                        className="mb-3 d-flex justify-content-between"
                        key={list.id}
                        role="uncompleted-task"
                      >
                        <div
                          className={
                            classNames['todolist_box'] +
                            ' ' +
                            classNames['date_box']
                          }
                        >
                          <div className="text-center">
                            <span>{date}</span>
                            <p className="mb-0">{month}</p>
                          </div>
                        </div>

                        <div
                          className={'w-100 ' + classNames['todolist_box']}
                          style={{paddingRight: '1.875rem'}}
                        >
                          <div className="d-flex w-100  justify-content-between">
                            <div className="d-flex w-90 align-items-center">
                              <div
                                className={
                                  'side-custom-control side-custom-checkbox pl-0 mr-4 ' +
                                  classNames['todo-check']
                                }
                              >
                                <input
                                  type="checkbox"
                                  tabIndex={'0'}
                                  className="side-custom-control-input"
                                  id="todoUnchecked"
                                  name="todoUnchecked"
                                  checked={list.status === 1}
                                  onChange={() => {
                                    list.status === 0 &&
                                      onTaskCompleted(list.id, list);
                                  }}
                                />
                                <label
                                  className={
                                    'side-custom-control-label ' +
                                    classNames[
                                      list.status === 1
                                        ? 'label-text'
                                        : 'label-text-empty'
                                    ]
                                  }
                                  style={{cursor: 'pointer'}}
                                  htmlFor="todoUnchecked"
                                >
                                  {/* checkbox  */}
                                </label>
                              </div>
                              <div
                                className={
                                  classNames['todo-list-user'] +
                                  ' ' +
                                  classNames['todo-list-user-gap']
                                }
                              >
                                <span>{list.postedTime}</span>
                                <p className="mb-0 truncate">
                                  {list.assignedToUser}
                                </p>
                              </div>
                              <p
                                className={"mb-0 projects-todo-des side-custom-scroll pr-1 " + 
                                  classNames[
                                    list.status === 1
                                      ? 'todo-dis-checked'
                                      : 'todo-dis'
                                  ]
                                }
                              >
                                {list.addTask}
                              </p>
                            </div>
                            <div
                              className={
                                'd-flex align-items-center ml-3 ' +
                                classNames['dots-width']
                              }
                            >
                              {list.status === 0 && (
                                <>
                                  <div className={classNames['todo-list-user']}>
                                    <p className="mb-0">Priority</p>
                                  </div>
                                  <div
                                    className={
                                      'side-form-group mb-0 ml-4 mr-5 pr-3 ' +
                                      classNames['prior-gap']
                                    }
                                  >
                                    <p
                                      className={
                                        'mb-0 ' + classNames['prior-width']
                                      }
                                    >
                                      {list.priority}
                                    </p>
                                  </div>
                                </>
                              )}
                              {permissions['Projects']?.['Project Details']
                                ?.isEdit &&
                                buttonsList.length > 0 && (
                                  <CustomDropDown
                                    menuItems={buttonsList}
                                    dropdownClassNames={
                                      classNames['todoList-dropdown']
                                    }
                                    onScrollHide={true}
                                  >
                                    {({isOpen}) => {
                                      return (
                                        <>
                                          <Image
                                            src={isOpen ? vDotsgreen : vDots}
                                          />
                                        </>
                                      );
                                    }}
                                  </CustomDropDown>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })}
            <div style={{textAlign: 'center'}}>
              {todoList.length ? (
                todoListLoadingMore ? (
                  <Loading />
                ) : (
                  todoListNextUrl && (
                    <button
                      className={'btn btn-primary showMoreBtn mb-3 '}
                      onClick={fetchMoreNotes}
                    >
                      {'Show More....'}
                    </button>
                  )
                )
              ) : (
                <></>
              )}
            </div>
            {completedList.filter((o) => o.status !== 0).length > 0 && (
              <p
                className={classNames['project_title']}
                style={{fontSize: '0.875rem'}}
              >
                Completed
              </p>
            )}
            {completedList
              .filter((o) => o.status !== 0)
              .map((list) => {
                const date = moment(list.taskDate).format('DD');
                const month = moment(list.taskDate).format('MMM');
                const accessBtnList = [];
                const anotherBtnList = [];
                const editbtn = {
                  onclick: () => {
                    onEditList(list.id);
                  },
                  label: 'Edit',
                  show: true,
                };
                const deleteBtn = {
                  onclick: () => onDeleteList(list.id),
                  label: 'Delete',
                  show: true,
                };
                const completedBtn = {
                  onclick: () => onTaskCompleted(list.id, list),
                  label: 'Completed',
                  show: true,
                };

                if (permissions['Projects']?.['Project Details']?.isEdit) {
                  accessBtnList.concat(editbtn, deleteBtn, completedBtn);
                }

                const buttonsList =
                  list.status === 0 ? accessBtnList : anotherBtnList;
                return (
                  <div
                    className="mb-3 d-flex justify-content-between"
                    key={list.id}
                    role="completed-task"
                  >
                    <div
                      className={
                        classNames['todolist_box'] +
                        ' ' +
                        classNames['date_box']
                      }
                    >
                      <div className="text-center">
                        <span>{date}</span>
                        <p className="mb-0">{month}</p>
                      </div>
                    </div>

                    <div
                      className={'w-100 ' + classNames['todolist_box']}
                      style={{paddingRight: '1.875rem'}}
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <div className="d-flex align-items-center">
                          <div
                            className={
                              'side-custom-control side-custom-checkbox pl-0 mr-4 ' +
                              classNames['todo-check']
                            }
                          >
                            <input
                              type="checkbox"
                              tabIndex={'0'}
                              className="side-custom-control-input"
                              id="todoCompleted"
                              name="todoCompleted"
                              checked={list.status === 1}
                              readOnly
                            />
                            <label
                              className={
                                'side-custom-control-label ' +
                                classNames[
                                  list.status === 1
                                    ? 'label-text'
                                    : 'label-text-empty'
                                ]
                              }
                              htmlFor="todoCompleted"
                            ></label>
                          </div>
                          <div
                            className={
                              classNames['todo-list-user'] +
                              ' ' +
                              classNames['todo-list-user-gap']
                            }
                          >
                            <span>{list.postedTime}</span>
                            <p className="mb-0 truncate">
                              {list.assignedToUser}
                            </p>
                          </div>
                          <p
                            className={"mb-0 projects-todo-des side-custom-scroll pr-1 " + 
                              classNames[
                                list.status === 1
                                  ? 'todo-dis-checked'
                                  : 'todo-dis'
                              ]
                            }
                          >
                            {list.addTask}
                          </p>
                        </div>
                        <div
                          className={
                            'd-flex align-items-center ml-3 ' +
                            classNames['dots-width']
                          }
                        >
                          {list.status === 0 && (
                            <>
                              <div className={classNames['todo-list-user']}>
                                <p className="mb-0">Priority</p>
                              </div>
                              <div
                                className={
                                  'side-form-group mb-0 ml-4 mr-5 pr-3 ' +
                                  classNames['prior-gap']
                                }
                              >
                                <p className="mb-0">{list.priority}</p>
                              </div>
                            </>
                          )}
                          {buttonsList.length > 0 && (
                            <CustomDropDown
                              menuItems={buttonsList}
                              dropdownClassNames={
                                classNames['Favourite_dropdown']
                              }
                              onScrollHide={true}
                            >
                              {({isOpen}) => {
                                return (
                                  <>
                                    <Image src={isOpen ? vDotsgreen : vDots} />
                                  </>
                                );
                              }}
                            </CustomDropDown>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            <div style={{textAlign: 'center'}}>
              {completedList.length ? (
                completedListLoadingMore ? (
                  <Loading />
                ) : (
                  completedListNextUrl && (
                    <button
                      className={'btn btn-primary showMoreBtn mb-3 '}
                      onClick={fetchMoreCompletedNotes}
                    >
                      {'Show More....'}
                    </button>
                  )
                )
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>

        {(permissions['Projects']?.['Project Details']?.isAdd ||
          permissions['Projects']?.['Project Details']?.isEdit) && (
          <div
            className={classNames['doc-milestone-box']}
            style={{borderTop: 'unset'}}
          >
            <Formik
              initialValues={defaultValues}
              enableReinitialize={true}
              onSubmit={async (_dataForm, {resetForm}) => {
                onSubmitForm(_dataForm, resetForm, false);
              }}
              validationSchema={schema}
            >
              {({
                values,
                handleSubmit,
                handleChange,
                setFieldValue,
                setFieldTouched,
                errors,
                status,
                touched,
                initialValues,
              }) => {
                const formErrors = {};
                status = status || {};
                for (var f in initialValues) {
                  if (touched[f]) {
                    formErrors[f] = errors[f] || status[f];
                  }
                }
                return (
                  <form onSubmit={handleSubmit}>
                    <div className="d-flex justify-content-between">
                      <div
                        className={
                          classNames['todolist_box'] +
                          ' ' +
                          classNames['calendar_box']
                        }
                      >
                        <div className="side-datepicker">
                          <DatePicker
                            ref={datePickerRef}
                            name="taskDate"
                            placeholderText="Select Date"
                            autoComplete="off"
                            calendarIcon
                            dateFormat="yyyy-MM-dd"
                            className="side_date "
                            onBlur={() => {}}
                            onChange={(dateObj) =>
                              setFieldValue('taskDate', dateObj)
                            }
                            minDate={new Date()}
                            selected={values.taskDate || null}
                            peekNextMonth
                            showMonthDropdown
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={50}
                            disabled={
                              !permissions['Projects']?.['Project Details']
                                ?.isAdd && !isEditSelected
                            }
                            onKeyDown={(e) =>
                              closeCalendarOnTab(e, datePickerRef)
                            }
                            preventOpenOnFocus={true}
                            onFocus={e => e.target.blur()}
                          />
                          {formErrors.taskDate && (
                            <span
                              className={
                                'text-danger input-error-msg ' +
                                classNames['date-error']
                              }
                            >
                              {formErrors.taskDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={'w-100 ' + classNames['add_task_box']}
                        style={{
                          paddingRight: '1.875rem',
                          padding: '0.875rem 1rem ',
                        }}
                      >
                        <div className="d-flex  justify-content-between">
                          <div className="d-flex ">
                            <div
                              style={{marginTop: '0.35rem'}}
                              className={'mr-2 ' + classNames['add_task']}
                            >
                              <Image src={Add} className="" />
                            </div>
                            <div className="d-flex flex-column position-relative ">
                              <textarea
                                name="addTask"
                                style={{resize: 'none'}}
                                rows="1"
                                cols="120"
                                autoComplete="off"
                                className={
                                  'side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area  ' +
                                  classNames['add-task_input']
                                }
                                placeholder="Add task"
                                value={values.addTask}
                                onChange={handleChange}
                                disabled={
                                  !permissions['Projects']?.['Project Details']
                                    ?.isAdd && !isEditSelected
                                }
                              />
                              {formErrors.addTask && (
                                <span
                                  className="text-danger input-error-msg add-task-error pl-3"
                                  style={{marginTop: '0rem'}}
                                  disabled={
                                    !permissions['Projects']?.[
                                      'Project Details'
                                    ]?.isAdd && !isEditSelected
                                  }
                                >
                                  {formErrors.addTask}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="d-flex ">
                            <div
                              style={{borderLeft: '0px solid'}}
                              className={
                                'px-0 ' + classNames['separator-lines']
                              }
                            >
                              <div className="d-flex  ">
                                <div className={classNames['todo-list-user']}>
                                  <p
                                    className="mb-0 pl-3"
                                    style={{
                                      whiteSpace: 'nowrap',
                                      paddingTop: '0.565rem',
                                    }}
                                  >
                                    Assign To
                                  </p>
                                </div>
                                <div
                                  className={
                                    'side-form-group mb-0 mr-3 ' +
                                    classNames['prior-gap']
                                  }
                                >
                                  <div className="d-block">
                                    <div
                                      className={classNames['priority-select']}
                                    >
                                      <CustomSelect
                                        name="assignTo"
                                        options={mapToLabelValue(
                                          users ? users : [],
                                        )}
                                        placeholder={'Select'}
                                        menuPosition="auto"
                                        renderDropdownIcon={
                                          SelectDropdownArrows
                                        }
                                        onChange={(value) =>
                                          setFieldValue('assignTo', value)
                                        }
                                        value={values.assignTo}
                                        disabled={
                                          !permissions['Projects']?.[
                                            'Project Details'
                                          ]?.isAdd && !isEditSelected
                                        }
                                        searchOptions={true}
                                        unselect={false}
                                      />
                                    </div>
                                    {errors.assignTo &&
                                      Object.keys(touched).length > 0 && (
                                        <span className="text-danger input-error-msg">
                                          {errors.assignTo}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div
                              className={
                                'px-0 ' + classNames['separator-lines']
                              }
                            >
                              <div className="d-flex">
                                <div className={classNames['todo-list-user']}>
                                  <p
                                    className="mb-0 pl-3"
                                    style={{paddingTop: '0.565rem'}}
                                  >
                                    Priority
                                  </p>
                                </div>
                                <div
                                  className={
                                    'side-form-group mb-0 mr-3 ' +
                                    classNames['prior-gap']
                                  }
                                >
                                  <div className="d-block">
                                    <div
                                      className={classNames['priority-select']}
                                    >
                                      <CustomSelect
                                        name="priority"
                                        options={priorityList}
                                        placeholder={'Select'}
                                        menuPosition="auto"
                                        renderDropdownIcon={
                                          SelectDropdownArrows
                                        }
                                        value={values.priority}
                                        onChange={(value) =>
                                          setFieldValue('priority', value)
                                        }
                                        disabled={
                                          !permissions['Projects']?.[
                                            'Project Details'
                                          ]?.isAdd && !isEditSelected
                                        }
                                        unselect={false}
                                      />
                                    </div>
                                    {errors.priority &&
                                      Object.keys(touched).length > 0 && (
                                        <span className="text-danger input-error-msg">
                                          {errors.priority}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className={classNames['sendIcon-button']}
                              onClick={
                                !(
                                  !permissions['Projects']?.['Project Details']
                                    ?.isAdd && !isEditSelected
                                )
                                  ? handleSubmit
                                  : () => {}
                              }
                              disabled={isSubmitting}
                            >
                              <Image src={Send} className="ml-0 send_Icon" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        )}

        {/* need confirmation to remove it */}
        {/* <div className="d-flex justify-content-end pt-30 mb-1">
          <Button
            type="button"
            variant="secondary"
            className="side-custom-button mr-2"
            onClick={() => {}}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="">
            Save
          </Button>
        </div> */}
      </div>
    </>
  );
};

export default Todolist;
