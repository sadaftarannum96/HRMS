import {useState, useContext, useEffect, useRef} from 'react';
import {Button, Modal, Image, Spinner, Dropdown} from 'react-bootstrap';
import _ from 'lodash';
import Pagination from 'components/pagination';
import Profile from '../../images/svg/users-default.svg';
import classNames from './talentSearch.module.css';
import Dots from '../../images/Side-images/Green/vDots_black-hor.svg';
import HDotsgreen from '../../images/Side-images/Green/vDots_green-hor.svg';
import TalentsEmpty from '../../images/Side-images/talent-icon.svg';
import TalentsNotFound from '../../images/Side-images/Talent-notfound-icon.svg';
import {Link} from 'react-router-dom';
import {
  fetchAllTalent,
  removeTalent,
  checkTalentDependency,
  importTalentPost,
  importUpdateTier,
  downloadTemplate,
  downloadUpdateTierTemplate,
  fetchImagesOfTalents,
} from './talentSearch.api';
import {
  until,
  downloadFileFromData,
  bytesIntoMb,
  throttle,
  focusWithInModal,
} from 'helpers/helpers';
import ViewTalentTabs from '../talentSearch/viewTalent/index';
import {useHistory} from 'react-router-dom';
import TalentFilter from './talentFilter';
import {toastService} from 'erp-react-components';
import {
  getTalentData,
  shortlistTalent,
  updateTalent,
} from './talentDetails.api';
import Dropzone from 'react-dropzone';
import UploadUpdate from 'images/Side-images/Icon feather-upload.svg';
import UploadWhite from 'images/Side-images/Green/upload-wh.svg';
import {fetchSearchAdvance} from '../../apis/data.api';
import {DataContext} from '../../contexts/data.context';
import {Loading} from 'components/LoadingComponents/loading';
import CompareClose from '../../images/Side-images/close-icon.svg';
import TopNavBar from 'components/topNavBar';
import RightAngle from 'components/angleRight';
import Shortlist from './shortlist';
import {AuthContext} from 'contexts/auth.context';
import {ConfirmPopup} from 'erp-react-components';
import '../../components/customDropdown/customDropdown.css';
import CloseWhite from 'images/Side-images/Green/Close-wh.svg';
import Import from 'components/Import/index';

