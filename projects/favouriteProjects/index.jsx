import {useState, useContext, useEffect, useRef} from 'react';
import {Image, Row, Col} from 'react-bootstrap';
import classNames from '../projects.module.css';
import styles from './favouriteProjects.module.css';
import SearchWhite from 'images/Side-images/Green/Search-wh.svg';
import {Link} from 'react-router-dom';
import {until} from '../../helpers/helpers';
import {removeFavProject} from './favouriteProjects.api';
import {TableSearchInput, toastService} from 'erp-react-components';
import {AuthContext} from 'contexts/auth.context';
import CustomDropDown from 'components/customDropdown/customDropDown';
import vDots from 'images/Side-images/Green/vDots_black-vert.svg';
import vDotsgreen from 'images/Side-images/Green/vDots_gr-vert.svg';
import {throttle} from 'helpers/helpers';

const FavouriteProjects = ({
  favProjectList,
  reCallFavProjectList,
  filters,
  projectListSearch,
  favProjectSearch,
  setFavProjectSearch,
}) => {
  const {permissions} = useContext(AuthContext);
  const [projectList, setprojectList] = useState([]);
  const projectSearchRef = useRef();
  const [searchStrErr, setSearchStrErr] = useState('');

  useEffect(() => {
    setprojectList(favProjectList);
  }, [favProjectList]);

  const handleRemoveFavProject = (id) => {
    handleDelFavProject(id);
  };

  const handleDelFavProject = async (project_id) => {
    const [err, data] = await until(removeFavProject(project_id));
    if (err) {
      return console.error(err);
    }
    reCallFavProjectList(projectListSearch, filters, favProjectSearch);
    return toastService.success({msg: data.message});
  };

  // const handleProjectSearch = (e) => {
  //   let regx = /^[a-zA-Z0-9 ]*$/;
  //   if (!regx.test(e.target.value))
  //     return setSearchStrErr('Please enter valid project name');
  //   setSearchStrErr('');
  //   let searchVal = e.target.value;
  //   if (e.key === 'Enter' || !searchVal) {
  //     setFavProjectSearch(e.target.value);
  //   }
  // };

  const throttled = useRef(
    throttle(() => {
      document.body.click();
    }, 1000),
  );

  return (
    <>
      <div
        className={
          'd-flex justify-content-between align-items-center ' +
          styles['box-align']
        }
      >
        <p className={'mb-0 ' + classNames['main_header']}>
          Favourite Projects
        </p>
        <div className="d-flex">
          <div className="position-relative search-width Erp-search-input">
            <Image
              src={SearchWhite}
              className={
                'search-t-icon search-white-icon cursor-pointer ' +
                classNames['s-icon']
              }
              onClick={() => {
                setFavProjectSearch(projectSearchRef.current.value);
              }}
            />
            <TableSearchInput
              onSearch={setFavProjectSearch}
              onKeyPress={(event) => {
                if (
                  (event.charCode >= 65 && event.charCode <= 90) ||
                  (event.charCode > 96 && event.charCode < 123) ||
                  event.charCode === 32 ||
                  (event.charCode >= 45 && event.charCode <= 57)
                ) {
                  return true;
                } else {
                  event.preventDefault();
                  return false;
                }
              }}
            />
            {searchStrErr !== '' && (
              <span className="text-danger input-error-msg">
                {searchStrErr}
              </span>
            )}
          </div>
        </div>
      </div>
      <div
        className={
          'flex-grow-1 d-flex flex-column side-custom-scroll ' +
          styles['fav-box']
        }
      >
        <div
          className={'side-custom-scroll flex-grow-1 pr-1 fav-scroll '}
          onScroll={throttled.current}
          data-testid="data-section"
        >
          {projectList && projectList.length ? (
            <Row className="m-0">
              {(projectList || []).map((p) => {
                return (
                  <Col md="6" className="pl-0 pr-2 mb-2" key={p.id}>
                    <div
                      className={styles['fav-column-box']}
                      role={p?.projectId}
                    >
                      <div className={styles['fav-sepa']}>
                        <div
                          className={
                            'mb-3 d-flex justify-content-between align-items-center '
                          }
                        >
                          <Link
                            to={`/projects/projectDetails/${p.projectId}`}
                            className="truncate"
                          >
                            {p.project}
                          </Link>
                          {permissions['Projects']?.['Project Details']
                            ?.isEdit && (
                            <CustomDropDown
                              menuItems={[
                                {
                                  label: 'Remove from Fav',
                                  onclick: () => {
                                    handleRemoveFavProject(p.id);
                                  },
                                  show: true,
                                },
                              ]}
                              dropdownClassNames={styles['Favourite_dropdown']}
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

                      <p
                        className={
                          'mb-0 truncate w-100 pt-3 ' + styles['pro-character']
                        }
                      >
                        {p.client}
                      </p>
                    </div>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <Row style={{justifyContent: 'center'}}>
              <div className="No_data_avail">No Data Available</div>
            </Row>
          )}
        </div>
      </div>
    </>
  );
};

export default FavouriteProjects;
