import {useRef, useEffect, useContext, useState, useMemo} from 'react';
import TopNavBar from 'components/topNavBar';
import {Formik} from 'formik';
import * as yup from 'yup';
import {Button, Modal, Row, Col, Image} from 'react-bootstrap';
import classNames from './users.module.css';
import Table from 'components/Table';
import {TableSearchInput, toastService} from 'erp-react-components';
import {DataContext} from '../contexts/data.context';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {
  getUsers,
  fetchNextRecords,
  updateUser,
  deactivateUser,
} from './users.api';
import {until, mapToLabelValue, focusWithInModal} from '../helpers/helpers';
import {TwitterPicker} from 'react-color';
import {AuthContext} from 'contexts/auth.context';
import {Link} from 'react-router-dom';
import {CustomSelect, ConfirmPopup} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';

const Users = (props) => {
  const userSearchRef = useRef();
  const {permissions} = useContext(AuthContext);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const dataProvider = useContext(DataContext);
  const [defaultScreen, setDefaultScreen] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchStrErr, setSearchStrErr] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [background, setBackground] = useState('');
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const initialUserData = {
    studioIds: [],
    colorCode: '',
  };

  const [editData, setEditData] = useState(initialUserData);

  useEffect(() => {
    fetchUsers();
  }, [userSearch]);

  useEffect(() => {
    dataProvider.fetchStudios();
  }, []);

  const onDeleteModalClose = () => {
    setSelectedUserId('');
    setDeleteModalOpen(false);
  };
  const showDeleteModal = (id) => {
    document.activeElement.blur();
    setSelectedUserId(id);
    setDeleteModalOpen(true);
  };
  const onEditModalClose = () => {
    setEditModalOpen(false);
  };
  const showEditModal = (data) => {
    setSelectedUserId(data.id);
    const updatedData = {
      studioIds: (data.userStudios || []).map((d) => d.id),
      colorCode: data.colorCode || '',
    };
    setEditData(updatedData);
    setEditModalOpen(true);
  };
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');

  const fetchUsers = async () => {
    setLoadingData(true);
    const [err, data] = await until(getUsers(userSearch));
    setLoadingData(false);
    if (err) {
      return console.error(err);
    }
    setUsers(data.result);
    setNextUrl(data.next);
  };

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setUsers(users.concat(data.result));
    setNextUrl(data.next);
  };

  const handleUserSearch = (e) => {
    let regx = /^[a-zA-Z ]*$/;
    if (!regx.test(e.target.value))
      return setSearchStrErr('Please enter valid user name');
    setSearchStrErr('');
    let searchVal = e.target.value;
    if (e.key === 'Enter' || !searchVal) {
      setUserSearch(e.target.value);
    }
  };

  const noDataFormatter = (cell) => cell || '--';

  const editFormatter = (cell, row, rowIndex, formatExtraData) => {
    const buttonList = [];
    if (permissions['Users']?.isEdit) {
      buttonList.push({
        onclick: () => showEditModal(row),
        label: 'Edit',
        show: true,
      });
    }
    if (permissions['Users']?.isEdit) {
      buttonList.push({
        onclick: () => showDeleteModal(row.id),
        label: 'Delete',
        show: true,
      });
    }
    return (
      <CustomDropDown
        menuItems={buttonList}
        dropdownClassNames={classNames['users_dropdown']}
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
    );
  };

  const columns = useMemo(() => {
    const cols = [
      {
        dataField: 'name',
        text: 'Name',
        headerClasses: classNames['Name'],
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'userName',
        text: 'User Name',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'emailId',
        text: 'Email ID',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'roles',
        text: 'Role',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'location',
        text: 'Location',
        formatter: noDataFormatter,
        sort: true,
        sortCaret: TableSortArrows,
      },
    ];

    if (permissions['Users']?.isEdit) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: 'action-header',
        classes: 'overflow-visible',
        formatter: editFormatter,
      });
    }
    return cols;
  }, [editFormatter]);

  const popover = {
    position: 'absolute',
    zIndex: '2',
  };
  const cover = {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  };
  const handleChangeColor = () => {
    setDisplayColorPicker(true);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChangeComplete = (color, setFieldValue) => {
    setFieldValue('colorCode', color.hex);
    setBackground(color.hex);
    setDisplayColorPicker(false);
  };

  const schema = yup.lazy(() =>
    yup.object().shape({
      studioIds: yup.string().required('Select studio').nullable(),
      colorCode: yup.string().required('Select color').nullable(),
    }),
  );

  const onDeactivateUser = async () => {
    const [err, data] = await until(deactivateUser(selectedUserId));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    onDeleteModalClose();
    fetchUsers();
    return toastService.success({msg: data?.message});
  };

  return (
    <>
      <TopNavBar defaultScreen={defaultScreen}>
        <li>
          <Link to="#">Users</Link>
        </li>
      </TopNavBar>{' '}
      <div
        className="d-flex justify-content-end mt-3 mb-3 "
        style={{marginRight: '1.25rem'}}
      >
        <div className="position-relative search-width gray-bg-search-input">
          <Image
            src={SearchWhite}
            className={
              'search-t-icon search-white-icon cursor-pointer ' +
              classNames['s-icon']
            }
            onClick={() => {
              setUserSearch(userSearchRef.current.value);
            }}
          />
          <TableSearchInput
            onSearch={setUserSearch}
            onKeyPress={(event) => {
              if (
                (event.charCode >= 65 && event.charCode <= 90) ||
                (event.charCode > 96 && event.charCode < 123) ||
                event.charCode === 32
              ) {
                return true;
              } else {
                event.preventDefault();
                return false;
              }
            }}
          />
          {searchStrErr !== '' && (
            <span className="text-danger input-error-msg">{searchStrErr}</span>
          )}
        </div>
      </div>
      <div className="side-container mt-0" data-testid="data-section">
        <Table
          tableData={users}
          loadingData={loadingData}
          wrapperClass={classNames['users-table']}
          columns={columns}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
        />
      </div>
      {/* Delete User Modal popup */}
      <ConfirmPopup
        show={deleteModalOpen}
        onClose={() => {
          onDeleteModalClose();
        }}
        title={'Deactivate Confirmation'}
        message={'Are you sure you want to Deactivate?'}
        actions={[
          {label: 'Yes', onClick: () => onDeactivateUser()},
          {label: 'No', onClick: () => onDeleteModalClose()},
        ]}
      ></ConfirmPopup>
      {/* Edit User Modal Popup */}
      <Modal
        className={'side-modal ' + classNames['edit-user-modal']}
        show={editModalOpen}
        onHide={onEditModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        enforceFocus={false}
        size="xl"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Edit User</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Formik
            initialValues={editData}
            enableReinitialize
            onSubmit={async (data, {resetForm}) => {
              const [err, res] = await until(updateUser(data, selectedUserId));
              if (err) {
                return toastService.error({msg: err.message});
              }
              onEditModalClose();
              fetchUsers();
              toastService.success({msg: res.message});
            }}
            validationSchema={schema}
          >
            {({
              values,
              handleSubmit,
              handleChange,
              setFieldValue,
              errors,
              status,
              touched,
            }) => {
              const formErrors = {};
              status = status || {};
              for (var f in values) {
                if (touched[f]) {
                  formErrors[f] = errors[f] || status[f];
                }
              }
              return (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                >
                  <Row className="m-0">
                    <Col md="5" className="pl-0 pr-4_5">
                      <div className="side-form-group">
                        <label>Studio*</label>
                        <div
                          style={{marginTop: '0.5rem'}}
                          className={classNames['Studio_select']}
                        >
                          <CustomSelect
                            name="studioIds"
                            options={mapToLabelValue(
                              dataProvider.studios ? dataProvider.studios : [],
                            )}
                            placeholder={'Select Studio'}
                            menuPosition="bottom"
                            renderDropdownIcon={SelectDropdownArrows}
                            multiSelect={true}
                            searchable={false}
                            checkbox={true}
                            searchOptions={true}
                            onChange={(value) => {
                              setFieldValue('studioIds', value);
                            }}
                            value={values.studioIds}
                            testId="studioIds"
                            unselect={false}
                          />
                          {formErrors.studioIds && (
                            <span className="text-danger input-error-msg">
                              {formErrors.studioIds}
                            </span>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col md="5" className="pl-0 pr-0">
                      <div className="side-form-group ">
                        <label>Identification Colour*</label>
                        <div
                          style={{marginTop: '0.5rem'}}
                          className="position-relative"
                        >
                          <div className={classNames['Studio_select']}>
                            <input
                              type="text"
                              name="colorCode"
                              autoComplete="off"
                              className={'side-form-control '}
                              placeholder="Pick Color"
                              value={values.colorCode}
                              onClick={handleChangeColor}
                              readOnly
                            />
                            {formErrors.colorCode && (
                              <span className="text-danger input-error-msg">
                                {formErrors.colorCode}
                              </span>
                            )}
                            {displayColorPicker ? (
                              <div style={popover}>
                                <div style={cover} onClick={handleClose} />
                                <TwitterPicker
                                  color={values.colorCode}
                                  onChangeComplete={(data) =>
                                    handleChangeComplete(data, setFieldValue)
                                  }
                                />
                              </div>
                            ) : null}
                          </div>
                        </div>
                        {values.colorCode && (
                          <div
                            className={classNames['color-fill']}
                            style={{
                              backgroundColor: values.colorCode,
                              marginTop: '0.5rem',
                            }}
                          ></div>
                        )}
                      </div>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end pt-10 ">
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Users;