const TalentSearch = (props) => {
  const history = useHistory();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [totalCount, settotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchStr, setSearchStr] = useState('');
  const [selectedTalentData, setSelectedTalentData] = useState({});
  const [talents, setTalents] = useState([]);
  const [currentTalentId, setCurrentTalentId] = useState(null);
  const [uploadImportModalOpen, setUploadImportModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [importimage, setImportimage] = useState({});
  const [importTierimage, setImportTierimage] = useState({});
  const [importSelectFile, setImportSelectFile] = useState('');
  const [importTierFile, setImportTierFile] = useState('');
  const [defaultScreen, setDefaultScreen] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoRecords, setIsNoRecords] = useState(false);
  const [searchResult, setSearchResult] = useState({});
  const [showCompareList, setShowCompareList] = useState(false);
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [hasDependencies, setHasDependencies] = useState(false);
  const [selectedSort, setSelectedSort] = useState('newestFirst');
  const [talentImagesList, setTalentImagesList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dataProvider = useContext(DataContext);
  const [compareTalentList, setCompareTalentList] = useState(
    dataProvider.compareTalentList,
  );
  const {permissions} = useContext(AuthContext);

  useEffect(() => {
    dataProvider.setData(compareTalentList);
  }, [compareTalentList]);

  useEffect(() => {
    const talent_State = props.location.state;
    if (!talent_State) return () => {};
    if (talent_State?.id) {
      fetchIndivisualData(talent_State.id);
      onViewTalent(talent_State.id);
    }
  }, [props.location]);

  useEffect(() => {
    let isSearch = localStorage.getItem('clearSearch');
    if (isSearch && !_.isEmpty(searchResult)) {
      advanceSearch(currentPage, searchResult);
    } else {
      if (currentPage > 1 && searchStr) {
        getAllTalentList(1, searchStr);
      } else {
        getAllTalentList(currentPage, searchStr);
      }
    }
  }, [currentPage, searchStr, selectedSort]);

  useEffect(() => {
    return () => {
      localStorage.removeItem('clearSearch');
    };
  }, []);

  function importHandle(files) {
    if (
      files[0].type !==
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return toastService.error({
        msg: 'Expecting xlsx file format.',
      });
    }
    const fileSize = bytesIntoMb(files[0].size);
    if (fileSize > 5) {
      return toastService.error({
        msg: 'The file size is greater than 5MB.',
      });
    }
    setImportSelectFile(files[0].name);
    setImportimage(files[0]);
  }

  function importUpdateTierHandle(files) {
    if (
      files[0].type !==
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return toastService.error({
        msg: 'Expecting xlsx file format.',
      });
    }
    const fileSize = bytesIntoMb(files[0].size);
    if (fileSize > 5) {
      return toastService.error({
        msg: 'The file size is greater than 5MB.',
      });
    }
    setImportTierFile(files[0].name);
    setImportTierimage(files[0]);
  }
  const onUploadImportModalClose = () => {
    setUploadImportModalOpen(false);
    setImportSelectFile('');
    setImportimage({});
    setDefaultScreen('empty');
  };

  const onUpdateTierModalClose = () => {
    setUploadModalOpen(false);
    setImportTierFile('');
    setImportTierimage({});
    setDefaultScreen('empty');
  };

  const showUploadImportModal = () => {
    setUploadImportModalOpen(true);
  };

  const showUploadTierModal = () => {
    setUploadModalOpen(true);
  };

  const onAudioModalClose = () => {
    setAudioModalOpen(false);
    setCurrentTalentId('');
  };

  const onDeleteModalClose = (e) => {
    setDeleteModalOpen(false);
  };
  const showDeleteModal = (id) => {
    setCurrentTalentId(id);
    checkTalentDependencyApi(id);
  };
  const [shortlistModalOpen, setShortlistModalOpen] = useState(false);
  const onShortlistModalClose = (e) => {
    setShortlistModalOpen(false);
  };
  const showShortlistModal = (id) => {
    setCurrentTalentId(id);
    setShortlistModalOpen(true);
  };

  const editTalent = (id) => {
    history.push(`/talent/talentSearch/editTalent/${id}`);
  };
  const popperConfig = {
    strategy: 'fixed',
  };
  useEffect(() => {
    if (currentTalentId) fetchIndivisualData(currentTalentId);
  }, [currentTalentId]);

  const addToCompare = async (id) => {
    setCurrentTalentId(id);
    document.body.click();
    let result = compareTalentList.length > 0 ? compareTalentList : [];
    let talentIsExists = result.filter((d) => d.id === id);
    if (talentIsExists.length > 0) {
      return toastService.error({
        msg: 'This talent already exists in the compare list.',
      });
    }
    if (result.length > 7) {
      return toastService.error({
        msg: 'You have reached the maximum capacity for comparison.',
      });
    }
    const [err, res] = await until(getTalentData(id));
    const data = res?.result;
    if (err) return console.error(err);
    if (data?.length) {
      result.push(data[0]);
      setCompareTalentList(result);
      return toastService.success({
        msg: `${data[0]?.firstName} ${data[0]?.lastName} has been added to compare list.`,
        actions: [{label: 'Undo', onClick: () => undoAddedTalent(data[0]?.id)}],
      });
    }
  };

  const undoAddedTalent = (undoTalentId) => {
    let list = compareTalentList.filter((d) => d.id !== undoTalentId);
    setCompareTalentList(list);
  };

  const onChangePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getAllTalentList = async (pageNumber, searchStr) => {
    setIsLoading(true);
    const [err, res] = await until(
      fetchAllTalent(selectedSort, pageNumber, searchStr),
    );
    if (err) {
      setIsLoading(false);
      console.error(err);
      return toastService.error({msg: err.message})
    }
    localStorage.removeItem('clearSearch');
    setTalents(res.result);
    const talentIds = (res.result || []).map((d) => Number(d.id));
    if (talentIds.length > 0) {
      getImagesOfTalents(talentIds);
    }
    settotalCount(res.count);
    if (res.result.length === 0 && !searchStr) {
      setIsNoRecords(true);
    }
    setIsLoading(false);
  };

  const getImagesOfTalents = async (ids) => {
    const [err, res] = await until(fetchImagesOfTalents(ids));
    if (err) {
      return console.error(err);
    }
    setTalentImagesList(res);
  };

  const deleteTalent = async (talent_id) => {
    const [err, res] = await until(removeTalent(talent_id));
    if (err) {
      return console.error(err);
    }
    let updateData = dataProvider.compareTalentList.filter(
      (t) => t.id !== talent_id,
    );
    dataProvider.setData(updateData);
    setCompareTalentList(updateData);
    setDeleteModalOpen(false);
    let isSearch = localStorage.getItem('clearSearch');
    if (isSearch && !_.isEmpty(searchResult)) {
      advanceSearch(currentPage, searchResult);
    } else {
      getAllTalentList(currentPage, searchStr);
    }
    return toastService.success({msg: res.message});
  };
  const getSearchValue = (value) => {
    setSearchStr(value);
  };

  const onViewTalent = (id) => {
    setCurrentTalentId(id);
    setAudioModalOpen(true);
    if (props.location.state) {
      window.history.replaceState({}, null);
    }
  };

  async function fetchIndivisualData(id) {
    const [err, res] = await until(getTalentData(id));
    if (err) {
      return toastService.error({msg: err.message});
    }
    const data = res.result[0];
    if (permissions['Talent']?.['Talent Data']?.isEdit) {
      updateViewCount(id, data.viewCount);
    }
    setSelectedTalentData(data);
  }

  async function updateViewCount(id, count) {
    const data = {
      viewCount: count + 1,
    };
    const [err] = await until(updateTalent(id, data));
    if (err) {
      return toastService.error({msg: err.message});
    }
  }

  const deleteTalentData = () => {
    deleteTalent(currentTalentId);
  };

  const checkTalentDependencyApi = async (talent_id) => {
    const [err, res] = await until(checkTalentDependency(talent_id));
    if (err) {
      return console.error(err);
    }
    setHasDependencies(res.talentDependencies);
    setDeleteModalOpen(true);
  };
  async function searchAdv(obj) {
    setSearchResult(obj);
    if (_.isEmpty(obj)) return;
    advanceSearch(1, obj);
  }

  async function advanceSearch(number, obj) {
    setIsLoading(true);
    const [err, data] = await until(fetchSearchAdvance(number, searchStr, obj));
    if (err) {
      localStorage.removeItem('clearSearch');
      return toastService.error({msg: err.message});
    }
    localStorage.setItem('clearSearch', true);
    settotalCount(data.count);
    setTalents(data.result);
    setIsLoading(false);
  }

  const onDownloadTemplate = async () => {
    const [err, response] = await until(downloadTemplate());
    if (err) {
      return;
    }
    if (response) {
      const filename = response.headers['content-disposition']
        .split('filename=')[1]
        .split('"')[1];
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const onDownloadUpdateTierTemplate = async () => {
    const [err, response] = await until(downloadUpdateTierTemplate());
    if (err) {
      return;
    }
    if (response) {
      const filename = response.headers['content-disposition']
        .split('filename=')[1]
        .split('"')[1];
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const onImportTalent = async (e) => {
    e.preventDefault();
    if (isLoadingImport) return () => {};
    if (_.isEmpty(importimage)) {
      return toastService.error({msg: 'Please upload file.'});
    } else {
      const formData = new FormData();
      formData.append('data_file', importimage);
      setIsLoadingImport(true);
      const [err, res] = await until(importTalentPost(formData));
      if (err) {
        setIsLoadingImport(false);
        if (err.type === 'application/json') {
          const error = await new Response(err)
            .json()
            .catch((err) => console.error(err));
          return toastService.error({
            msg: error.message,
          });
        }
        if (
          typeof err == 'object' &&
          (err.type || '').startsWith('application/') &&
          err.type !== 'application/json'
        ) {
          setImportSelectFile('');
          setImportimage({});
          setUploadImportModalOpen(false);
          getAllTalentList(currentPage, searchStr);
          setDefaultScreen('empty');
          toastService.error({
            msg: 'Check the downloaded file for invalid import data',
          });
          return downloadFileFromData(
            err,
            `import_talent_failure_${Date.now()}.xlsx`,
          );
        }
        return toastService.error({
          msg: err.message,
        });
      }
      setIsLoadingImport(false);
      if (typeof res == 'string') {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `import_talent_failure_${Date.now()}.xlsx`,
        );
      }
      if (
        typeof res == 'object' &&
        (res.type || '').startsWith('application/') &&
        res.type !== 'application/json'
      ) {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `import_talent_failure_${Date.now()}.xlsx`,
        );
      }
      getAllTalentList(currentPage, searchStr);
      setUploadImportModalOpen(false);
      setImportSelectFile('');
      setImportimage({});
      setDefaultScreen('empty');
      return toastService.success({
        msg: 'All records uploaded successfully.',
      });
    }
  };

  const onImportUpdateTier = async (e) => {
    e.preventDefault();
    if (isLoadingImport) return () => {};
    if (_.isEmpty(importTierimage)) {
      return toastService.error({msg: 'Please upload file.'});
    } else {
      const formData = new FormData();
      formData.append('data_file', importTierimage);
      setIsLoadingImport(true);
      const [err, res] = await until(importUpdateTier(formData));
      if (err) {
        setIsLoadingImport(false);
        if (err.type === 'application/json') {
          const error = await new Response(err)
            .json()
            .catch((err) => console.error(err));
          return toastService.error({
            msg: error.message,
          });
        }
        if (
          typeof err == 'object' &&
          (err.type || '').startsWith('application/') &&
          err.type !== 'application/json'
        ) {
          setImportTierFile('');
          setImportTierimage({});
          setUploadModalOpen(false);
          getAllTalentList(currentPage, searchStr);
          setDefaultScreen('empty');
          toastService.error({
            msg: 'Check the downloaded file for invalid import data',
          });
          return downloadFileFromData(
            err,
            `import_talent_failure_${Date.now()}.xlsx`,
          );
        }
        return toastService.error({
          msg: err.message,
        });
      }
      setIsLoadingImport(false);
      if (typeof res == 'string') {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `import_talent_failure_${Date.now()}.xlsx`,
        );
      }
      if (
        typeof res == 'object' &&
        (res.type || '').startsWith('application/') &&
        res.type !== 'application/json'
      ) {
        toastService.error({
          msg: 'Check the downloaded file for invalid import data',
        });
        return downloadFileFromData(
          res,
          `import_talent_failure_${Date.now()}.xlsx`,
        );
      }
      getAllTalentList(currentPage, searchStr);
      setUploadModalOpen(false);
      setImportTierFile('');
      setImportTierimage({});
      setDefaultScreen('empty');
      return toastService.success({
        msg: 'All records uploaded successfully.',
      });
    }
  };

  const removeTalentFromList = (id) => {
    const filterList = compareTalentList.filter((d) => d.id !== id);
    if (filterList.length === 0) setShowCompareList(false);
    setCompareTalentList(filterList);
  };

  const onRemoveAllTalentList = () => {
    setCompareTalentList([]);
  };

  const navigateToCompare = () => {
    history.push('/talent/compare');
  };

  const onSubmitShortlist = async (character, result) => {
    setIsSubmitting(true);
    const [err, res] = await until(shortlistTalent(character, result));
    setIsSubmitting(false);
    if (err) {
      return toastService.error({
        msg: err.message,
      });
    }
    setCurrentTalentId('');
    onShortlistModalClose();
    return toastService.success({
      msg: res.message,
    });
  };
  const shortlistModalFunc = (x) => {
    setAudioModalOpen(false);
    setShortlistModalOpen(true);
  };
  const onChangeSort = (value) => {
    setSelectedSort(value);
  };

  async function onActivateTalent(id) {
    const data = {
      status: 'Active',
    };
    const [err, res] = await until(updateTalent(id, data));
    if (err) {
      return toastService.error({msg: err.message});
    }
    setCurrentTalentId('');
    getAllTalentList(currentPage, searchStr);
    return toastService.success({msg: res.message});
  }

  const [dropdownOpenedId, setDropdownOpenedId] = useState(null);

  const onToggle = (talentId) => {
    if (dropdownOpenedId === talentId) {
      setDropdownOpenedId(null);
    } else {
      setDropdownOpenedId(talentId);
    }
  };

  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );

  return (
    <>
      <TopNavBar>
        <li>
          <Link to="/talent/talentSearch">Talent</Link>
        </li>
        <RightAngle />
        <li>
          <Link to="#">Talent Search</Link>
        </li>
      </TopNavBar>

      <div className="without-side-container pb-3 pr-0 ">
        <div
          className="d-flex flex-grow-1 flex-column"
          style={{
            paddingRight: '1.75rem',
            overflow: 'auto',
            paddingBottom: '3px',
          }}
        >
          <TalentFilter
            isTalent={true}
            getSearchValue={getSearchValue}
            searchAdv={searchAdv}
            showUploadImportModal={showUploadImportModal}
            showUploadTierModal={showUploadTierModal}
            defaultScreen={defaultScreen}
            clearSearchResult={() => getAllTalentList(currentPage, searchStr)}
            selectedSort={selectedSort}
            onChangeSort={onChangeSort}
          />

          <div
            className={
              'side-custom-scroll-thick flex-grow-1 pr-1 ' +
              classNames['scroll-bottom-space']
            }
            onScroll={throttled.current}
          >
            {talents.length > 0 ? (
              <div className={classNames.cards}>
                {talents.map((talent, index) => {
                  const talentImageExists = talentImagesList.find(
                    (item) => item.id === talent.id,
                  );
                  return (
                    <div
                      className={classNames.profile_cards}
                      key={talent.id}
                      onClick={(e) => {
                        onViewTalent(talent.id);
                      }}
                      style={{cursor: 'pointer'}}
                    >
                      <div className="position-relative ">
                        <div className={classNames.rounded_outer_img}>
                          <Image
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = Profile;
                            }}
                            src={
                              talentImageExists?.image
                                ? `data:image/png;base64,` +
                                  talentImageExists.image
                                : Profile
                            }
                            className={classNames.round_img}
                          />
                        </div>
                        {permissions['Talent']?.['Talent Data']?.isEdit &&
                          talent.status === 'Inactive' && (
                            <div style={{marginBottom:'-1rem'}}
                              className={classNames.profile_dots}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Dropdown
                                className={'toggle-dropdown-box talent-dropdown'}
                                onToggle={() => onToggle(talent.id)}
                                show={dropdownOpenedId === talent.id}
                                drop="bottom"
                               align="end"
                               alignRight
                              >
                                <Dropdown.Toggle
                                  className={
                                    'toggle-dropdown-btn btn btn-link ' +
                                    classNames['h-dots']
                                  }
                                >
                                  <i className="white-dots-dark-theme"> </i>
                                  <Image
                                    src={
                                      dropdownOpenedId === talent.id
                                        ? HDotsgreen
                                        : Dots
                                    }
                                  />
                                </Dropdown.Toggle>
                                <Dropdown.Menu
                                  className="users_dropdown_menu"
                                  dropupauto="true"
                                  popperConfig={popperConfig}
                                  flip={true}
                                >
                                  <Dropdown.Item
                                    className="users_dropdown_item"
                                    onClick={(e) => {
                                      onActivateTalent(talent.id);
                                    }}
                                  >
                                    <div className={classNames['hover-elem']}>
                                      Activate
                                    </div>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    className="users_dropdown_item"
                                    onClick={(e) => {
                                      showDeleteModal(talent.id);
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
                        {(permissions['Talent']?.['Talent Data']?.isAdd ||
                          permissions['Talent']?.['Talent Data']?.isEdit) &&
                          talent.status !== 'Inactive' && (
                            <div style={{marginBottom:'-1rem'}}
                              className={classNames.profile_dots}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Dropdown
                                className={'toggle-dropdown-box talent-dropdown'}
                                onToggle={() => onToggle(talent.id)}
                                show={dropdownOpenedId === talent.id}
                                drop="down"
                                align="end"
                                alignRight
                              >
                                <Dropdown.Toggle
                                  className={
                                    'toggle-dropdown-btn btn-link ' +
                                    classNames['h-dots']
                                  }
                                >
                                  <i className="white-dots-dark-theme"> </i>
                                  <Image
                                    src={
                                      dropdownOpenedId === talent.id
                                        ? HDotsgreen
                                        : Dots
                                    }
                                  />
                                </Dropdown.Toggle>
                                <Dropdown.Menu
                                  className="users_dropdown_menu"
                                  dropupauto="true"
                                  popperConfig={popperConfig}
                                  flip={true}
                                >
                                  {permissions['Talent']?.['Talent Data']
                                    ?.isEdit && (
                                    <Dropdown.Item
                                      className="users_dropdown_item"
                                      onClick={(e) => {
                                        editTalent(talent.id);
                                      }}
                                    >
                                      <div className={classNames['hover-elem']}>
                                        Edit
                                      </div>
                                    </Dropdown.Item>
                                  )}
                                  {permissions['Talent']?.['Talent Data']
                                    ?.isEdit && (
                                    <Dropdown.Item
                                      className="users_dropdown_item"
                                      onClick={(e) => {
                                        showDeleteModal(talent.id);
                                      }}
                                    >
                                      <div className={classNames['hover-elem']}>
                                        Delete
                                      </div>
                                    </Dropdown.Item>
                                  )}
                                  {permissions['Talent']?.['Talent Data']
                                    ?.isAdd && (
                                    <Dropdown.Item
                                      className="users_dropdown_item"
                                      onClick={() => addToCompare(talent.id)}
                                    >
                                      <div className={classNames['hover-elem']}>
                                        Add to Compare
                                      </div>
                                    </Dropdown.Item>
                                  )}
                                  {permissions['Talent']?.['Talent Data']
                                    ?.isAdd &&
                                    permissions['Projects']?.isAdd && (
                                      <Dropdown.Item
                                        className="users_dropdown_item"
                                        onClick={() =>
                                          showShortlistModal(talent.id)
                                        }
                                      >
                                        <div
                                          className={classNames['hover-elem']}
                                        >
                                          Longlist
                                        </div>
                                      </Dropdown.Item>
                                    )}
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          )}
                      </div>
                      <div className="">
                        <h5 className={'mb-3 ' + classNames.card_title}>
                          {talent.firstName + ' ' + talent.lastName}
                          {talent.status === 'Inactive' ? ' (Inactive)' : ''}
                        </h5>
                        <div className="d-flex align-items-center">
                          <p className={'mr-1 ' + classNames.card_details_left}>
                            Agents
                          </p>
                          <p className={classNames.card_details_right}>
                            {talent?.agent || '-'}
                          </p>
                        </div>
                        <div className="d-flex align-items-center">
                          <p className={'mr-1 ' + classNames.card_details_left}>
                            Accents
                          </p>
                          <p className={classNames.card_details_right}>
                            {Object.values(talent.accents || {}).length > 0
                              ? Object.values(talent.accents || {})
                                  .map((v) => v)
                                  .join(', ')
                              : '-'}
                          </p>
                        </div>
                        <div className="d-flex align-items-center">
                          <p className={'mr-1 ' + classNames.card_details_left}>
                            Voice Types
                          </p>
                          <p className={classNames.card_details_right}>
                            {Object.values(talent.voiceTypes || {}).length > 0
                              ? Object.values(talent.voiceTypes || {})
                                  .map((v) => v)
                                  .join(', ')
                              : '-'}
                          </p>
                        </div>
                        <div className="d-flex align-items-center">
                          <p
                            className={
                              'mb-1 mr-1 ' + classNames.card_details_left
                            }
                          >
                            Languages
                          </p>
                          <p
                            className={'mb-1 ' + classNames.card_details_right}
                          >
                            {Object.values(talent.languages || {}).length > 0
                              ? Object.values(talent.languages || {})
                                  .map((v) => v)
                                  .join(', ')
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                {isLoading ? (
                  <Loading />
                ) : isNoRecords ? (
                  <div className={classNames['empty-talents']}>
                    <div className="d-flex justify-content-center align-items-center">
                      <Image src={TalentsEmpty} />
                      <div className="d-block ml-4">
                        <div className="underline">
                          <p>
                            Get Started! Let&lsquo;s{' '}
                            <span style={{color: '#91D000', fontWeight: '600'}}>
                              {' '}
                              add Talent
                            </span>
                          </p>
                        </div>
                        <div className="pt-30 d-flex justify-content-center">
                          <Button
                            variant="primary"
                            className="add-talent-link"
                            style={{marginRight: '0.625rem'}}
                            onClick={() => {}}
                          >
                            <Link to={'/talent/talentSearch/addTalent'}>
                              {' '}
                              Add Talent
                            </Link>
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => setUploadImportModalOpen(true)}
                          >
                            Import Talent
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={classNames['empty-talents-not']}>
                    <div className="d-flex justify-content-center align-items-center">
                      <Image src={TalentsNotFound} />

                      <div className="d-block ml-4">
                        <div className="underline">
                          <p>
                            <span style={{color: '#91D000', fontWeight: '600'}}>
                              {' '}
                              Talent &nbsp;
                            </span>
                            not found
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* Compare Hover box commented here */}
        {showCompareList && compareTalentList.length > 0 && (
          <div
            className="position-relative d-flex justify-content-end"
            onMouseEnter={() => setShowCompareList(true)}
            onMouseLeave={() => setShowCompareList(false)}
          >
            <div className={"talent-list-compare " + classNames['compare-list-box']}>
              <div className={classNames['compare-list-items']}>
                <div className="d-flex mb-4 ">
                  {compareTalentList.slice(0, 4).map((d) => {
                    const talentImageExists = talentImagesList.find(
                      (item) => item.id === d.id,
                    );
                    return (
                      <div className="compare-list-user" key={d.id}>
                        <div className="d-flex justify-content-end">
                          <button
                            className="btn btn-primary mr-2 table_expand_ellpsis remove-icons "
                            onClick={() => removeTalentFromList(d.id)}
                          >
                            <Image
                              src={CompareClose}
                              className="removeIcon"
                            />
                             <Image
                              src={CloseWhite}
                              className="remove-white"
                            />
                          </button>
                        </div>
                        <div className={classNames['b-right']}>
                          <div className="d-flex justify-content-center">
                            <Image
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = Profile;
                              }}
                              src={
                                talentImageExists?.image
                                  ? `data:image/png;base64,` +
                                    talentImageExists.image
                                  : Profile
                              }
                              className={classNames.ProfileImage}
                            />
                          </div>
                          <p className="mb-0 pr-1">{`${d.firstName} ${d.lastName}`}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="d-flex mb-4 ">
                  {compareTalentList.slice(4, 8).map((d) => {
                    const talentImageExists = talentImagesList.find(
                      (item) => item.id === d.id,
                    );
                    return (
                      <div className="compare-list-user" key={d.id}>
                        <div className="d-flex justify-content-end">
                            <button
                            className="btn btn-primary mr-2 table_expand_ellpsis remove-icons "
                            onClick={() =>removeTalentFromList(d.id)}
                          >
                            <Image
                              src={CompareClose}
                              className="removeIcon"
                            />
                             <Image
                              src={CloseWhite}
                              className="remove-white"
                            />
                          </button>
                        </div>
                        <div className={classNames['b-right']}>
                          <div className="d-flex justify-content-center">
                            <Image
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = Profile;
                              }}
                              src={
                                talentImageExists?.image
                                  ? `data:image/png;base64,` +
                                    talentImageExists.image
                                  : Profile
                              }
                              className={classNames.ProfileImage}
                            />
                          </div>
                          <p className="mb-0">{`${d.firstName} ${d.lastName}`}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="d-flex justify-content-end mb-2">
                <button
                  type="button"
                  className="btn btn-secondary side-custom-button  ml-3"
                  style={{marginRight: '1.125rem'}}
                  onClick={onRemoveAllTalentList}
                >
                  Remove All
                </button>
                <button
                  type="button"
                  className={"btn btn-primary d-flex align-items-center position-relative " + classNames["compare-btn"]}
                  onClick={navigateToCompare}
                >
                  <span className="compare-padding">Compare</span>{' '}
                  <span className="badge badge-light">
                    {compareTalentList.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="d-flex justify-content-end mb-0 pb-1 -margin-top-2 ">
          <button
            type="button"
            className={"btn btn-primary without-expand-compare position-relative d-flex align-items-center " + classNames["compare-btn"]}
            onMouseEnter={() => setShowCompareList(true)}
            onMouseLeave={() => setShowCompareList(false)}
          >
            <span className="compare-padding">Compare</span>{' '}
            <span className="badge badge-light">
              {compareTalentList.length}
            </span>
          </button>
        </div>

        {/* Compare list commented here */}

        <Pagination
          pageSize={18}
          items={totalCount}
          onChangePage={onChangePage}
        />
      </div>
      {/* Delete Modal need to create seperate compoennt*/}

      <ConfirmPopup
        show={deleteModalOpen}
        onClose={() => {
          onDeleteModalClose();
        }}
        title={'Delete Confirmation'}
        message={
          hasDependencies === 'Yes'
            ? 'The selected talent is associated with other properties. Do you wish to proceed?'
            : 'Are you sure you want to delete this talent?'
        }
        actions={[
          {label: 'Delete', onClick: () => deleteTalentData()},
          {label: 'Cancel', onClick: () => onDeleteModalClose()},
        ]}
      ></ConfirmPopup>
      {/* Short List Modal */}

      {/* View Talent Modal */}
      <Modal
        className={'side-modal ' + classNames['view-talent-modal']}
        show={audioModalOpen}
        onHide={onAudioModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="xl"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {' '}
            <p className="title-modal">View Talent</p>{' '}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 flex-grow-1">
          <ViewTalentTabs
            selectedTalentData={selectedTalentData}
            shortlistModal={shortlistModalFunc}
            permissions={permissions}
          />
        </Modal.Body>
      </Modal>
      {/* end view talent popup */}

      {/* Import Talent */}
      <Modal
        className={'side-modal ' + classNames['import-talent-modal']}
        show={uploadImportModalOpen}
        onHide={onUploadImportModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title> Import Talent </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {/* Radio Buttons Starts Here */}
          <div
            style={{marginTop: '0.5rem', marginBottom: '1rem'}}
            className={
              'd-flex  align-items-center ' + classNames['add-rule-radio-btn']
            }
          >
            <div
              className={
                'custom-control custom-radio align-self-center align-items-center pl-0 pr-3 ' +
                classNames['radio-gap']
              }
            >
              <input
                type="radio"
                className="custom-control-input"
                id="ManualImport"
                name="ManualImport"
                checked={true}
              />
              <label
                style={{
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                }}
                className="custom-control-label"
                htmlFor="ManualImport"
              >
                Manual Import
              </label>
            </div>
            {/* todo */}
            {/* <div
              className={
                'custom-control custom-radio align-self-center align-items-center pl-0 pr-3 ' +
                classNames['radio-gap']
              }
            >
              <input
                type="radio"
                className="custom-control-input"
                id="spotImport"
                name="spotImport"
                disabled
                checked={false}
              />
              <label
                style={{
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                }}
                className="custom-control-label"
                htmlFor="spotImport"
              >
              Spotlight Import
              </label>
            </div> */}
          </div>

          {/* Radio Buttons Ends Here */}
          <Import
            importSelectFile={importSelectFile}
            setImportSelectFile={setImportSelectFile}
            setImportimage={setImportimage}
            isLoadingImport={isLoadingImport}
            onImport={onImportTalent}
            downloadTemplate={downloadTemplate}
            isTalentSearch={true}
          />
        </Modal.Body>
      </Modal>

      <Modal
        className={'side-modal ' + classNames['shortlist-modal']}
        show={shortlistModalOpen}
        onHide={onShortlistModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        backdrop="static"
        enforceFocus={false}
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title> {'Longlist'} </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Shortlist
            selectedTalentData={selectedTalentData}
            onSubmitShortlist={onSubmitShortlist}
            currentTalentId={currentTalentId}
            isSubmitting={isSubmitting}
          />
        </Modal.Body>
      </Modal>

      {/* Update Tier */}
      <Modal
        className={'side-modal ' + classNames['update-filter-modal']}
        show={uploadModalOpen}
        onHide={onUpdateTierModalClose}
        dialogClassName="modal-dialog-centered"
        centered
        size="md"
        onKeyDown={focusWithInModal}
        id={'side-modal-focus'}
      >
        <Modal.Header closeButton>
          <Modal.Title> Update Tier </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <form onSubmit={onImportUpdateTier}>
            <Dropzone onDrop={importUpdateTierHandle} multiple={false}>
              {({getRootProps, getInputProps, isDragActive}) => (
                <div
                  className={"uploadFile " + classNames['dropfile-in-documents']}
                  {...getRootProps()}
                >
                  <input {...getInputProps()} />
                  <div
                    className="d-flex align-items-center docu-upload"
                    style={{marginLeft: '33%'}}
                  >
                    <div className="d-block">
                      <p
                        className={'mb-0 truncate ' + classNames['upload-text']}
                        style={{
                          textAlign: 'left',
                        }}
                      >
                        {isDragActive
                          ? 'Drop it Here!'
                          : importTierFile
                          ? importTierFile
                          : 'Drop your file or Upload'}
                      </p>

                      <span
                        className={
                          classNames['validation-format'] +
                          ' ' +
                          classNames['update_vali']
                        }
                      >
                        Supported file formats - EXCEL
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-primary upload-button" type="button">
                  <Image
                    src={UploadWhite}
                    className={"upload-white " + classNames['upload-icon']}
                  />
                  <Image
                    src={UploadUpdate}
                    className={"upload-icon " + classNames['upload-icon']}
                  />
                  </button>
                </div>
              )}
            </Dropzone>
            <div className="d-flex justify-content-between pt-20">
              <Button
                variant="secondary"
                className="side-custom-button"
                onClick={onDownloadUpdateTierTemplate}
              >
                Download Tier List
              </Button>
              <Button type="submit" variant="primary" className=" ml-2">
                {isLoadingImport ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TalentSearch;
