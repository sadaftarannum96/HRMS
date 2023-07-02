import {useEffect, useContext, useState} from 'react';
import TopNavBar from 'components/topNavBar';
import {Link} from 'react-router-dom';
import RightAngle from 'components/angleRight';
import {Button, Modal, Row, Col} from 'react-bootstrap';
import classNames from './users.module.css';
import Table from 'components/Table';
import {toastService} from 'erp-react-components';
import {DataContext} from '../contexts/data.context';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import {useHistory} from 'react-router-dom';
import OverlayTriggerPopup from 'components/overlayTrigger';
import {CustomSelect as Select} from '../components/customSelectInput/rds_wrapper';
import {ReactComponent as DownArrow} from '../images/svg/down-arrow-lg.svg';
import {ReactComponent as UpArrow} from '../images/Side-images/Uparrow-green.svg';
import {
  until,
  getNestedValue,
  cloneObject,
  setDeep,
  mapToLabelValue,
  focusWithInModal,
} from '../helpers/helpers';
import {USER_ACCESS_SCHEMA} from '../helpers/constants';
import {AuthContext} from '../contexts/auth.context';
import {savePermissions, getPermissions, getAllFeatures} from './users.api';
import greenCheckIcon from '../images/Side-images/check-icon.svg';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';

const ManageGroup = (props) => {
  const {state} = props;
  const history = useHistory();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const dataProvider = useContext(DataContext);
  const authProvider = useContext(AuthContext);
  const [defaultScreen, setDefaultScreen] = useState(null);
  const [filters, setFilters] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [popmanageid, setpopmanageid] = useState('');
  const [nextUrl, setNextUrl] = useState('');
  const [roleId, setRoleId] = useState('');
  const [modules, setModules] = useState([]);

  const [selectedGroupPermissions, setSelectedGroupPermissions] = useState([]);

  useEffect(() => {
    dataProvider.fetchRoles();
    loadAllModules();
  }, []);

  const defaultEmptyPermissions = () => ({
    isAdd: false,
    isEdit: false,
    isDelete: false,
    isView: false,
  });

  async function loadAllModules() {
    const [err, res] = await until(getAllFeatures());
    if (err) {
      return toastService.error({
        msg: err.message,
      });
    }
    var allModules = JSON.parse(JSON.stringify(res));
    for (var i in allModules) {
      allModules[i].path = i + '.permissions';
      allModules[i].permissions =
        allModules[i].permissions || defaultEmptyPermissions();
      for (var j in allModules[i].features) {
        allModules[i].features[j].path = `${i}.features.${j}` + '.permissions';
        allModules[i].features[j].permissions =
          allModules[i].features[j].permissions || defaultEmptyPermissions();
      }
    }
    setModules(allModules);
    setSelectedGroupPermissions(allModules);
  }

  function setLoadedPermissions(result) {
    var emptyPermissions = JSON.parse(JSON.stringify(modules));
    const resultValues = result.length ? result : cloneObject(modules);
    for (var modIdx in resultValues) {
      var resultModule = resultValues[modIdx];
      var emptyPermissionModule = emptyPermissions.find(
        (p) => p.id == resultModule.id,
      );
      emptyPermissionModule.permissions = {};
      emptyPermissionModule.permissions =
        resultModule['permissions'] || defaultEmptyPermissions();

      if (!authProvider.canEdit.users_permissions) {
        for (var j in emptyPermissionModule.permissions) {
          emptyPermissionModule.permissions[j] =
            emptyPermissionModule.permissions[j] + '';
        }
      }
      for (var featureIdx in resultModule.features || []) {
        let resultFeature = resultModule.features[featureIdx];

        let newFeature = emptyPermissionModule.features.find(
          (f) => f.id == resultFeature.id,
        );
        if (!newFeature) continue;
        newFeature.permissions =
          resultFeature.permissions || defaultEmptyPermissions();
        if (!authProvider.canEdit.users_permissions) {
          for (var h in newFeature.permissions) {
            newFeature.permissions[h] = newFeature.permissions[h] + '';
          }
        }
        for (var subFeatureIdx in resultFeature.features) {
          let resultSubFeature = resultFeature.features[subFeatureIdx];
          let newSubFeature = newFeature.features.find(
            (sf) => sf.id == resultSubFeature.id,
          );
          if (!newSubFeature) continue;

          newSubFeature.permissions =
            resultSubFeature.permissions || defaultEmptyPermissions();
        }
      }
    }
    setSelectedGroupPermissions(emptyPermissions);
  }

  useEffect(() => {
    if (!roleId) return;
    loadPermissionsOfUser(roleId);
  }, [roleId]);

  const loadPermissionsOfUser = async (id) => {
    const [err, data] = await until(getPermissions(id));
    if (err) {
      return console.error(err);
    }
    const formatedData = JSON.parse(JSON.stringify(data));
    setLoadedPermissions(formatedData || []);
  };

  function filterCallback(filtersObj) {
    if (filtersObj === filters) return;
    document.body.click();
    setFilters(filtersObj);
  }
  const onDeleteModalClose = () => {
    setDeleteModalOpen(false);
  };
  const showDeleteModal = (id) => {
    setDeleteModalOpen(true);
  };
  const onEditModalClose = () => {
    setEditModalOpen(false);
  };
  const showEditModal = (id) => {
    setEditModalOpen(true);
  };
  const manageidFunc = (id) => {
    setpopmanageid(id);
  };
  const noDataFormatter = (cell) => cell || '--';
  const fetchMoreRecords = async () => {
    setLoadingMore(true);
  };
  const editFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <OverlayTriggerPopup
          id={row.id}
          onEnter={() => manageidFunc(row.id)}
          onExit={() => setpopmanageid(null)}
          placement="left"
          popmanageid={popmanageid}
          popoverClassNames={classNames['remove-popup']}
          buttonList={[
            {
              className: 'edit-button',
              funcName: () => showEditModal(row.id),
              btnTitle: 'Edit',
            },
            {
              className: 'edit-button',
              funcName: () => showDeleteModal(row.id),
              btnTitle: 'Delete',
            },
          ]}
        />
      </>
    );
  };

  const filterTabs = [
    {
      key: 'Talent_ids',
      title: 'Talent',
      name: 'Talent_ids',
      data: dataProvider.Name,
    },
    {
      key: 'Clients_ids',
      title: 'Clients',
      name: 'Clients_ids',
      data: dataProvider.Designation,
    },
    {
      key: 'Projects_ids',
      title: 'Projects',
      name: 'Projects_ids',
      data: dataProvider.Department,
    },
  ];
  const tableData = [
    {
      id: 1,
      User: 'Talent',
    },
    {
      id: 2,
      User: 'Clients',
    },
  ];

  const rowFormatter = (key) => {
    return (cell, row, rowIdx, {groupPermissions, roleId}) => {
      const isChecked = row
        ? row.path
          ? (getNestedValue(groupPermissions, row.path) || {})[key]
          : row[key]
        : false;

      let displayCheckbox = false;
      if (!roleId) displayCheckbox = true;
      if (roleId && typeof isChecked === 'boolean') {
        displayCheckbox = true;
      }

      return (
        <div
          className={
            classNames[
              'access-checkbox-' + (key.split('is')[1] || '').toLowerCase()
            ]
          }
        >
          {displayCheckbox ? (
            <input
              type="checkbox"
              className={classNames['access-select']}
              checked={isChecked}
              onChange={(e) => {
                if (!roleId) {
                  e.preventDefault();
                  return toastService.success({
                    msg: 'Select access role',
                    isWarning: true,
                  });
                }
                const checked = e.currentTarget.checked;
                onPermissionChange(checked, key, groupPermissions, row, roleId);
              }}
            />
          ) : (
            <>
              {isChecked === 'true' ? (
                <img src={greenCheckIcon} style={{width: '0.9rem'}} />
              ) : (
                <></>
              )}
            </>
          )}
        </div>
      );
    };
  };

  const columns = [
    {
      dataField: 'name',
      text: 'Modules',
      headerClasses: classNames['User'],
      sort: true,
      sortCaret: TableSortArrows,
    },
    {
      dataField: 'Add',
      text: 'Add',
      formatter: rowFormatter('isAdd'),
      headerClasses: classNames['select-check'],
      formatExtraData: {
        groupPermissions: selectedGroupPermissions,
        roleId,
      },
    },
    {
      dataField: 'Edit',
      text: 'Edit',
      headerClasses: classNames['select-check'],
      formatter: rowFormatter('isEdit'),
      formatExtraData: {
        groupPermissions: selectedGroupPermissions,
        roleId,
      },
    },
    {
      dataField: 'View',
      text: 'View',
      headerClasses: classNames['select-check'],
      formatter: rowFormatter('isView'),
      formatExtraData: {
        groupPermissions: selectedGroupPermissions,
        roleId,
      },
    },
  ];

  const getSubFeaturePath = ({
    moduleName,
    featureName,
    subFeatureName,
    obj,
  }) => {
    const module = obj.find((o) => o.name == moduleName);
    const feature = (module.features || []).find((f) => f.name == featureName);
    const subFeature = (feature.features || []).find(
      (sf) => sf.name == subFeatureName,
    );
    return (subFeature || {}).path || '';
  };

  function onPermissionChange(checked, key, groupPermissions, row) {
    const updated = cloneObject(groupPermissions);
    const path = (row.path ? row.path : 'permissions').split('.');

    const actualPath = path.slice(0, path.length - 1); //removing "permissions"

    //now set the same  value for all nested values

    function setNestedSectionValuesToSameValue(section, value, options = {}) {
      const except = options.except || [];
      if (!section.features) return;
      section.features.forEach((f, i) => {
        if (!f.permissions) {
          f.permissions = defaultEmptyPermissions();
        }
        if (f.permissions[key] !== 'N/A') {
          if (
            !(
              except[0] &&
              (except[0].name || []).includes(f.name) &&
              (except[0].keys || []).includes(key)
            )
          ) {
            if (typeof f.permissions[key] == 'boolean') {
              f.permissions[key] = value;
              for (var actionType in f.permissions) {
                if (
                  actionType == key ||
                  f.permissions[actionType] === 'N/A' ||
                  typeof f.permissions[actionType] == 'boolean'
                )
                  continue;
                f.permissions[actionType] = value + '';
              }
            } else {
              f.permissions[key] = value + '';
            }
          }
        }
        if (f.features && f.features.length) {
          setNestedSectionValuesToSameValue(f, value, {
            except: except.slice(1),
          });
        }
      });
    }

    //top level
    let feature = actualPath.reduce((chkbox, seg, idx) => {
      if (checked && seg === 'features' && chkbox.permissions[key] !== 'N/A') {
        chkbox.permissions[key] =
          typeof chkbox.permissions[key] == 'boolean' ? true : 'true';
      }
      return chkbox[seg] || {};
    }, updated);

    if (!!feature && typeof feature != 'object') {
      return console.error('not object', feature, actualPath, updated);
    }
    if (
      typeof feature == 'object' &&
      !Array.isArray(feature) &&
      !feature.permissions
    ) {
      feature.permissions = {};
    }

    feature['permissions'][key] = checked;
    // if row has no checkboxes(only tick marks) change those values same as this value
    for (var actionType in feature['permissions']) {
      if (actionType == key) continue;
      if (
        typeof feature['permissions'][actionType] != 'boolean' &&
        feature['permissions'][actionType] !== 'N/A'
      ) {
        feature['permissions'][actionType] = checked + '';
      }
    }
    setNestedSectionValuesToSameValue(feature, checked);
    setSelectedGroupPermissions(updated);
    if (['isEdit', 'isAdd'].includes(key)) {
      const val = getNestedValue(updated, actualPath);
      if (val.permissions.isAdd || val.permissions.isEdit) {
        onPermissionChange(true, 'isView', updated, row);
      }
    }
  }

  function onSubPermissionChange(checked, groupPermissions, row, key) {
    const updated = cloneObject(groupPermissions);
    const path = (row.path ? row.path : 'permissions').split('.');

    const actualPath = path.slice(0, path.length - 1); //removing "permissions"

    //now set the same  value for all nested values

    function setNestedSectionValuesToSameValue(section, value, options = {}) {
      const except = options.except || [];
      if (!section.features) return;
      section.features.forEach((f, i) => {
        if (!f.permissions) {
          f.permissions = defaultEmptyPermissions();
        }
        if (f.permissions[key] !== 'N/A') {
          if (
            !(
              except[0] &&
              (except[0].name || []).includes(f.name) &&
              (except[0].keys || []).includes(key)
            )
          ) {
            if (typeof f.permissions[key] == 'boolean') {
              f.permissions[key] = value;
              for (var actionType in f.permissions) {
                if (
                  actionType == key ||
                  f.permissions[actionType] === 'N/A' ||
                  typeof f.permissions[actionType] == 'boolean'
                )
                  continue;
                f.permissions[actionType] = value + '';
              }
            } else {
              f.permissions[key] = value + '';
            }
          }
        }
        if (f.features && f.features.length) {
          setNestedSectionValuesToSameValue(f, value, {
            except: except.slice(1),
          });
        }
      });
    }

    //top level
    let feature = actualPath.reduce((chkbox, seg, idx) => {
      if (checked && seg === 'features' && chkbox.permissions[key] !== 'N/A') {
        chkbox.permissions[key] =
          typeof chkbox.permissions[key] == 'boolean' ? true : 'true';
      }
      return chkbox[seg] || {};
    }, updated);

    if (!!feature && typeof feature != 'object') {
      return console.error('not object', feature, actualPath, updated);
    }
    if (
      typeof feature == 'object' &&
      !Array.isArray(feature) &&
      !feature.permissions
    ) {
      feature.permissions = {};
    }

    feature['permissions'][key] = checked;
    for (var actionType in feature['permissions']) {
      if (actionType == key) continue;
      if (
        typeof feature['permissions'][actionType] != 'boolean' &&
        feature['permissions'][actionType] !== 'N/A'
      ) {
        feature['permissions'][actionType] = checked + '';
      }
    }
    setNestedSectionValuesToSameValue(feature, checked);
    setSelectedGroupPermissions(updated);
    if (['isEdit', 'isAdd'].includes(key)) {
      const val = getNestedValue(updated, actualPath);
      if (val.permissions.isAdd || val.permissions.isEdit) {
        onSubPermissionChange(true, updated, row, 'isView');
      }
    }
  }

  const nestedColumns = () => [
    {
      dataField: 'name',
      text: '',
    },
    {
      dataField: 'permissions.isView',
      text: 'View',
      formatter: rowFormatter('isView'),
      formatExtraData: {
        groupPermissions: selectedGroupPermissions,
        roleId,
      },
    },
    {
      dataField: 'permissions.isAdd',
      text: 'Add',
      formatter: rowFormatter('isAdd'), // rowFormatter("isAdd"),
      formatExtraData: {
        groupPermissions: selectedGroupPermissions,
        roleId,
      },
    },
    {
      dataField: 'permissions.isEdit',
      text: 'Edit',
      formatter: rowFormatter('isEdit'),
      formatExtraData: {
        groupPermissions: selectedGroupPermissions,
        roleId,
      },
    },

    {
      dataField: 'permissions.isDelete',
      text: 'Delete',
      formatter: rowFormatter('isDelete'),
      formatExtraData: {
        groupPermissions: selectedGroupPermissions,
        roleId,
      },
    },
  ];

  const expandRow = {
    onlyOneExpanding: true,
    renderer: (row) => {
      return (
        <>
          {(row.features || []).map((f) => {
            const addKey = 'isAdd';
            const editKey = 'isEdit';
            const viewKey = 'isView';
            const isAddChecked = f
              ? f.path
                ? (getNestedValue(selectedGroupPermissions, f.path) || {})[
                    addKey
                  ]
                : f[addKey]
              : false;
            const isEditChecked = f
              ? f.path
                ? (getNestedValue(selectedGroupPermissions, f.path) || {})[
                    editKey
                  ]
                : f[editKey]
              : false;
            const isViewChecked = f
              ? f.path
                ? (getNestedValue(selectedGroupPermissions, f.path) || {})[
                    viewKey
                  ]
                : f[viewKey]
              : false;

            let isAddDisplayCheckbox = false;
            let isEditDisplayCheckbox = false;
            let isViewDisplayCheckbox = false;
            if (!roleId) {
              isAddDisplayCheckbox = true;
              isEditDisplayCheckbox = true;
              isViewDisplayCheckbox = true;
            }
            if (roleId && typeof isAddChecked === 'boolean') {
              isAddDisplayCheckbox = true;
            }
            if (roleId && typeof isEditChecked === 'boolean') {
              isEditDisplayCheckbox = true;
            }
            if (roleId && typeof isViewChecked === 'boolean') {
              isViewDisplayCheckbox = true;
            }
            return (
              <div className="d-flex marginBottom-space mb-4" key={f.id}>
                <p
                  className={'users-per-check ' + classNames['user-list-name']}
                  style={{flex: '0.965'}}
                >
                  {f.name}
                </p>
                <div
                  className={classNames['access-checkbox-']}
                  style={{flex: '1'}}
                >
                  {isAddDisplayCheckbox ? (
                    <input
                      type="checkbox"
                      checked={isAddChecked}
                      className={classNames['access-select']}
                      onChange={(e) => {
                        if (!roleId) {
                          e.preventDefault();
                          return toastService.success({
                            msg: 'Select access role',
                            isWarning: true,
                          });
                        }

                        const checked = e.currentTarget.checked;
                        onSubPermissionChange(
                          checked,
                          selectedGroupPermissions,
                          f,
                          addKey,
                          roleId,
                        );
                      }}
                    />
                  ) : (
                    <>
                      {isAddChecked === 'true' ? (
                        <img src={greenCheckIcon} style={{width: '0.9rem'}} />
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                </div>
                <div
                  className={classNames['access-checkbox-']}
                  style={{flex: '1'}}
                >
                  {isEditDisplayCheckbox ? (
                    <input
                      type="checkbox"
                      className={classNames['access-select']}
                      checked={isEditChecked}
                      onChange={(e) => {
                        if (!roleId) {
                          e.preventDefault();
                          return toastService.success({
                            msg: 'Select access role',
                            isWarning: true,
                          });
                        }

                        const checked = e.currentTarget.checked;
                        onSubPermissionChange(
                          checked,
                          selectedGroupPermissions,
                          f,
                          editKey,
                          roleId,
                        );
                      }}
                    />
                  ) : (
                    <>
                      {isEditChecked === 'true' ? (
                        <img src={greenCheckIcon} style={{width: '0.9rem'}} />
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                </div>
                <div
                  className={'resol-check ' + classNames['access-checkbox-']}
                  style={{flex: '1'}}
                >
                  {isViewDisplayCheckbox ? (
                    <input
                      type="checkbox"
                      className={classNames['access-select']}
                      checked={isViewChecked}
                      onChange={(e) => {
                        if (!roleId) {
                          e.preventDefault();
                          return toastService.success({
                            msg: 'Select access role',
                            isWarning: true,
                          });
                        }

                        const checked = e.currentTarget.checked;
                        onSubPermissionChange(
                          checked,
                          selectedGroupPermissions,
                          f,
                          viewKey,
                          roleId,
                        );
                      }}
                    />
                  ) : (
                    <>
                      {isViewChecked === 'true' ? (
                        <img src={greenCheckIcon} style={{width: '0.9rem'}} />
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </>
      );
    },

    showExpandColumn: true,
    expandColumnPosition: 'right',
    expandHeaderColumnRenderer: ({isAnyExpands}) => {
      if (isAnyExpands) {
        return '';
      }
      return '';
    },
    expandColumnRenderer: ({expanded}) => {
      if (expanded) {
        return (
          <button className="btn btn-primary table_expand_ellpsis">
            <UpArrow className="table-expand-up-arrow" />
          </button>
        );
      }
      return (
        <button className="btn btn-primary table_expand_ellpsis">
          <DownArrow className="table-expand-down-arrow" />
        </button>
      );
    },
  };

  const onSelectRole = (id) => {
    setRoleId(id);
  };

  async function onSavePermissions() {
    if (!roleId) {
      return toastService.error({
        msg: 'Select access role',
      });
    }
    function toBoolean(obj) {
      const obj1 = {};
      for (var i in obj) {
        if (obj[i] && typeof obj[i] === 'boolean') {
          obj1[i] = obj[i];
        } else {
          obj1[i] = obj[i] === 'true' || (obj[i] === 'N/A' && obj['isView']);
        }
      }
      return [obj1];
    }
    let payload = cloneObject(selectedGroupPermissions);
    payload = payload.map((module) => {
      if (module.features && module.features.length) {
        module.features = module.features.map((f) => {
          if (f.features && f.features.length) {
            f.features = f.features.map((sf) => {
              if (sf.features) {
                sf.features = sf.features.map((ssf) => {
                  return {
                    id: ssf.id,
                    permissions: toBoolean(ssf.permissions),
                    features: ssf.features,
                  };
                });
              }
              return {
                id: sf.id,
                permissions: toBoolean(sf.permissions),
                features: sf.features,
              };
            });
          }
          return {
            isAdd: f.permissions.isAdd,
            isEdit: f.permissions.isEdit,
            isView: f.permissions.isView,
            featureId: f.id,
          };
        });
      }
      return {
        moduleId: module.id,
        features: module.features,
        permissions: toBoolean(module.permissions),
      };
    });
    const [err, res] = await until(
      savePermissions({
        roleId: roleId,
        permissionValues: payload,
      }),
    );
    if (err) {
      return toastService.error({
        msg: err.message,
      });
    }
    return toastService.success({
      msg: res.message,
    });
  }
  return (
    <>
      <TopNavBar defaultScreen={defaultScreen}>
        <li>
          <Link to="/users">Users</Link>
        </li>
        <RightAngle />
        <li>
          <Link to="#">Manage Permissions </Link>
        </li>
      </TopNavBar>{' '}
      <div className="side-container">
        <div className="d-flex mt-1" style={{marginBottom: '1rem'}}>
          <Button
            className="mr-2 back-btn"
            onClick={() =>
              history.push({
                pathname: `/users/`,
                state: {titleKey: 'users'},
              })
            }
          >
            Back
          </Button>
        </div>
        <div className="side-form-group mb-0">
          <label>Role</label>
        </div>

        <div className="d-flex">
          <div className="side-form-group mb-0">
            <div className={classNames['role_select']}>
              <Select
                name="Role"
                options={mapToLabelValue(
                  dataProvider.roles
                    ? dataProvider.roles.filter((d) => d.name !== 'Super Admin')
                    : [],
                )}
                placeholder={'Select Role'}
                menuPosition="bottom"
                value={roleId}
                onChange={(_, value) => onSelectRole(value)}
                searchable={false}
                checkbox={true}
                searchOptions={true}
              />
            </div>
          </div>
        </div>
        <Table
          tableData={selectedGroupPermissions}
          loadingData={loadingData}
          wrapperClass={'mt-3 ' + classNames['manage-permission-table']}
          columns={columns}
          loadingMore={loadingMore}
          expandRow={expandRow}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
        />
        {(authProvider.canAdd.users_permissions ||
          authProvider.canEdit.users_permissions) && (
          <div className={classNames['save-btn']}>
            <Button
              onClick={() => {
                onSavePermissions();
              }}
              disabled={!roleId || !authProvider.canEdit.users_permissions}
            >
              Save
            </Button>
          </div>
        )}
      </div>
      {/* Delete User Modal popup */}
      <Modal
        className={'side-modal ' + classNames['remove-modal']}
        show={deleteModalOpen}
        onHide={onDeleteModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Delete Confirmation</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <p className={classNames['remove-text']}>
            Are you sure you want to Deactivate?
          </p>
          <div className="d-flex justify-content-end pt-20 ">
            <Button onClick={() => {}}>Yes</Button>
          </div>
        </Modal.Body>
      </Modal>
      {/* Edit User Modal Popup */}
      <Modal
        className={'side-modal ' + classNames['edit-user-modal']}
        show={editModalOpen}
        onHide={onEditModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="xl"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Delete Confirmation</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Row className="m-0">
            <Col md="6" className="pl-0 pr-4_5">
              <div className="side-form-group ">
                <label>Studio</label>
                <div className={classNames['Studio_select']}>
                  <Select
                    name="Studio"
                    options={[
                      {label: 'SIDE - London', value: 'side1'},
                      {
                        label: 'SIDE - London',
                        value: 'side2',
                      },
                    ]}
                    placeholder={'Select Studio'}
                    menuPosition="bottom"
                    onChange={() => {}}
                    multiSelect={true}
                    searchable={false}
                    checkbox={true}
                    searchOptions={true}
                  />
                </div>
              </div>
            </Col>

            <Col md="6" className="pl-0 pr-0">
              <div className="side-form-group ">
                <label>Role</label>
                <div className={classNames['Role_select']}>
                  <Select
                    name="Role"
                    options={[
                      {label: 'Project Manager', value: 'pm1'},
                      {
                        label: 'Product Manager',
                        value: 'pm2',
                      },
                    ]}
                    placeholder={'Select Role'}
                    menuPosition="bottom"
                    onChange={() => {}}
                    searchable={false}
                    checkbox={true}
                    searchOptions={true}
                  />
                </div>
              </div>
            </Col>

            <Col md="6" className="pl-0 pr-4_5">
              <div className="side-form-group ">
                <label>Type</label>
                <div className={classNames['Type_select']}>
                  <Select
                    name="Type"
                    options={[
                      {label: 'Engineer', value: 'e1'},
                      {
                        label: 'Type2',
                        value: 'e2',
                      },
                    ]}
                    placeholder={'Select Type'}
                    menuPosition="bottom"
                    onChange={() => {}}
                    searchable={false}
                    checkbox={true}
                    searchOptions={true}
                  />
                </div>
              </div>
            </Col>

            <Col md="6" className="pl-0 pr-0">
              <div className="side-form-group ">
                <label>Identification Colour</label>
                <div className={classNames['Studio_select']}>
                  <Select
                    name="Color"
                    options={[
                      {label: 'Dark Red - #f01010', value: 'c1'},
                      {
                        label: 'Dark pink - #f0f010',
                        value: 'c22',
                      },
                    ]}
                    placeholder={'Select Colour'}
                    menuPosition="bottom"
                    onChange={() => {}}
                    searchable={false}
                    checkbox={true}
                    searchOptions={true}
                  />
                </div>
              </div>
            </Col>
          </Row>
          <div className="d-flex justify-content-end pt-20 ">
            <Button onClick={() => {}}>Save</Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ManageGroup;
