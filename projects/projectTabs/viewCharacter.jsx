import {useState, useEffect} from 'react';
import {Button, Image} from 'react-bootstrap';
import classNames from './projectTabs.module.css';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import {ReactComponent as DownArrow} from '../../images/svg/down-arrow-lg.svg';
import {ReactComponent as UpArrow} from '../../images/Side-images/Uparrow-green.svg';
import Pencil from '../../images/pencil.svg';
import PencilWhite from 'images/Side-images/Green/pencil-wh.svg';
import Delete from '../../images/Side-images/delete.svg';
import DeleteWhite from 'images/Side-images/Green/delete-wh.svg';
import Pdf from '../../images/Side-images/pdf-upload.svg';
import {Loading} from 'components/LoadingComponents/loading';
import {downloadPdf} from 'apis/s3.api';
import {until, downloadFileFromData} from 'helpers/helpers';

const ViewCharacter = ({
  characterList,
  editCharacterList,
  deleteCharacterList,
  handleOpenShorList,
  fetchMoreRecords,
  loadingMore,
  nextUrl,
  permissions,
}) => {
  const handleEditCharacter = (id) => {
    editCharacterList(id);
  };
  const [activeAccordionItem, saveActiveAccordionItem] = useState('');

  const handleDeleteCharacter = (id) => {
    deleteCharacterList(id);
    saveActiveAccordionItem(null);
  };

  useEffect(() => {
    if (characterList && characterList.length) {
      saveActiveAccordionItem(characterList[0].id);
    }
  }, [characterList]);

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

  return (
    <>
      <div className="side-custom-scroll flex-grow-1 pr-1">
        <div className="">
          {characterList && characterList.length ? (
            <Accordion
              activeKey={activeAccordionItem}
              className={classNames['accordion-char']}
              onSelect={(k) => saveActiveAccordionItem(k)}
            >
              {(characterList || []).map((c, i) => {
                return (
                  <Card key={c.id}>
                    <Accordion.Toggle as={Card.Header} eventKey={c.id}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <div
                            className={
                              'pl-0 ' + classNames['char-border-right']
                            }
                          >
                            <p>
                              {c.name} ({c.uniqueId})
                            </p>
                          </div>
                          <div className={classNames['char-border-right']}>
                            <p>{c.gender}</p>
                          </div>
                          <div className={classNames['char-border-right']}>
                            <p>{c.age}</p>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className={classNames['milestone']}>
                            <p
                              style={{
                                fontWeight: '400',
                                marginRight: '1.25rem',
                              }}
                            >
                              {
                                (
                                  (c.milestones || [])[
                                    (c.milestones || []).length - 1
                                  ] || []
                                ).name
                              }
                            </p>
                          </div>
                          <div style={{cursor: 'pointer'}} className="session-arrows">
                            {activeAccordionItem === c.id ? (
                              <button className="btn btn-primary table_expand_ellpsis">
                                <UpArrow style={{width: '0.8rem'}} className="session-up-arrow" />
                              </button>
                            ) : (
                              <button className="btn btn-primary table_expand_ellpsis">
                                <DownArrow style={{width: '0.8rem'}} className="session-down-arrow" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={c.id}>
                      <Card.Body>
                        <div className={classNames['milestone-expand']}>
                          <div className="mb-3 d-flex justify-content-between align-items-center">
                            <div className="d-flex">
                              <div className={classNames['abt-char']}>
                                About Character
                              </div>
                            </div>
                            <div className="d-flex">
                              {permissions['Projects']?.['Character']
                                ?.isEdit && (
                                <button
                                  className="btn btn-primary table_expand_ellpsis edit-delete-icons mr-4"
                                  onClick={() => handleEditCharacter(c.id)}
                                >
                                   <Image className='delete-icon-white' src={PencilWhite}
                                    style={{ height: '18px', cursor: 'pointer' }} />
                                  <Image
                                    src={Pencil}
                                    className="delete-icon"
                                    style={{
                                      height: '18px',
                                      cursor: 'pointer',
                                    }}
                                  />
                                </button>
                              )}
                              {permissions['Projects']?.['Character']
                                ?.isEdit && (
                                <button
                                  className="btn btn-primary table_expand_ellpsis edit-delete-icons"
                                  onClick={() => handleDeleteCharacter(c.id)}
                                >
                                  <Image className='delete-icon-white' src={DeleteWhite}
                                    style={{ height: '18px', cursor: 'pointer' }} />
                                  <Image className={'delete-icon'} src={Delete}
                                    style={{ height: '18px', cursor: 'pointer' }} />

                                </button>
                              )}
                            </div>
                          </div>
                          <div
                            className={
                              classNames['abt-char'] +
                              ' ' +
                              classNames['desc-width']
                            }
                            style={{fontWeight: '400'}}
                          >
                            {c.aboutCharacter}
                          </div>
                        </div>
                        <hr className="my-3" />
                        <div className="d-flex">
                          <div
                            className={
                              'pl-0 ' +
                              classNames['milestone-expand-list-border']
                            }
                          >
                            <div
                              className={classNames['milestone-expand-list']}
                            >
                              <span className="left-part">Voice Types</span>
                              <p className="mb-0 right-part">
                                {Object.values(c.voiceTypes || {})
                                  .map((v) => {
                                    return v;
                                  })
                                  .join(', ')}
                              </p>
                            </div>
                            <div
                              className={classNames['milestone-expand-list']}
                            >
                              <span className="left-part">Accent Type</span>
                              <p className="mb-0 right-part">
                                {Object.values(c.accents || {})
                                  .map((v) => v)
                                  .join(', ')}
                              </p>
                            </div>
                            <div
                              className={classNames['milestone-expand-list']}
                            >
                              <span className="left-part">
                                Required For Audition
                              </span>
                              <p className="mb-0 right-part">{c.profiles}</p>
                            </div>
                            <div
                              className={classNames['milestone-expand-list']}
                            >
                              <span className="left-part">Milestones</span>
                              <p className="mb-0 right-part">
                                {' '}
                                {Object.values(c.milestones || {})
                                  .map((v) => v.name)
                                  .join(', ')}
                              </p>
                            </div>
                          </div>

                          <div
                            className={
                              classNames['milestone-expand-list-border']
                            }
                          >
                            <div
                              className={classNames['milestone-expand-list']}
                            >
                              <span className="left-part">Character Tier</span>
                              <p className="mb-0 right-part">{c.tier}</p>
                            </div>
                            <div
                              className={classNames['milestone-expand-list']}
                              style={{marginBottom: '1.125rem'}}
                            >
                              <span className="left-part">Shortlisted</span>
                              <p
                                className="mb-0 right-part"
                                style={{textDecoration: 'underline'}}
                              >
                                {c.shortlisted}
                                <Button
                                  className="ml-3 short_list my-1"
                                  variant="primary"
                                  onClick={() =>
                                    handleOpenShorList(c.id, 'Shortlist')
                                  }
                                >
                                  Shortlist
                                </Button>
                              </p>
                            </div>
                            <div
                              className={
                                classNames['milestone-expand-list'] +
                                ' ' +
                                classNames['attach-list']
                              }
                            >
                              <span
                                className={
                                  'left-part ' + classNames['attach-file']
                                }
                              >
                                Attachments
                              </span>
                              <p className="mb-0 right-part">
                                <div className="d-flex flex-wrap">
                                  {(c.characterDocs || []).map((file) => (
                                    <div
                                      className={classNames['docs_box']}
                                      key={file.id}
                                    >
                                      <div
                                        className="d-flex align-items-center"
                                        style={{cursor: 'pointer'}}
                                        onClick={() =>
                                          onDownload(
                                            file.filepath,
                                            file.filename,
                                          )
                                        }
                                      >
                                        <Image
                                          src={Pdf}
                                          className={classNames['pdf-file']}
                                        />
                                        <p
                                          className={
                                            'mb-0 ' + classNames['File_Name']
                                          }
                                        >
                                          {file.filename}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                );
              })}
            </Accordion>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div style={{textAlign: 'center'}}>
        {loadingMore ? (
          <Loading />
        ) : (
          nextUrl && (
            <button
              className={'btn btn-primary showMoreBtn mb-3 '}
              onClick={fetchMoreRecords}
            >
              {'Show More....'}
            </button>
          )
        )}
      </div>
    </>
  );
};

export default ViewCharacter;
