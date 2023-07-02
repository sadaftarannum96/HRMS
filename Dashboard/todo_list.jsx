import React, {useRef, useState} from 'react';
import classNames from '../projects/projectTabs/projectTabs.module.css';
import {Image} from 'react-bootstrap';
import * as yup from 'yup';
import {CustomSelect, toastService} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import DatePicker from 'react-datepicker';
import {Loading} from 'components/LoadingComponents/loading';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import Add from '../images/Side-images/Icon-feather-plus.svg';
import {
  until,
  mapToLabelValue,
  cloneObject,
  specialCharacters,
  throttle,
  closeCalendarOnTab,
} from '../helpers/helpers';
import {Formik} from 'formik';
import {createTodoList, updateTodoList, deleteTodoList} from './dashboard.api';
import styles from './dashboard.module.css';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';

const _initialvalues = {
  addTask: '',
  projectId: null,
  assignTo: null,
  taskDate: '',
};

const TodoList = (props) => {
  const {
    projectList,
    todoList,
    completedList,
    todoListLoadingMore,
    todoListNextUrl,
    completedListLoadingMore,
    completedListNextUrl,
  } = props;
  const [popmanageid, setpopmanageid] = useState('');
  const [defaultValues, setDefaultValues] = useState(_initialvalues);
  const [editDefaultValues, setEditDefaultValues] = useState(_initialvalues);
  const [isEditSelected, setIsEditSelected] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const datePickerRef = useRef();

  const schema = yup.lazy(() =>
    yup.object().shape({
      addTask: yup
        .string()
        .required('Enter task')
        .max(250, 'Maximum of 250 characters')
        .test(
          'addTask',
          'Special character is not allowed at first place',
          (value) => !specialCharacters.includes(value?.[0]),
        )
        .nullable(),
      projectId: yup.string().notRequired('Select project').nullable(),
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
        projectId: data.projectId,
        assignTo: data.assignTo,
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
    props.fetchtodoCompletedList();
    setDefaultValues(_initialvalues);
    return toastService.success({msg: res.message});
  };

  const onTaskCompleted = async (id, data) => {
    const formValues = {
      status: true,
    };
    const [err, res] = await until(updateTodoList(id, formValues));
    if (err) {
      return toastService.error({msg: err.message});
    }
    props.fetchtodoCompletedList();
    return toastService.success({msg: res.message});
  };

  const onSubmitForm = async (_dataForm, resetForm, isEdit) => {
    const currentUserId = localStorage.getItem('currentUserId');
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
      if (['assignTo'].includes(i)) {
        dataForm[i] = currentUserId;
      }
    }

    const apiId = _dataForm.id ? _dataForm.id : null;
    setIsSubmitting(true);
    const [err, res] = await until(
      apiId
        ? updateTodoList(apiId, dataForm)
        : createTodoList({
            ...dataForm,
            fromDashboard: true,
          }),
    );
    setIsSubmitting(false);
    if (err) {
      return toastService.error({
        msg: err.message,
      });
    }
    resetForm();
    props.fetchtodoCompletedList();
    if (isEdit) {
      setIsEditSelected(false);
      setEditId(null);
      setpopmanageid(null);
      setEditDefaultValues(_initialvalues);
    } else {
      setDefaultValues(_initialvalues);
    }
    return toastService.success({msg: res.message});
  };

  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );

  return (
    <div className="d-flex flex-column flex-grow-1 side-custom-scroll h-100">
      <div
        className={
          'd-flex flex-column flex-grow-1 side-custom-scroll h-100 ' +
          classNames['doc-milestone-box']
        }
      >
        <div
          onScroll={throttled.current}
          className={'side-custom-scroll pr-1_5 flex-grow-1  '}
        >
          {/* Unchecked */}
          {todoList
            ?.filter((o) => o.status === 0)
            .map((list) => {
              const date = moment(list.taskDate).format('DD');
              const month = moment(list.taskDate).format('MMM');
              const accessBtnList = [];
              const anotherBtnList = [];
              const editbtn = {
                onclick: () => {
                  onEditList(list.id);
                  setpopmanageid(null);
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

              if (list.taskDate >= moment(new Date()).format('YYYY-MM-DD')) {
                accessBtnList.push(editbtn);
              }

              accessBtnList.push(deleteBtn, completedBtn);
              const buttonsList =
                list.status === 0 ? accessBtnList : anotherBtnList;
              return (
                <React.Fragment key={list?.id}>
                  {isEditSelected && editId === list.id ? (
                    <div
                      className={
                        'mb-2 ' +
                        classNames['doc-milestone-box'] +
                        ' ' +
                        styles['todo_addTask_box']
                      }
                    >
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
                                  className={"dashbaord-box-todo " + 
                                    classNames['todolist_box'] +
                                    ' ' +
                                    classNames['calendar_box'] +
                                    ' ' +
                                    styles['date_padding']
                                  }
                                >
                                  <div className="side-datepicker dashboard-datePicker">
                                    <DatePicker
                                      ref={datePickerRef}
                                      name="taskDate"
                                      placeholderText="Select"
                                      autoComplete="off"
                                      calendarIcon
                                      dateFormat="yyyy-MM-dd"
                                      className="side_date"
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
                                      onKeyDown={(e) =>
                                        closeCalendarOnTab(e, datePickerRef)
                                      }
                                      preventOpenOnFocus={true}
                                      onFocus={(e) => e.target.blur()}
                                    />
                                    {formErrors.taskDate && (
                                      <span
                                        className={
                                          'text-danger dash-date-err input-error-msg ' +
                                          classNames['date-error'] +
                                          ' ' +
                                          styles['error_date']
                                        }
                                      >
                                        {formErrors.taskDate}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div
                                  className={
                                    'w-100 ' +
                                    classNames['add_task_box'] +
                                    ' ' +
                                    styles['add_task_dashboard']
                                  }
                                >
                                  <div className="d-flex  justify-content-between">
                                    <div className="d-flex ">
                                      <div
                                        className={
                                          'mr-2 add_icon-top-space ' +
                                          classNames['add_task']
                                        }
                                      >
                                        <Image src={Add} className="" />
                                      </div>
                                      <div className="d-block position-relative">
                                        <textarea
                                          name="addTask"
                                          style={{resize: 'none'}}
                                          rows="1"
                                          cols="120"
                                          autoComplete="off"
                                          className={
                                            'side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area  ' +
                                            classNames['add-task_input'] +
                                            ' ' +
                                            styles['dashboard_todo_input']
                                          }
                                          placeholder="Add task"
                                          value={values.addTask}
                                          onChange={handleChange}
                                        />
                                        {formErrors.addTask && (
                                          <span
                                            className="text-danger input-error-msg add-task-error pl-2"
                                            style={{marginTop: '-0.25rem'}}
                                          >
                                            {formErrors.addTask}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="d-flex align-items-center ">
                                      <div
                                        className={
                                          classNames['separator-lines_todo']
                                        }
                                      >
                                        <div className="d-flex pb-2 ">
                                          <div
                                            className={
                                              classNames['todo-list-user']
                                            }
                                          >
                                            <p
                                              className="mb-0 pl-2"
                                              style={{
                                                whiteSpace: 'nowrap',
                                                paddingTop: '0.565rem',
                                              }}
                                            >
                                              Project
                                            </p>
                                          </div>
                                          <div
                                            className={
                                              'side-form-group mb-0 mr-1 ' +
                                              classNames['prior-gap'] +
                                              ' ' +
                                              styles['left_right_space']
                                            }
                                          >
                                            <div className="d-block">
                                              <div
                                                className={
                                                  'position-relative dashboard-select ' +
                                                  classNames[
                                                    'priority-select'
                                                  ] +
                                                  ' ' +
                                                  styles['each_select_width']
                                                }
                                              >
                                                <CustomSelect
                                                  name="projectId"
                                                  options={mapToLabelValue(
                                                    projectList
                                                      ? projectList
                                                      : [],
                                                  )}
                                                  placeholder={'Select'}
                                                  menuPosition="auto"
                                                  renderDropdownIcon={
                                                    SelectDropdownArrows
                                                  }
                                                  onChange={(value) =>
                                                    setFieldValue(
                                                      'projectId',
                                                      value,
                                                    )
                                                  }
                                                  onBlur={(name) =>
                                                    setFieldTouched(name)
                                                  }
                                                  // onChange={setFieldValue}
                                                  value={values.projectId}
                                                  // searchable={true}
                                                  searchOptions={true}
                                                  // disabled={isEditSelected}
                                                  testId="projectId"
                                                />
                                              </div>
                                              {errors.projectId &&
                                                Object.keys(touched).length >
                                                  0 && (
                                                  <span className="text-danger input-error-msg">
                                                    {errors.projectId}
                                                  </span>
                                                )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="d-flex align-self-center ml-2">
                                  <button
                                    type="submit"
                                    className={
                                      'btn btn-primary ' +
                                      classNames['Dashboard_save']
                                    }
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
                      className="mb-3 w-100 d-flex justify-content-start"
                      key={list.id}
                      data-testid="todoList"
                    >
                      <div
                        className={
                          'w-5 date-box-dashboard ' +
                          classNames['todolist_box'] +
                          ' ' +
                          classNames['date_box'] +
                          ' ' +
                          styles['dash_date_box']
                        }
                      >
                        <div className="text-center">
                          <span>{date}</span>
                          <p className="mb-0">{month}</p>
                        </div>
                      </div>

                      <div
                        className={
                          'w-93 ' +
                          classNames['todolist_box'] +
                          ' ' +
                          styles['padding_todolist']
                        }
                      >
                        <div className="d-flex w-100  justify-content-start">
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
                                    onTaskCompleted(list?.id, list);
                                }}
                              />
                              <label
                                className={
                                  'side-custom-control-label cursor-pointer ' +
                                  classNames[
                                    list.status === 1
                                      ? 'label-text'
                                      : 'label-text-empty'
                                  ]
                                }
                                htmlFor="todoUnchecked"
                              >
                                {/* checkbox  */}
                              </label>
                            </div>
                            <div
                              className={
                                classNames['todo-list-user'] +
                                ' ' +
                                classNames['todo-list-user-gap'] +
                                ' ' +
                                styles['users_space']
                              }
                            >
                              <span>{list.postedTime || ''}</span>
                              <p className="mb-0 truncate">
                                {list.assignedToUser}
                              </p>
                            </div>

                            <div
                              className={
                                classNames['todo-list-user'] +
                                ' ' +
                                classNames['todo-list-user-gap'] +
                                ' ' +
                                styles['users_space']
                              }
                            >
                              <span>Project</span>
                              <p className="mb-0 truncate">{list.project}</p>
                            </div>

                            <p
                              className={
                                'mb-0 projects-todo-des side-custom-scroll pr-1  w-100 ' +
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
                              'd-flex align-items-center w-10 justify-content-end ml-3 ' +
                              classNames['dots-width']
                            }
                          >
                            {buttonsList.length > 0 && (
                              <CustomDropDown
                                menuItems={buttonsList}
                                dropdownClassNames={
                                  classNames['todoList_dropdown']
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
                </React.Fragment>
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
                    onClick={props.fetchMoreNotes}
                  >
                    {'Show More....'}
                  </button>
                )
              )
            ) : (
              <></>
            )}
          </div>
          {completedList?.filter((o) => o.status !== 0).length > 0 && (
            <p
              className={classNames['project_title']}
              style={{fontSize: '0.875rem'}}
            >
              Completed
            </p>
          )}
          {completedList
            ?.filter((o) => o.status !== 0)
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

              accessBtnList.concat(editbtn, deleteBtn, completedBtn);

              const buttonsList =
                list.status === 0 ? accessBtnList : anotherBtnList;
              return (
                <div
                  className="mb-3 w-100  d-flex justify-content-start"
                  key={list.id}
                >
                  <div
                    className={
                      'date-box-dashboard w-5 ' +
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
                    className={
                      'w-93 ' +
                      classNames['todolist_box'] +
                      ' ' +
                      styles['checked-dashbaord-list']
                    }
                  >
                    <div className="d-flex w-100  justify-content-start">
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
                            classNames['todo-list-user-gap'] +
                            ' ' +
                            styles['users_space']
                          }
                        >
                          <span>{list.postedTime || ''}</span>
                          <p className="mb-0 truncate">{list.assignedToUser}</p>
                        </div>

                        <div
                          className={
                            classNames['todo-list-user'] +
                            ' ' +
                            classNames['todo-list-user-gap'] +
                            ' ' +
                            styles['users_space']
                          }
                        >
                          <span>Project</span>
                          <p className="mb-0 truncate">{list.project}</p>
                        </div>
                        <p
                          className={
                            'mb-0 projects-todo-des side-custom-scroll pr-1 w-100 ' +
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
                          'd-flex w-10 align-items-center justify-content-end ' +
                          classNames['dots-width']
                        }
                      >
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
            {completedList?.length ? (
              completedListLoadingMore ? (
                <Loading />
              ) : (
                completedListNextUrl && (
                  <button
                    className={'btn btn-primary showMoreBtn mb-3 '}
                    onClick={props.fetchMoreCompletedNotes}
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

      <div
        className={
          classNames['doc-milestone-box'] + ' ' + styles['todo_addTask_box']
        }
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
                    className={"dashbaord-box-todo " + 
                      classNames['todolist_box'] +
                      ' ' +
                      classNames['calendar_box'] +
                      ' ' +
                      styles['date_padding']
                    }
                  >
                    <div className="side-datepicker dashboard-datePicker">
                      <DatePicker
                        ref={datePickerRef}
                        name="taskDate"
                        placeholderText="Select"
                        autoComplete="off"
                        calendarIcon
                        dateFormat="yyyy-MM-dd"
                        className="side_date"
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
                        onKeyDown={(e) => closeCalendarOnTab(e, datePickerRef)}
                        preventOpenOnFocus={true}
                        onFocus={(e) => e.target.blur()}
                      />
                      {formErrors.taskDate && (
                        <span
                          className={
                            'text-danger dash-date-err input-error-msg ' +
                            classNames['date-error'] +
                            ' ' +
                            styles['error_date']
                          }
                        >
                          {formErrors.taskDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={
                      'w-100 ' +
                      classNames['add_task_box'] +
                      ' ' +
                      styles['add_task_dashboard']
                    }
                  >
                    <div className="d-flex justify-content-between">
                      <div className="d-flex">
                        <div
                          className={
                            'mr-2 add_icon-top-space ' + classNames['add_task']
                          }
                        >
                          <Image src={Add} className="" />
                        </div>
                        <div className="d-block position-relative">
                          <textarea
                            name="addTask"
                            style={{resize: 'none'}}
                            rows="1"
                            cols="120"
                            autoComplete="off"
                            className={
                              'side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area  ' +
                              classNames['add-task_input'] +
                              ' ' +
                              styles['dashboard_todo_input']
                            }
                            placeholder="Add task"
                            value={values.addTask}
                            onChange={handleChange}
                          />
                          {formErrors.addTask && (
                            <span
                              className="text-danger input-error-msg add-task-error pl-2"
                              style={{marginTop: '-0.25rem'}}
                            >
                              {formErrors.addTask}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="d-flex align-items-center ">
                        <div className={classNames['separator-lines_todo']}>
                          <div className="d-flex pb-2 ">
                            <div className={classNames['todo-list-user']}>
                              <p
                                className="mb-0 pl-2"
                                style={{
                                  whiteSpace: 'nowrap',
                                  paddingTop: '0.565rem',
                                }}
                              >
                                Project
                              </p>
                            </div>
                            <div
                              className={
                                'side-form-group mb-0 mr-1 ' +
                                classNames['prior-gap'] +
                                ' ' +
                                styles['left_right_space']
                              }
                            >
                              <div className="d-block">
                                <div
                                  className={
                                    'position-relative dashboard-select ' +
                                    classNames['priority-select'] +
                                    ' ' +
                                    styles['each_select_width']
                                  }
                                >
                                  <CustomSelect
                                    name="projectId"
                                    options={mapToLabelValue(
                                      projectList ? projectList : [],
                                    )}
                                    placeholder={'Select'}
                                    menuPosition="auto"
                                    renderDropdownIcon={SelectDropdownArrows}
                                    onChange={(value) =>
                                      setFieldValue('projectId', value)
                                    }
                                    onBlur={(name) => setFieldTouched(name)}
                                    value={values.projectId}
                                    searchOptions={true}
                                    testId="projectId"
                                  />
                                </div>
                                {errors.projectId &&
                                  Object.keys(touched).length > 0 && (
                                    <span className="text-danger input-error-msg">
                                      {errors.projectId}
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-self-center ml-2">
                    <button
                      type="submit"
                      className={
                        'btn btn-primary ' + classNames['Dashboard_save']
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
  );
};

export default TodoList;
