import {useState, useEffect} from 'react';
import TopNavBar from 'components/topNavBar';
import {Link} from 'react-router-dom';
import {Row, Col, Button, Image} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import {Popover, OverlayTrigger} from 'react-bootstrap';
import backSvg from 'images/back.svg';
import doubleBackSvg from 'images/back-double.svg';
import classNames from '../reports.module.css';
import RightAngle from 'components/angleRight';
import {useHistory, useParams} from 'react-router-dom';
import {createAndUpdateReport} from './createReport.api';
import NoData from 'components/NoData/NoData';
import {until, reorder} from 'helpers/helpers';
import {toastService} from 'erp-react-components';
import useCustomReportDataForEdit from '../custom/useCustomReportDataForEdit';
import useFilteredReportColumns from '../custom/useFilteredReportColumns';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import groupDots from 'images/Group 2090.svg';
import draggableSvgGreen from 'images/drag-dots-green.svg';
import groupDotsWhite from 'images/Side-images/Green/Dots-wh.svg';

const CreateReport = (props) => {
  const [defaultScreen, setDefaultScreen] = useState(null);
  const [selectedForAddition, setSelectedForAddition] = useState([]);
  const [addedRightCategoryList, setRightCategoryList] = useState([]);
  const [selectedForRemoval, setSelectedForRemoval] = useState([]);
  const [displayList, setDisplayList] = useState([]);
  const [customReportName, setCustomReportName] = useState('');
  const history = useHistory();
  const {id: customReportId} = useParams();
  // let {reportTypeList} = useReportTypeList();
  let {editCustomReportData} = useCustomReportDataForEdit({id: customReportId});
  let {filteredColumns, refreshFilteredReportColumns} =
    useFilteredReportColumns();
  const [reportTitleErr, setReportTitleErr] = useState('');

  const separator = '__SIDE_SEPERATOR__';

  const requiredColumns = [
    'First Name',
    'Last Name',
    'Job Title',
    'Email',
    'Account',
    'Lead Owner',
    'Region',
    'Name',
    'Owner',
    'Country',
    'Opportunity Name',
    'Opportunity Owner',
    'Account Name',
    'Line Of Business (LOB)',
    'Sub-LOB',
    'Stage',
    'Close Date',
    'Realization Date',
    'Factored Revenue (Pipeline)',
    'True Total Pipeline',
  ];
  const displaycolumnList = (
    (filteredColumns || {})?.['result']?.[0]?.['columns'] || []
  ).map((rep) => ({
    name: rep,
    isSelected: false,
    isRequired: requiredColumns.includes(rep) ? true : false,
  }));
  const filteredRequiredList = displaycolumnList.filter(
    (col) => col.isRequired === true,
  );

  useEffect(() => {
    if (customReportName) setReportTitleErr('');
  }, [customReportName]);

  useEffect(() => {
    const displaycolumnList = (
      (filteredColumns || {})?.['result']?.[0]?.['columns'] || []
    ).map((rep) => ({
      name: rep,
      isSelected: false,
      isRequired: requiredColumns.includes(rep) ? true : false,
    }));
    const filteredRequiredList = displaycolumnList.filter(
      (col) => col.isRequired === true,
    );
    setDisplayList(displaycolumnList);
    if (editCustomReportData) {
      const ReportData = (editCustomReportData || {})['result']?.[0] || {};
      setCustomReportName(ReportData.name || '');
      setRightCategoryList(
        (ReportData.columns || []).map((rep) => ({
          name: rep,
          isSelected: false,
          isRequired: requiredColumns.includes(rep) ? true : false,
        })),
      );
    } else {
      setRightCategoryList(filteredRequiredList);
      setSelectedForAddition(filteredRequiredList);
    }
  }, [editCustomReportData, filteredColumns]);
  function toggleSelectionFromToBeAdded(colName, idx) {
    if (selectedForAddition.find((c) => c.name === colName.name)) {
      setSelectedForAddition((selectedForAddition) => [
        ...selectedForAddition.filter(
          (selected) => selected.name !== colName.name,
        ),
      ]);
    }
    if (!selectedForAddition.find((c) => c.name === colName.name)) {
      setSelectedForAddition((selected) => [...selected, colName]);
    }
  }
  const toggleSelectionFromToBeRemoved = (colName) => {
    if (selectedForRemoval.find((c) => c === colName.name)) {
      setSelectedForRemoval((selectedForRemoval) => [
        ...selectedForRemoval.filter(
          (selected) => selected.name !== colName.name,
        ),
      ]);
    }
    if (!selectedForRemoval.find((c) => c.name === colName.name))
      setSelectedForRemoval((selected) => [...selected, colName]);
  };

  function reportTitleValidationErr(title, required = false) {
    if (!customReportName) {
      return 'Enter report title';
    } else if (
      customReportName &&
      !new RegExp(/^.{0,50}$/).test(customReportName)
    ) {
      return 'Title can have maximum 50 characters';
    } else {
      return '';
    }
  }

  const submitCustomReport = async () => {
    const data = {
      columns: addedRightCategoryList.map((item) => item.name),
      isCustom: true,
      name: customReportName,
    };

    let titleErr = reportTitleValidationErr(customReportName, true);
    if (titleErr) return setReportTitleErr(titleErr);
    else setReportTitleErr('');
    if (!addedRightCategoryList.length)
      return toastService.error({
        msg: 'please add atleast one column',
      });

    const [err, res] = await until(createAndUpdateReport(data, customReportId));
    if (err) return toastService.error({msg: err.message});
    setCustomReportName('');
    setDisplayList([]);
    setRightCategoryList([]);
    toastService.success({msg: res.message});
    history.replace(`/reports`);
  };
  const moveAllRightPopover = (
    <Popover
      className={classNames['move_all_popover']}
      id="popover-positioned-top"
      style={{zIndex: '20', border: 'none', borderRadius: '10px'}}
    >
      <Popover.Content>
        <p
          className="text-center"
          style={{marginBottom: 0, fontSize: '0.75rem'}}
        >
          Move all right
        </p>
      </Popover.Content>
    </Popover>
  );
  const moveAllLeftPopover = (
    <Popover
      className={classNames['move_all_popover']}
      id="popover-positioned-top"
      style={{zIndex: '20', border: 'none', borderRadius: '10px'}}
    >
      <Popover.Content>
        <p
          className="text-center"
          style={{marginBottom: 0, fontSize: '0.75rem'}}
        >
          Move all left
        </p>
      </Popover.Content>
    </Popover>
  );

  const moveSelectedLeftPopover = (
    <Popover
      className={classNames['move_all_popover']}
      id="popover-positioned-top"
      style={{zIndex: '20', border: 'none', borderRadius: '10px'}}
    >
      <Popover.Content>
        <p
          className="text-center"
          style={{marginBottom: 0, fontSize: '0.75rem'}}
        >
          Move selected left
        </p>
      </Popover.Content>
    </Popover>
  );

  const moveSelectedRightPopover = (
    <Popover
      className={classNames['move_all_popover']}
      id="popover-positioned-top"
      style={{zIndex: '20', border: 'none', borderRadius: '10px'}}
    >
      <Popover.Content>
        <p
          className="text-center"
          style={{marginBottom: 0, fontSize: '0.75rem'}}
        >
          Move selected right
        </p>
      </Popover.Content>
    </Popover>
  );
  function onDragEnd({source, draggableId, destination}) {
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return; // returned to same position

    if (
      source.droppableId === 'destinationBox' &&
      destination.droppableId === 'destinationBox'
    ) {
      //reordering in destination
      setRightCategoryList((addedCategoryData) => {
        return reorder(addedCategoryData, source.index, destination.index);
      });
    }
    if (
      source.droppableId.startsWith('source--') &&
      destination.droppableId === 'destinationBox'
    ) {
      //adding item
      const item = draggableId.split('source--')[1].split(separator)[1];

      setRightCategoryList((addedCategoryData) => {
        return reorder(
          [
            ...addedCategoryData,
            {name: item, isSelected: false, isRequired: false},
          ],
          addedCategoryData.length,
          destination.index,
        );
      });
    } else if (
      destination.droppableId.startsWith('source--') &&
      source.droppableId === 'destinationBox'
    ) {
      const item = draggableId.split('destination--')[1].split(separator)[1];
      setRightCategoryList((addedCategoryData) => {
        return addedCategoryData.filter((c) => c.name !== item);
      });
    }
  }

  return (
    <>
      <TopNavBar defaultScreen={defaultScreen}>
        <li>
          <Link to="/reports">{'Reports'}</Link>
        </li>
        <RightAngle />
        <li>
          <Link to="#">{'Create Report'}</Link>
        </li>
      </TopNavBar>
      <div className="side-container ">
        <Row className="m-0 ml-1 mr-1">
          <Col md="5" className="pl-0 pr-0">
            <Form.Group
              controlId="formPlaintextName"
              className="d-flex side-form-group"
            >
              <Form.Label className="mb-0 mr-3 align-self-center">
                Name*
              </Form.Label>

              <div
                className={
                  'position w-100 ' + classNames['create-report-width']
                }
              >
                <input
                  type="text"
                  name="createReport"
                  className="side-form-control"
                  autoComplete="off"
                  placeholder="Enter Report Title"
                  onChange={(e) => setCustomReportName(e.target.value)}
                  value={customReportName}
                />
                {reportTitleErr && (
                  <span
                    className="error position-absolute"
                    style={{
                      fontStyle: 'normal',
                      fontSize: '0.625rem',
                      color: '#ff3636',
                      marginTop: '1px',
                    }}
                  >
                    {reportTitleErr}
                  </span>
                )}
              </div>
            </Form.Group>
          </Col>
        </Row>
        <DragDropContext onDragEnd={onDragEnd}>
          <Row className="m-0 ml-1 mr-1">
            <Col md="5" lg="5" className="pl-0 pr-0">
              <div
                className={
                  'border py-3 px-3 reports-draggable ' +
                  classNames['edit-columns-box'] +
                  ' ' +
                  classNames['table-draggable']
                }
              >
                <Droppable droppableId={'source--' + 'report'}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="side-custom-scroll pr-2"
                      style={{
                        maxHeight: 'calc(50vh - 2rem)' /* py-3 = 1rem+1rem */,
                      }}
                    >
                      <div className="py-0">
                        {displayList.length > 0 ? (
                          <div className="w-full max-w-9xl mx-auto accordion_reports rounded-2xl">
                            {(displayList || []).map((col, indx) => {
                              const isSelected = selectedForAddition
                                .filter((c) => c.isRequired === false)
                                .find((item) => item.name === col.name);
                              const colAdded = (
                                addedRightCategoryList || []
                              ).find((c) => c.name === col.name);
                              return (
                                <Draggable
                                  index={indx}
                                  draggableId={
                                    'source--report' + separator + col.name
                                  }
                                  key={col.name}
                                >
                                  {(provided) => {
                                    return (
                                      <div
                                        onClick={() =>
                                          toggleSelectionFromToBeAdded(col)
                                        }
                                        title={
                                          isSelected
                                            ? 'Click to de-select'
                                            : 'Click to select'
                                        }
                                        key={col.name}
                                        id={'category.name'}
                                        className={
                                          'd-flex align-items-center toggle-list py-2 px-1 mb-1 ' +
                                          (isSelected && !colAdded
                                            ? 'activeSelector text-green '
                                            : '') +
                                          (colAdded || col.isRequired
                                            ? 'deactivated '
                                            : '')
                                        }
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        ref={provided.innerRef}
                                      >
                                        <img
                                          alt="Drag Handle Icon"
                                          src={
                                            isSelected && !colAdded
                                              ? draggableSvgGreen
                                              : groupDots
                                          }
                                          className={
                                            isSelected && !colAdded
                                              ? "draggableSvgGreen-black"
                                              : "groupDots-black"
                                          }
                                          style={{
                                            marginRight: '10px',
                                          }}
                                        />
                                          <img
                                          alt="Drag Handle Icon"
                                          src={
                                            isSelected && !colAdded
                                              ? draggableSvgGreen
                                              : groupDotsWhite
                                          }
                                          className={
                                            isSelected && !colAdded
                                              ? "draggableSvgGreen-white"
                                              : "groupDots-white"
                                          }
                                          style={{
                                            marginRight: '10px',
                                          }}
                                        />
                                        {col.name}{' '}
                                        {`${
                                          col.isRequired ? '( Required )' : ''
                                        }`}
                                      </div>
                                    );
                                  }}
                                </Draggable>
                              );
                            })}
                          </div>
                        ) : (
                          <NoData msg={'Select Report for categories'} />
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            </Col>

            <Col md="2" className="arrows-part pl-0 pr-0">
              <div className="d-flex flex-md-column align-items-center justify-content-center flex-grow-1 h-100">
                <OverlayTrigger
                  trigger="hover"
                  rootClose={true}
                  placement="top"
                  overlay={moveAllRightPopover}
                  className="position-relative"
                >
                  <button
                    className={'ml-2 mb-2 ' + classNames['icon-box']}
                    onClick={() => {
                      setSelectedForAddition(filteredRequiredList);
                      setRightCategoryList(displaycolumnList);
                    }}
                  >
                    <img
                      src={doubleBackSvg}
                      alt="click to add"
                      style={{width: '1.2rem', transform: 'rotateY(180deg)'}}
                    />
                  </button>
                </OverlayTrigger>
                <OverlayTrigger
                  trigger="hover"
                  rootClose={true}
                  placement="top"
                  overlay={moveSelectedRightPopover}
                  className="position-relative"
                >
                  <button
                    className={'ml-2 mb-2 ' + classNames['icon-box']}
                    disabled={
                      selectedForAddition.filter(
                        (col) => col.isRequired === false,
                      ).length === 0
                    }
                    onClick={() => {
                      setRightCategoryList((rightItem) => {
                        const List = [...rightItem, ...selectedForAddition];
                        return List.filter(
                          (v, i, a) =>
                            a.findIndex((v2) => v2.name === v.name) === i,
                        );
                      });
                    }}
                  >
                    <img
                      src={backSvg}
                      alt="click to add"
                      style={{width: '0.6rem'}}
                    />
                  </button>
                </OverlayTrigger>
                <OverlayTrigger
                  trigger="hover"
                  rootClose={true}
                  placement="top"
                  overlay={moveSelectedLeftPopover}
                  className="position-relative"
                >
                  <button
                    className={'ml-2 mb-2 ' + classNames['icon-box']}
                    onClick={() => {
                      setRightCategoryList((cat) => [
                        ...cat.filter(
                          (item) => !(selectedForRemoval || []).includes(item),
                        ),
                      ]);
                      setDisplayList((displayList) => [...displayList]);
                      setSelectedForRemoval(filteredRequiredList);
                    }}
                    disabled={
                      selectedForRemoval.filter(
                        (col) => col.isRequired === false,
                      ).length === 0
                    }
                  >
                    <img
                      src={backSvg}
                      alt="click to remove selected"
                      style={{transform: 'rotateY(180deg)', width: '0.6rem'}}
                    />
                  </button>
                </OverlayTrigger>
                <OverlayTrigger
                  trigger="hover"
                  rootClose={true}
                  placement="top"
                  overlay={moveAllLeftPopover}
                  className="position-relative"
                >
                  <button
                    className={'ml-2 mb-2 ' + classNames['icon-box']}
                    onClick={() => {
                      setRightCategoryList(filteredRequiredList);
                      setDisplayList(displaycolumnList);
                    }}
                  >
                    <img
                      src={doubleBackSvg}
                      alt="click to remove selected"
                      style={{width: '1.2rem'}}
                    />
                  </button>
                </OverlayTrigger>
              </div>
            </Col>

            <Col md="5" lg="5" className="pl-0 pr-0">
              <Droppable droppableId={'destinationBox'}>
                {(provided) => {
                  return (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={
                        'border py-3 px-3 reports-draggable ' +
                        classNames['edit-columns-box'] +
                        ' ' +
                        classNames['table-draggable']
                      }
                    >
                      {addedRightCategoryList.length > 0 ? (
                        <div
                          className="side-custom-scroll pr-2"
                          style={{
                            maxHeight:
                              'calc(50vh - 2rem)' /* py-3 = 1rem+1rem */,
                          }}
                        >
                          {(addedRightCategoryList || []).map((col, indx) => {
                            const isSelected = selectedForRemoval
                              .filter((c) => c.isRequired === false)
                              .find((cat) => cat.name === col.name);
                            return (
                              <Draggable
                                index={indx}
                                draggableId={
                                  'destination--report' + separator + col.name
                                }
                                key={col.name}
                              >
                                {(provided) => {
                                  return (
                                    <div
                                      className="block collapse_items"
                                      key={col.name}
                                    >
                                      <div
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        ref={provided.innerRef}
                                        onClick={() =>
                                          toggleSelectionFromToBeRemoved(col)
                                        }
                                        title={
                                          isSelected
                                            ? 'Click to de-select'
                                            : 'Click to select'
                                        }
                                        className={
                                          'd-flex align-items-center toggle-list py-2 px-1 mb-1 ' +
                                          (isSelected
                                            ? 'activeSelector text-green '
                                            : '') +
                                          (col.isRequired ? 'deactivated ' : '')
                                        }
                                      >
                                        <img
                                          alt="Drag Handle Icon"
                                          src={
                                            isSelected
                                              ? draggableSvgGreen
                                              : groupDots
                                          }
                                          className={isSelected
                                            ? "draggableSvgGreen-black"
                                            : "groupDots-black"
                                          }
                                          style={{
                                            marginRight: '10px',
                                          }}
                                        />
                                         <img
                                          alt="Drag Handle Icon"
                                          src={
                                            isSelected
                                              ? draggableSvgGreen
                                              : groupDotsWhite
                                          }
                                          className={isSelected
                                            ? "draggableSvgGreen-white"
                                            : "groupDots-white"
                                          }
                                          style={{
                                            marginRight: '10px',
                                          }}
                                        />
                                        {col.name}{' '}
                                        {` ${
                                          col.isRequired ? '( Required )' : ''
                                        }`}
                                      </div>
                                    </div>
                                  );
                                }}
                              </Draggable>
                            );
                          })}
                        </div>
                      ) : (
                        <NoData msg={'No Category Selected Yet'} />
                      )}
                    </div>
                  );
                }}
              </Droppable>
            </Col>
          </Row>
        </DragDropContext>

        <div className="text-right pt-30 mr-1">
          <Button
            className="btn bg-gray crm-button"
            disabled={!customReportName.trim()}
            onClick={() => submitCustomReport()}
          >
            {customReportId ? 'Update Report' : 'Create Report'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default CreateReport;
