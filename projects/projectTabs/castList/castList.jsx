import {useState, useContext, useEffect, useMemo} from 'react';
import {Button, Modal, Image} from 'react-bootstrap';
import Table from 'components/Table';
import TableSortArrows from 'components/TableSortArrows/table-sort-arrows';
import classNames from '../../projects.module.css';
import classNamesViewPo from '../../../Finance/Quotes/quotes.module.css';
import styles from '../../projectList/projectList.module.css';
import {CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';
import {
  mapToLabelValue,
  until,
  downloadFileFromData,
  focusWithInModal,
} from '../../../helpers/helpers';
import {toastService} from 'erp-react-components';
import {
  fetchCharacterFromMileStone,
  fetchCastList,
  postCharacterChange,
  removeTalent,
  postTalent,
  fetchAllTalents,
  fetchNextRecords,
  fetchViewPo,
  fetchShortList,
} from './castList.api';
import {AuthContext} from 'contexts/auth.context';
import {downloadPdf} from 'apis/s3.api';
import ViewPo from '../../../Finance/PoBook/viewPo';
import {DataContext} from 'contexts/data.context';
import {ConfirmPopup} from 'erp-react-components';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';

const CastList = ({projectDetails}) => {
  const {permissions} = useContext(AuthContext);
  const dataProvider = useContext(DataContext);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewPoModalOpen, setViewPoModalOpen] = useState(false);
  const [addTalentModalOpen, setAddTalentModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMileStone] = useState('');
  const [selectedCharacterValue, setselectedCharacterValue] = useState([]);
  const [characterList, setCharacterList] = useState([]);
  const [selectedtalentId, setSelectedTalentId] = useState('');
  const [castList, setCastList] = useState([]);
  const [talentOptions, settalentOptions] = useState([]);
  const [talentShortListOptions, setTalentShortListOptions] = useState([]);
  const [addTalentData, setAddTalentData] = useState({
    talentId: '',
    characterId: '',
  });
  const [castListId, setCastListId] = useState('');
  const [viewPoData, setViewPoData] = useState({});
  const [selectedCheckbox, setSelectedCheckbox] = useState({
    state: true,
    name: 'general',
  });

  useEffect(() => {
    dataProvider.getCurrency();
  }, []);
  useEffect(() => {
    if (selectedMilestone) {
      getCharacterFromMileStone(selectedMilestone);
      getCastList(selectedMilestone);
    }
  }, [selectedMilestone]);

  const getCharacterFromMileStone = async (selectedMilestone) => {
    const [err, data] = await until(
      fetchCharacterFromMileStone(selectedMilestone),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }

    setCharacterList(data.result || []);
  };
  const submitTalent = async () => {
    let obj = addTalentData;
    const [err, data] = await until(postTalent(obj, selectedMilestone));
    if (err) {
      return toastService.error({msg: err.message});
    }
    onAddTalentModalClose();
    toastService.success({msg: data.message});
    getCastList(selectedMilestone);
  };
  const getAllTalents = async () => {
    const [err, data] = await until(fetchAllTalents());
    if (err) {
      return toastService.error({msg: err.message});
    }
    settalentOptions(data.result);
  };
  const getShortListTalents = async (characterId) => {
    const [err, data] = await until(fetchShortList(characterId));
    if (err) {
      return toastService.error({msg: err.message});
    }
    const talents = (data.result || []).map((d) => ({
      id: d?.talentId,
      name: d.talent,
    }));
    setTalentShortListOptions(talents);
  };
  const getCastList = async (selectedMilestone) => {
    setLoadingData(true);
    const [err, data] = await until(fetchCastList(selectedMilestone));
    setLoadingData(false);
    if (err) {
      return toastService.error({msg: err.message});
    }
    setNextUrl(data.next);
    setCastList(data.result || []);
    setNextUrl(data.next);
  };

  const getViewPo = async (id) => {
    const [err, data] = await until(fetchViewPo(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setViewPoData(data.result?.[0]);
  };

  useEffect(() => {
    if (projectDetails)
      setSelectedMileStone((projectDetails?.projectMilestones[0] || []).id);
  }, [projectDetails]);

  const onRemoveModalClose = () => {
    setRemoveModalOpen(false);
    setSelectedTalentId('');
  };
  const showRemoveModal = (id) => {
    document.activeElement.blur();
    setSelectedTalentId(id);
    setRemoveModalOpen(true);
  };
  const onAddModalClose = () => {
    setAddModalOpen(false);
  };
  const onViewPoModalClose = () => {
    setViewPoModalOpen(false);
  };
  const showAddModal = (id, char_id) => {
    setAddModalOpen(true);
    setCastListId(id);
    setselectedCharacterValue(char_id);
  };
  const showViewPo = (id) => {
    getViewPo(id);
    setViewPoModalOpen(true);
  };
  const selectedCharacter = (value) => {
    setselectedCharacterValue(value);
  };
  const onCharacterChangeSubmit = (e) => {
    e.preventDefault();
    const data = {
      characterId: selectedCharacterValue,
    };
    postCharacters(data);
  };
  const postCharacters = async (characterData) => {
    const [err, data] = await until(
      postCharacterChange(castListId, characterData),
    );
    if (err) {
      return toastService.error({msg: err.message});
    }
    onAddModalClose();
    getCastList(selectedMilestone);
    toastService.success({msg: data.message});
  };

  const onRemoveTalent = async () => {
    const [err, data] = await until(
      removeTalent(selectedtalentId, projectDetails?.id),
    );
    if (err) {
      onRemoveModalClose();
      return toastService.error({msg: err.message});
    }
    onRemoveModalClose();
    getCastList(selectedMilestone);
    toastService.success({msg: data.message});
  };
  const onAddTalentModalClose = () => {
    setAddTalentModalOpen(false);
    setAddTalentData({});
    setSelectedCheckbox({
      state: true,
      name: 'general',
    });
    setTalentShortListOptions([]);
  };
  const showAddTalentModal = (id) => {
    setAddTalentModalOpen(true);
  };
  const noDataFormatter = (cell) => cell || '--';

  const fetchMoreRecords = async () => {
    setLoadingMore(true);
    const [err, data] = await until(fetchNextRecords(nextUrl));
    setLoadingMore(false);
    if (err) {
      return console.error(err);
    }
    setCastList(castList.concat(data.result));
    setNextUrl(data.next);
  };
  const setFieldValues = (name, value) => {
    setAddTalentData({...addTalentData, [name]: value});
  };
  const actionFormatter = (cell, row, rowIndex, formatExtraData) => {
    const actionFormatterData = [
      {
        label: 'Remove',
        onclick: () => {
          showRemoveModal(row.id);
        },
        disabled: row.talentStatus === 'Inactive',
        show: true,
      },
      {
        label: 'Change Character',
        onclick: () => {
          showAddModal(row.talentShortlistId, row.characterId);
        },
        disabled: row.talentStatus === 'Inactive',
        show: true,
      },
      {
        label: 'View PO',
        onclick: () => {
          showViewPo(row.poId);
        },
        disabled: !row.poId,
        show: true,
      },
    ];
    return (
      <CustomDropDown
        menuItems={actionFormatterData}
        dropdownClassNames={classNames['Castlist_dropdown']}
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
  const nameFormatter = (cell, row, rowIndex, formatExtraData) => {
    return (
      <>
        <div className="d-flex align-items-center">
          <p className="mb-0 truncate" onClick={() => {}}>
            {row.talent}
          </p>
          <span> {row.talentStatus === 'Inactive' ? ' (Inactive)' : ''}</span>
        </div>
      </>
    );
  };

  const onDownload = (path, filename) => {
    downloadSelectedFile(path, filename);
  };
  async function downloadSelectedFile(path, filename) {
    const data = {
      file_path: path,
    };
    const [err, res] = await until(downloadPdf(data));
    if (err) {
      return console.error(err);
    }
    downloadFileFromData(res, filename);
  }

  const attachmentFormatter = (row) => {
    if (!row.length) return '--';
    return (
      <>
        {(row || []).map((file, index) => {
          return (
            <div
              className={`${styles['project-name-color']} navigation-column`}
              key={file.filename}
              style={{cursor: 'pointer'}}
              onClick={() => onDownload(file.filepath, file.filename)}
            >
              <p className="mb-0 truncate">{file.filename}</p>
            </div>
          );
        })}
      </>
    );
  };

  const columns = useMemo(() => {
    const cols = [
      {
        dataField: 'talent',
        text: 'Talent',
        headerClasses: styles['Talent'],
        sort: true,
        sortCaret: TableSortArrows,
        formatter: nameFormatter,
      },
      {
        dataField: 'character',
        text: 'Character',
        formatter: noDataFormatter,
        headerClasses: styles['character'],
        sort: true,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'suppliersData',
        text: 'Supplier',
        headerClasses: styles['supplier'],
        sort: true,
        formatter: noDataFormatter,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'billingDuration',
        text: 'Billing Duration',
        headerClasses: styles['bduartion'],
        sort: true,
        formatter: noDataFormatter,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'buyout',
        text: 'Buyout',
        headerClasses: styles['buyout'],
        sort: true,
        formatter: noDataFormatter,
        sortCaret: TableSortArrows,
      },
      {
        dataField: 'documents',
        text: 'Documents',
        headerClasses: styles['calendar-header'],
        formatter: attachmentFormatter,
      },
    ];

    if (permissions['Projects']?.['Cast List']?.isEdit) {
      cols.push({
        dataField: 'more_actions',
        text: '',
        headerClasses: 'action-header',
        classes: 'overflow-visible',
        formatter: actionFormatter,
      });
    }
    return cols;
  }, [actionFormatter]);

  const addTalentPopUp = () => {
    showAddTalentModal(true);
    getAllTalents();
  };
  return (
    <>
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="side-form-group mb-0">
            <div className={classNames['mile_select']}>
              <CustomSelect
                name="milestone"
                options={mapToLabelValue(
                  (projectDetails || {}).projectMilestones
                    ? (projectDetails || {}).projectMilestones
                    : [],
                )}
                placeholder={'Select Milestone'}
                menuPosition="bottom"
                renderDropdownIcon={SelectDropdownArrows}
                onChange={(value) => setSelectedMileStone(value)}
                searchable={false}
                checkbox={true}
                searchOptions={true}
                value={selectedMilestone}
                unselect={false}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className="d-flex flex-column flex-grow-1 overflow-auto"
        data-testid="data-section"
      >
        <Table
          tableData={(castList || []).map((d) => ({
            ...d,
            billingDuration: d.billingDuration ? `${d.billingDuration} hr` : '',
            suppliersData:
              (d.suppliers || []).length > 0
                ? (d.suppliers || []).map((v) => v.supplier).join(', ')
                : '--',
          }))}
          loadingData={loadingData}
          wrapperClass={styles['castList-table']}
          columns={columns}
          loadingMore={loadingMore}
          nextUrl={nextUrl}
          fetchMoreRecords={fetchMoreRecords}
        />
      </div>
      {permissions['Projects']?.['Cast List']?.isAdd && (
        <div className="d-flex justify-content-end pt-20">
          <Button
            className={classNames['add-talent-btns']}
            variant="primary"
            onClick={addTalentPopUp}
          >
            Add Talent
          </Button>
        </div>
      )}

      <div data-testid="remove-talent-section">
        <ConfirmPopup
          show={removeModalOpen}
          onClose={() => {
            onRemoveModalClose();
          }}
          title={'Remove Confirmation'}
          message={'Are you sure you want to remove?'}
          actions={[
            {label: 'Remove', onClick: () => onRemoveTalent()},
            {label: 'Cancel', onClick: () => onRemoveModalClose()},
          ]}
        ></ConfirmPopup>
      </div>

      <Modal
        className={'side-modal ' + classNames['add-modal']}
        show={addModalOpen}
        onHide={onAddModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        enforceFocus={false}
        size="sm"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Change Character</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <form autoComplete="off" onSubmit={onCharacterChangeSubmit}>
            <div className="row m-0 ml-1">
              <div className={'col-md-12 pl-0 pr-0'}>
                <div
                  className={
                    'side-form-group mb-0 ' + classNames['label-bottom']
                  }
                >
                  <label>Character</label>
                  <div className={classNames['gender-select']}>
                    <CustomSelect
                      name="Character"
                      options={mapToLabelValue(characterList)}
                      placeholder={'Select Character'}
                      menuPosition="bottom"
                      renderDropdownIcon={SelectDropdownArrows}
                      onChange={selectedCharacter}
                      multiSelect={false}
                      searchable={false}
                      checkbox={true}
                      searchOptions={true}
                      value={selectedCharacterValue}
                      unselect={false}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end pt-20">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal
        className={'side-modal ' + classNames['add-modal']}
        show={addTalentModalOpen}
        onHide={onAddTalentModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="sm"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">Add Talent</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <form autoComplete="off">
            <div className="row m-0 ml-1">
              <div className={'col-md-12 pl-0 pr-0'}>
                <div className="d-flex mb-1">
                  <div className="d-flex align-items-center">
                    <div className="custom-control custom-radio pl-0">
                      <input
                        type="radio"
                        className="custom-control-input"
                        id="shortlisted"
                        name="shortlisted"
                        checked={
                          selectedCheckbox?.name === 'shortlisted'
                            ? selectedCheckbox?.state
                            : false
                        }
                        onChange={() => {
                          setAddTalentData({
                            talentId: '',
                            characterId: '',
                          });
                          setSelectedCheckbox({
                            state: true,
                            name: 'shortlisted',
                          });
                          if (addTalentData.characterId) {
                            getShortListTalents(addTalentData.characterId);
                          }
                        }}
                      />

                      <label
                        className="custom-control-label"
                        htmlFor="shortlisted"
                        style={{cursor: 'pointer'}}
                      >
                        {' '}
                        Shortlisted
                      </label>
                    </div>
                  </div>
                  <div className="d-flex align-items-center ml-3_2">
                    <div className="custom-control custom-radio pl-0">
                      <input
                        type="radio"
                        className="custom-control-input"
                        id="general"
                        name="general"
                        checked={
                          selectedCheckbox?.name === 'general'
                            ? selectedCheckbox?.state
                            : false
                        }
                        onChange={() => {
                          setAddTalentData({
                            talentId: '',
                            characterId: '',
                          });
                          setSelectedCheckbox({
                            state: true,
                            name: 'general',
                          });
                        }}
                      />

                      <label
                        className="custom-control-label"
                        htmlFor="general"
                        style={{cursor: 'pointer'}}
                      >
                        General
                      </label>
                    </div>
                  </div>
                </div>

                <div
                  className={'side-form-group ' + classNames['label-bottom']}
                >
                  <label>Character*</label>
                  <div className={classNames['gender-select']}>
                    <CustomSelect
                      name="characterId"
                      options={mapToLabelValue(characterList)}
                      placeholder={'Select Character'}
                      menuPosition="bottom"
                      renderDropdownIcon={SelectDropdownArrows}
                      onChange={(value) => {
                        setFieldValues('characterId', value);
                        if (selectedCheckbox?.name === 'shortlisted' && value) {
                          getShortListTalents(value);
                        }
                      }}
                      value={addTalentData.characterId}
                      searchable={false}
                      checkbox={true}
                      searchOptions={true}
                      unselect={false}
                    />
                  </div>
                </div>
              </div>
              <div className={'col-md-12 pl-0 pr-0'}>
                <div
                  className={
                    'side-form-group mb-0 position-relative ' +
                    classNames['label-bottom']
                  }
                >
                  <label>Talent*</label>
                  <div className={classNames['gender-select']}>
                    <CustomSelect
                      name="talentId"
                      options={mapToLabelValue(
                        selectedCheckbox?.name === 'general'
                          ? talentOptions
                          : talentShortListOptions,
                      )}
                      value={addTalentData.talentId}
                      placeholder={'Select Talent'}
                      menuPosition="bottom"
                      renderDropdownIcon={SelectDropdownArrows}
                      onChange={(value) => setFieldValues('talentId', value)}
                      searchable={false}
                      checkbox={true}
                      searchOptions={true}
                      unselect={false}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end mt-4 ">
              <Button
                onClick={submitTalent}
                disabled={
                  !addTalentData?.characterId || !addTalentData?.talentId
                }
              >
                Submit
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* viewPo modal */}
      <Modal
        className={'side-modal ' + classNamesViewPo['view_po-modal']}
        show={viewPoModalOpen}
        onHide={onViewPoModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="lg"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <p className="title-modal">View Po</p>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 side-custom-scroll d-flex flex-column flex-grow-1">
          <ViewPo
            viewPoData={viewPoData}
            currencyList={dataProvider.currencyList}
            fromFeature={'castList'}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CastList;
