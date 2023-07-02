import React, {useEffect, useState, useContext, useRef} from 'react';
import moment from 'moment';
import classNames from './financials.module.css';
import {Image, Dropdown} from 'react-bootstrap';
import {toastService} from 'erp-react-components';
import ProfileS from '../../images/svg/users-default.svg';
import Send from '../../images/Side-images/feather_send.svg';
import User from '../../images/Side-images/profile_u.svg';
import UserWhite from 'images/Side-images/Green/user-wh.svg';
import SendWhite from 'images/Side-images/Green/Send-wh.svg';
import Dots from '../../images/Side-images/Green/vDots_black-hor.svg';
import HDotsgreen from '../../images/Side-images/Green/vDots_green-hor.svg';
import {
  getNotes,
  getMoreNotes,
  createNotes,
  updateNotes,
  deleteNote,
} from './notes.api';
import {specialCharacters, throttle, until} from '../../helpers/helpers';
import {Loading} from 'components/LoadingComponents/loading';
import {AuthContext} from 'contexts/auth.context';
import {ConfirmPopup} from 'erp-react-components';
import '../../components/customDropdown/customDropdown.css';
import ReactDOM from 'react-dom';

const ProjectManagementNotes = ({projectId}) => {
  const {permissions} = useContext(AuthContext);
  const [isOptionsPopoverOpen, setIsOptionsPopoverOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notesList, setNotesList] = useState([]);
  const [notes, setNotes] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [editId, setEditId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editClicked, setEditClicked] = useState(false);
  const [isAddPermissions, setIsAddPermissions] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');

  useEffect(() => {
    if (permissions['Projects']?.isEdit && permissions['Projects']?.isAdd) {
      setIsAddPermissions(false);
    } else if (
      permissions['Projects']?.isEdit &&
      !permissions['Projects']?.isAdd &&
      !editClicked
    ) {
      setIsAddPermissions(true);
    } else if (
      permissions['Projects']?.isEdit &&
      !permissions['Projects']?.isAdd &&
      editClicked
    ) {
      setIsAddPermissions(false);
    }
  }, [editClicked]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const onDeleteModalClose = (e) => {
    setDeleteModalOpen(false);
  };
  const showDeleteModal = (e) => {
    document.activeElement.blur();
    setDeleteModalOpen(true);
  };

  const fetchNotes = async () => {
    setIsLoading(true);
    const [err, res] = await until(
      getNotes(projectId, 'ProjectManagementNotes'),
    );
    setIsLoading(false);
    if (err) {
      return console.error(err);
    }
    setNextUrl(res.next);
    setNotesList(res.result);
  };

  const fetchMoreNotes = async () => {
    setLoadingMore(true);
    const [err, res] = await until(getMoreNotes(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setNextUrl(res.next);
    setNotesList(notesList.concat(res.result));
  };

  const checkValidation = (value) => {
    let hasError = false;
    if (specialCharacters.includes(value?.[0])) {
      setErrMsg('Special character is not allowed at first place');
      hasError = true;
    } else if (value.length > 800) {
      setErrMsg('Maximum of 800 characters');
      hasError = true;
    } else {
      hasError = false;
    }
    return hasError;
  };

  const onNotesChange = (e) => {
    const value = e.target.value;
    setNotes(value);
    const isValid = checkValidation(value);
    if (!isValid) return setErrMsg('');
  };

  const onSubmitNotes = async () => {
    if (notes.trim().length === 0) return setErrMsg('Please enter notes');
    const isValid = checkValidation(notes);
    if (isValid) return;
    const data = {
      notes: notes,
      noteDate: moment(new Date()).format('YYYY-MM-DD'),
      noteTime: moment(new Date()).format('HH:mm'),
      type: 'ProjectManagementNotes',
      userId: localStorage.getItem('currentUserId'),
    };

    if (editId) {
      delete data['type'];
    }
    const [err, res] = await until(
      editId ? updateNotes(editId, data) : createNotes(projectId, data),
    );
    if (err) {
      return toastService.error({
        msg: err.message,
      });
    }
    setEditId('');
    setNotes('');
    setEditClicked(false);
    fetchNotes();
    return toastService.success({
      msg: res.message,
    });
  };

  const onDelete = async () => {
    const [err, res] = await until(deleteNote(editId));
    if (err) {
      return toastService.error({
        msg: err.message,
      });
    }
    setEditId('');
    setNotes('');
    setEditClicked(false);
    setDeleteModalOpen(false);
    fetchNotes();
    return toastService.success({
      msg: res.message,
    });
  };

  const manageidFunc = (id) => {
    if (isOptionsPopoverOpen === id) {
      setIsOptionsPopoverOpen(null);
    } else {
      setIsOptionsPopoverOpen(id);
    }
  };

  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );

  return (
    <>
      {(permissions['Projects']?.isEdit || permissions['Projects']?.isAdd) && (
        <div className={'row m-0  mr-1 mb-3 ml-1 '}>
          <div className="col-md-12  pl-0 pr-0">
            <div className="position-relative">
              <div
                className={
                  'mb-1 side-form-group ' + classNames['textarea_notes']
                }
              >
                <textarea
                  style={{resize: 'none'}}
                  className={
                    'mt-1 side-form-control side-custom-scroll pr-1  ' +
                    classNames['notes_des']
                  }
                  name="notes"
                  value={notes}
                  placeholder="What’s on your mind?"
                  onChange={onNotesChange}
                  disabled={isAddPermissions}
                ></textarea>
              </div>
              <div
                className={
                  'd-flex align-items-center ' +
                  classNames['send_details_notes']
                }
              >
                <div className={'user-send-icon ' + classNames['brder-R']}>
                  <Image
                    className={'user_img user_img-white'}
                    src={UserWhite}
                  />
                  <Image className={'user_img'} src={User} />
                </div>
                <div
                  style={{
                    borderRight: '2px solid var(--border-color)',
                    height: '2.1875rem',
                  }}
                ></div>
                <div className={'user-send-icon ' + classNames['brder-R']}>
                  <Image
                    className={'send_img send_img-white'}
                    src={SendWhite}
                    onClick={!isAddPermissions ? onSubmitNotes : () => {}}
                  />
                  <Image
                    className={'send_img'}
                    src={Send}
                    onClick={!isAddPermissions ? onSubmitNotes : () => {}}
                  />
                </div>
              </div>
            </div>
            {errMsg && (
              <span className="text-danger input-error-msg">{errMsg}</span>
            )}
          </div>
        </div>
      )}
      {!isLoading ? (
        <div
          className={'side-custom-scroll flex-grow-1 pr-1 '}
          style={{maxHeight: 'calc(100vh - 17rem)'}}
          onScroll={throttled.current}
        >
          {notesList.map((d) => {
            const time = moment(d.noteTime, ['HH:mm']).format('h:mm A');
            const yesterdayDate = moment()
              .subtract(1, 'days')
              .format('YYYY-MM-DD');
            const currentDate = moment(new Date()).format('YYYY-MM-DD');
            return (
              <div className={classNames['notes-box']} key={d.id}>
                <div className="d-flex align-items-start justify-content-between">
                  <div className="d-flex">
                    <div className={classNames['User_Profile']}>
                      <Image
                        src={ProfileS}
                        className={classNames['profile_icons']}
                      />
                    </div>
                    <div className={'d-block ml-3 ' + classNames['notes_User']}>
                      <p className={classNames['user-name']}>
                        {d?.sideUser?.name}
                      </p>
                      {time && (
                        <span className={classNames['user-time']}>{time}</span>
                      )}
                      {d.noteDate && (
                        <span className={classNames['user-time']}>
                          ,{' '}
                          {yesterdayDate === d.noteDate
                            ? 'yesterday'
                            : currentDate === d.noteDate
                            ? 'today'
                            : d.noteDate}
                        </span>
                      )}
                      {d.studio && (
                        <span className={classNames['user-time']}>
                          , {d.studio}
                        </span>
                      )}
                    </div>
                  </div>
                  {permissions['Projects']?.isEdit && (
                    <div className="d-flex">
                      <Dropdown
                        className={'toggle-dropdown-box Project_notes_dropdown'}
                        onToggle={() => manageidFunc(d.id)}
                        show={isOptionsPopoverOpen === d.id}
                        alignRight
                        drop="bottom"
                      >
                        <Dropdown.Toggle
                          className={'mt-1 toggle-dropdown-btn btn btn-link'}
                        >
                          <i className="white-dots-dark-theme"> </i>
                          <Image
                            src={
                              isOptionsPopoverOpen === d.id ? HDotsgreen : Dots
                            }
                          />
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          className="users_dropdown_menu"
                          dropupauto="true"
                        >
                          <Dropdown.Item
                            className="users_dropdown_item"
                            onClick={(e) => {
                              setEditClicked(true);
                              setEditId(d.id);
                              setNotes(d.notes);
                              setErrMsg('');
                            }}
                          >
                            <div className={classNames['hover-elem']}>Edit</div>
                          </Dropdown.Item>
                          <Dropdown.Item
                            className="users_dropdown_item"
                            onClick={(e) => {
                              showDeleteModal(true);
                              setEditId(d.id);
                            }}
                          >
                            <div className={classNames['hover-elem']}>
                              Delete
                            </div>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  )}
                </div>
                <p
                  className={
                    'mr-2 mb-0 mt-3 truncate ' + classNames['des-text']
                  }
                >
                  {d.notes}
                </p>
              </div>
            );
          })}
          <div style={{textAlign: 'center'}}>
            {notesList.length ? (
              loadingMore ? (
                <Loading />
              ) : (
                nextUrl && (
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
        </div>
      ) : (
        <Loading />
      )}
      {/* Delete Modal need to create seperate component*/}
      {ReactDOM.createPortal(
        <div className="Notes_Delete_Confirm">
          <ConfirmPopup
            show={deleteModalOpen}
            onClose={() => {
              onDeleteModalClose();
            }}
            title={'Delete Confirmation'}
            message={'Are you sure you want to delete this note?'}
            actions={[
              {label: 'Delete', onClick: () => onDelete()},
              {label: 'Cancel', onClick: () => onDeleteModalClose()},
            ]}
          ></ConfirmPopup>
        </div>,
        document.getElementById('Delete_confirm') || document.body,
      )}
    </>
  );
};

export default ProjectManagementNotes;
