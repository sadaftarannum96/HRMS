import React from 'react';
import moment from 'moment';
import styles from './dashboard.module.css';
import classNames from '../Settings/masterBulletin/masterBulletin.module.css';
import ProfileS from '../images/svg/users-default.svg';
import {Image} from 'react-bootstrap';
import {Loading} from 'components/LoadingComponents/loading';
import {until} from '../helpers/helpers';
import {downloadPdf} from 'apis/s3.api';
import {downloadFileFromData} from '../helpers/helpers';
import Pdf from '../images/svg/layer1.svg';

const Bulletin = (props) => {
  const {loadingBulletin, bulletinList} = props;

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
      {!loadingBulletin ? (
        <div className={'side-custom-scroll ' + classNames['Bulletin_box']}>
          <div
            className="flex-grow-1 side-custom-scroll pr-2"
            data-testid="data-section"
          >
            {(bulletinList || []).map((d) => {
              const time = moment(d.publishTime, ['HH:mm']).format('h:mm A');
              const yesterdayDate = moment()
                .subtract(1, 'days')
                .format('YYYY-MM-DD');
              const currentDate = moment(new Date()).format('YYYY-MM-DD');
              const isInclude = (d.bulletinDocs || []).some(
                (d) =>
                  d?.filename?.split('.')[1] === 'png' ||
                  d?.filename?.split('.')[1] === 'jpeg' ||
                  d?.filename?.split('.')[1] === 'jpg',
              );
              return (
                <React.Fragment key={d.id}>
                  <div className={styles['inner_bulletin_box']} role={d.id}>
                    <div className="d-flex align-items-start justify-content-between">
                      <div className="d-flex mb-3">
                        <div
                          className={styles['User_Profile']}
                          data-testid={`userProfile-${d.id}`}
                        >
                          <Image
                            src={ProfileS}
                            className={styles['profile_icons']}
                          />
                        </div>
                        <div
                          className={'d-block ml-3 ' + classNames['notes_User']}
                        >
                          <p className={classNames['user-name']}>
                            {d?.createdByName}
                          </p>
                          <div className="d-flex align-items-start">
                            <p
                              className="mb-0 d-flex align-items-center"
                              style={{whiteSpace: 'nowrap'}}
                            >
                              {time && (
                                <span className={classNames['user-time']}>
                                  {time}
                                </span>
                              )}
                              {d.publishDate && (
                                <span
                                  className={'mr-3 ' + classNames['user-time']}
                                >
                                  ,{' '}
                                  {yesterdayDate === d.publishDate
                                    ? 'yesterday'
                                    : currentDate === d.publishDate
                                    ? 'today'
                                    : d.publishDate}
                                </span>
                              )}
                            </p>
                            <p className="mb-0">
                              {(d?.studios || []).map((s, ind) => {
                                return (
                                  <span
                                    key={s.id}
                                    className={classNames['user-time']}
                                  >
                                    {ind === 0 ? '' : ','} {s.name}
                                  </span>
                                );
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={
                        'col-md-11_35 pl-0 pr-0 ' + classNames['Pdf_upload_top']
                      }
                    >
                      <div className="d-flex row flex-nowrap m-0 ">
                        <div
                          className={
                            `row m-0 flex-wrap img_upload_space  ${
                              isInclude ? 'mr-4 ' : ' '
                            }` + styles['Master_bulletin_Settings']
                          }
                        >
                          {(d.bulletinDocs || []).map((doc) => {
                            return (
                              <React.Fragment key={doc.id}>
                                {doc?.filename?.split('.')[1] === 'png' ||
                                doc?.filename?.split('.')[1] === 'jpeg' ||
                                doc?.filename?.split('.')[1] === 'jpg' ? (
                                  <div
                                    className="Master_img_width bulletin_images"
                                    data-testid={`docImage-${doc.id}`}
                                  >
                                    <Image
                                      className={
                                        'Image_upload_bulletin cursor-pointer ' +
                                        styles['View_Bulletin_img']
                                      }
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '';
                                      }}
                                      src={
                                        `data:${
                                          doc?.filename?.split('.')[1]
                                        };base64,` + doc.image
                                      }
                                      onClick={() =>
                                        onDownload(doc.filepath, doc.filename)
                                      }
                                    />
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {(d.bulletinDocs || []).length > 0 ? (
                          <>
                            <p
                              className={
                                'mb-0 mr-2 pr-1 flex-grow-1 side-custom-scroll ' +
                                classNames['des-text']
                              }
                              style={{maxHeight: '5rem'}}
                            >
                              {d.notes}
                            </p>
                          </>
                        ) : (
                          <>
                            <p
                              className={
                                'mr-2 mb-0 pr-1 side-custom-scroll ' +
                                classNames['des-text']
                              }
                              style={{maxHeight: '5rem'}}
                            >
                              {d.notes}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="d-flex flex-wrap margin_top_align Bulletin_upload">
                      {(d.bulletinDocs || []).map((doc) => {
                        return (
                          <React.Fragment key={doc.id}>
                            {doc?.filename?.split('.')[1] === 'png' ||
                            doc?.filename?.split('.')[1] === 'jpeg' ||
                            doc?.filename?.split('.')[1] === 'jpg' ? (
                              <></>
                            ) : (
                              <div
                                key={d.id}
                                className="d-flex mt-3 margin_b_align"
                                data-testid={`pdfImage-${doc.id}`}
                              >
                                <div
                                  className={
                                    'text-left mt-0 mb-1 cursor-pointer ' +
                                    classNames['outer-box'] +
                                    ' ' +
                                    classNames['max_outer_width']
                                  }
                                  onClick={() =>
                                    onDownload(doc.filepath, doc.filename)
                                  }
                                >
                                  <div
                                    className={
                                      classNames['doc_box'] +
                                      ' ' +
                                      classNames['upload_file_width']
                                    }
                                  >
                                    <div className="d-flex align-items-center">
                                      <Image
                                        src={Pdf}
                                        className={
                                          'mr-3 ' + classNames['pdf-file']
                                        }
                                      />
                                      <div className={classNames['File_Name']}>
                                        {doc.filename}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default Bulletin;
