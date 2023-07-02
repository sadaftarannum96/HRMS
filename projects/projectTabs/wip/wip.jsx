import {useState, useEffect, useContext, useRef} from 'react';
import {Button} from 'react-bootstrap';
import classNames from '../financials.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {AuthContext} from 'contexts/auth.context';
import WipChart from './wipChart';
import {
  mapToLabelValue,
  until,
  cloneObject,
  downloadImageFromData,
  getUniqueNumber,
  blockInvalidChar,
  closeCalendarOnTab,
} from 'helpers/helpers';
import {fetchWIPData, updatehWIPData} from './wip.api';
import moment from 'moment';
import * as htmlToImage from 'html-to-image';
import {toastService, CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';

const Wip = ({projectDetails}) => {
  const screenShotRef = useRef(null);
  const authProvider = useContext(AuthContext);
  const profileDetails = authProvider.profileSettings;
  const [selectedMilestone, setSelectedMileStone] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment(new Date()).toDate());
  const [wipData, setWipData] = useState({});
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [isImageDownloading, setIsImageDownloading] = useState(false);
  const datePickerRef = useRef();

  const fetchWIP = async (milestoneId, WIPDate) => {
    if (!milestoneId || !WIPDate) return;
    const date = moment(WIPDate).format('YYYY-MM-DD');
    const [err, data] = await until(fetchWIPData(milestoneId, date));
    if (err) {
      return console.error(err);
    }
    const dataResult = data?.result?.[0] || {};
    if (Object.keys(dataResult).length > 0) {
      let list = [];
      for (const [key, value] of Object.entries(
        dataResult?.['talent hours'] || {},
      )) {
        const res = {
          id: getUniqueNumber(),
          lineItem: key,
          quoteBillablePerUnit: 0,
          quoteBillableUnits: 0,
          quoteCostPerUnit: 0,
          quoteTotalBillable: 0,
          quoteTotalCosts: 0,
          wipBillablePerUnit: value?.perUnit || 0,
          wipBillableUnits: value?.units || 0,
          wipCostPerUnit: null,
          wipTotalBillable: value?.totalBillable || 0,
          wipTotalCosts: null,
        };
        list.push(res);
      }
      const updatedData = {
        ...dataResult,
        ['Line Items']: [...dataResult['Line Items'], ...list],
      };
      setWipData(updatedData);
      setCurrencySymbol(data?.result?.[0]?.currency?.code || ''); //only for UI
    } else {
      setWipData({});
      setCurrencySymbol('');
    }
  };

  const updateWIP = async (data) => {
    const [err, res] = await until(updatehWIPData(data));
    if (err) {
      console.error(err);
      return toastService.error({msg: err.message});
    }
    fetchWIP(selectedMilestone, selectedDate);
    return toastService.success({msg: res.message});
  };

  useEffect(() => {
    if (projectDetails?.projectMilestones?.length) {
      setSelectedMileStone(projectDetails.projectMilestones[0]?.id);
    }
  }, []);

  useEffect(() => {
    fetchWIP(selectedMilestone, selectedDate);
  }, [selectedMilestone, selectedDate]);

  const changeWipData = (name, value, index) => {
    const updatedWipData = cloneObject(wipData);
    const wipBillableUnits = value ? Number(value) : 0;
    updatedWipData['Line Items'][index][name] = wipBillableUnits;
    //wipTotalBillable
    updatedWipData['Line Items'][index]['wipTotalBillable'] =
      wipBillableUnits *
      updatedWipData['Line Items'][index]['wipBillablePerUnit'];
    //wipTotalCosts
    updatedWipData['Line Items'][index]['wipTotalCosts'] =
      wipBillableUnits * updatedWipData['Line Items'][index]['wipCostPerUnit'];

    //Total
    //RunningTotal
    const runningTotal = (updatedWipData?.['Line Items'] || []).reduce(
      (pre, next) => {
        return pre + next?.wipTotalBillable;
      },
      0,
    );
    updatedWipData['Totals']['RunningTotal'] = runningTotal;

    //WIPCostsTotal
    const wipCostTotal = (updatedWipData?.['Line Items'] || []).reduce(
      (pre, next) => {
        return pre + next?.wipTotalCosts;
      },
      0,
    );
    updatedWipData['Totals']['WIPCostsTotal'] = wipCostTotal;

    setWipData(updatedWipData);
  };

  const onUpdateWIPData = () => {
    const data = (wipData?.['Line Items'] || []).map((w) => ({
      wipId: w.id,
      wipBillableUnits: w.wipBillableUnits
        ? Number(w.wipBillableUnits.toFixed(2))
        : w.wipBillableUnits,
      wipTotalBillable: w.wipTotalBillable
        ? Number(w.wipTotalBillable.toFixed(2))
        : w.wipTotalBillable,
      wipTotalCosts: w.wipTotalCosts
        ? Number(w.wipTotalCosts.toFixed(2))
        : w.wipTotalCosts,
    }));
    updateWIP({wipData: data});
  };

  const takeScreenShot = async (node) => {
    const dataURI = await htmlToImage.toJpeg(node);
    return dataURI;
  };

  const downloadScreenshot = async () => {
    setIsImageDownloading(true);
    const imageData = await takeScreenShot(screenShotRef.current);
    setIsImageDownloading(false);
    const date = moment(selectedDate).format('DD-MM-YYYY');
    const milestoneName = (
      (projectDetails || {})?.projectMilestones || []
    ).find((m) => m?.id === selectedMilestone)?.name;
    downloadImageFromData(imageData, `WIP_${milestoneName}_${date}`, 'jpeg');
  };

  const getProfitAndMargin = (isProfit = false, total) => {
    const quoteTotal = wipData?.['Totals']?.QuoteTotal || 0;
    const profit = Number((quoteTotal - total)?.toFixed(2));
    const margin =
      total !== 0 ? Number(((profit / total) * 100)?.toFixed(2)) : 0;
    return `${currencySymbol} ${isProfit ? profit || 0 : margin || 0}`;
  };

  const getWipChartTotal = (isTotalBillable) => {
    const total =
      (wipData?.['Totals']?.TotalBillable || 0) +
      (wipData?.['Totals']?.QuoteTotal || 0);
    return total
      ? Number(
          (
            ((wipData?.['Totals']?.[
              isTotalBillable ? 'TotalBillable' : 'QuoteTotal'
            ] || 0) /
              (total || 0)) *
            100
          ).toFixed(2),
        )
      : 0;
  };

  return (
    <>
      <div className="side-form-group mb-0">
        <div className={'margin-btm-space ' + classNames['mile_select']}>
          <CustomSelect
            name="Milestone"
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
      <div className="d-flex flex-column flex-grow-1 side-custom-scroll pr-1">
        <div ref={screenShotRef}>
          <div className={classNames['main_header']}>Project Analytics</div>
          <div className="d-flex flex-column flex-grow-1 side-custom-scroll mt-3">
            <div className="side-custom-scroll flex-grow-1 pr-1">
              <div className="row m-0 mb-4 ">
                <div className="col-xs-7 col-md-8 col-xl-9 pl-0 pr-3">
                  <div className={'h-100 ' + classNames['wip_box']}>
                    <div className="po project_details_list mb-4">
                      <div className={classNames['po_list']}>
                        <p>Project</p>
                        <span>{projectDetails?.name || ''}</span>
                      </div>
                      <div className={classNames['po_list']}>
                        <p>Project Started On</p>
                        <span>
                          {wipData?.projectStartDate ||
                            projectDetails?.dateStarted}
                        </span>
                      </div>
                      <div className={classNames['po_list']}>
                        <p>Project Completed On</p>
                        <span>{projectDetails?.dateCompleted}</span>
                      </div>
                      <div className={classNames['po_list']}>
                        <p>Total Costs</p>
                        <span>
                          {' '}
                          {`${currencySymbol} ${
                            wipData?.Totals?.TotalBillable || 0
                          }`}
                        </span>
                      </div>
                      <div className={classNames['po_list']}>
                        <p>Running Totals</p>
                        <span>{`${currencySymbol} ${
                          wipData?.Totals?.RunningTotal || 0
                        }`}</span>
                      </div>
                    </div>

                    <div className="po project_details_list-bottom mb-2">
                      <div
                        className={classNames['po_list']}
                        style={{paddingLeft: '0rem'}}
                      >
                        <p>Profit</p>
                        <span>
                          {getProfitAndMargin(
                            true,
                            wipData?.['Totals']?.TotalBillable || 0,
                          )}
                        </span>
                      </div>
                      <div
                        className={classNames['po_list']}
                        style={{borderRight: 'unset'}}
                      >
                        <p>Margin</p>
                        <span>
                          {getProfitAndMargin(
                            false,
                            wipData?.['Totals']?.TotalBillable || 0,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-xs-5 col-xl-3  pl-0 pr-0">
                  <div className={'h-100 ' + classNames['wip_box']}>
                    <WipChart
                      chartData={[
                        {
                          title: 'Total Billable (Running)',
                          value: getWipChartTotal(true),
                          color: '#91CF00',
                        },
                        {
                          title: 'Total Billable (Quote)',
                          value: getWipChartTotal(false),
                          color: '#3D3D3D',
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
              <div className="row m-0 ">
                <div className="col-md-12 pl-0 pr-0">
                  <div className={classNames['wip_box']}>
                    <div className={classNames['quote_fig_box']}>
                      <div className="d-flex justify-content-end">
                        <div className="mt-1 side-datepicker position-relative  Wip_Datepicker_date">
                          <DatePicker
                            ref={datePickerRef}
                            name="publishDate"
                            placeholderText="Select Date"
                            autoComplete="off"
                            calendarIcon
                            popperPlacement="bottom"
                            popperModifiers={{
                              flip: {
                                behavior: ['bottom'],
                              },
                              preventOverflow: {
                                enabled: false,
                              },
                              hide: {
                                enabled: false,
                              },
                            }}
                            dateFormat={
                              (profileDetails.dateFormat || '')
                                .replace(/DD/, 'dd')
                                .replace(/YYYY/, 'yyyy') || 'yyyy-MM-dd'
                            }
                            className="side_date "
                            onChange={(date) => {
                              setSelectedDate(date);
                            }}
                            minDate={
                              new Date(
                                wipData?.projectStartDate ||
                                  projectDetails?.dateStarted,
                              )
                            }
                            selected={selectedDate}
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
                          {!selectedDate && (
                            <span className="text-danger pl-1 mb-2_5 Vali_err input-error-msg">
                              Please select date
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="row m-0">
                        <div className="col-md-7 pl-0 pr-3">
                          <div className={'mt-3 ' + classNames['main_header']}>
                            Quote Figures
                          </div>
                          <hr className="mt-3 mb-3" />
                          <div className="d-flex row m-0 brder_bottom_wip">
                            <div className="col-md-2_5 px-0"></div>
                            <div
                              className={
                                'col-md-6 px-0 ' + classNames['brder_right_wip']
                              }
                            >
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0">Billable</p>
                              </div>
                            </div>
                            <div
                              className={
                                'col-md-1_30  px-0 ' +
                                classNames['only-cost-resolution']
                              }
                            >
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0">Costs</p>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex row m-0">
                            <div className="col-md-3 px-0">
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0 truncate">Line Item</p>
                              </div>
                            </div>
                            <div className="col-md-1_50 px-0">
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0 truncate">Units</p>
                              </div>
                            </div>
                            <div className="col-md-1_50 px-0">
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0 truncate">Per Unit</p>
                              </div>
                            </div>
                            <div className="col-md-1_50 px-0">
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0 truncate">Total Billable</p>
                              </div>
                            </div>
                            <div className="col-md-1_50 px-0">
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0 truncate">Per Unit</p>
                              </div>
                            </div>
                            <div className="col-md-1_50 px-0">
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0 truncate">Total Costs</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-5 pl-0 pr-0">
                          <div className={'mt-3 ' + classNames['main_header']}>
                            WIP
                          </div>
                          <hr className="mt-3 mb-3" />
                          <div className="d-flex row m-0 brder_bottom_wip">
                            <div
                              className={
                                'col-md-7_8 px-0 ' +
                                classNames['brder_right_wip']
                              }
                            >
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0 truncate">Billable</p>
                              </div>
                            </div>
                            <div className="col-md-5_1 px-0">
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0 truncate">Costs</p>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex row m-0">
                            <div className="col-md-2_5 px-0">
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0 truncate">Units</p>
                              </div>
                            </div>
                            <div className="col-md-2_5 px-0">
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0 truncate">Per Unit</p>
                              </div>
                            </div>
                            <div className="col-md-2_5 px-0">
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0 truncate"> Total Billable</p>
                              </div>
                            </div>
                            <div className="col-md-2_5 px-0">
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0 truncate">Per Unit</p>
                              </div>
                            </div>
                            <div className="col-md-2_5 px-0">
                              <div className={classNames['quotes-box-green']}>
                                <p className="mb-0 truncate">Total Costs</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {(wipData?.['Line Items'] || []).map((item, index) => {
                        return (
                          <div
                            className={'row m-0 ' + classNames['wip_list']}
                            key={item?.id}
                          >
                            <div className={'col-md-7 pl-0 pr-3 left_padding '}>
                              <div className="row m-0 h-100 border_dark_bottom">
                                <div className="col-md-3  px-0 border_dark_right">
                                  <div
                                    className={
                                      'justify-content-start ' +
                                      classNames['wip_light_box']
                                    }
                                  >
                                    <p className="mb-0 truncate">
                                      {item?.lineItem}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-md-1_50 px-0 border_dark_right">
                                  <div className={classNames['wip_light_box']}>
                                    <p className="mb-0 truncate">
                                      {item?.quoteBillableUnits}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-md-1_50 px-0 border_dark_right">
                                  <div className={classNames['wip_light_box']}>
                                    <p className="mb-0 truncate">
                                      {`${currencySymbol} ${
                                        item?.quoteBillablePerUnit || 0
                                      }`}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-md-1_50 px-0 border_dark_right">
                                  <div className={classNames['wip_light_box']}>
                                    <p className="mb-0 truncate">
                                      {`${currencySymbol} ${
                                        item?.quoteTotalBillable || 0
                                      }`}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-md-1_50 px-0 border_dark_right">
                                  <div className={classNames['wip_light_box']}>
                                    <p className="mb-0 truncate">
                                      {`${currencySymbol} ${
                                        item?.quoteCostPerUnit || 0
                                      }`}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-md-1_50 px-0 border_dark_right">
                                  <div className={classNames['wip_light_box']}>
                                    <p className="mb-0 truncate">
                                      {item?.quoteTotalCosts ||
                                      item?.quoteTotalCosts === 0
                                        ? `${currencySymbol} ${item?.quoteTotalCosts}`
                                        : ''}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div
                              className={'col-md-5 pl-0 pr-0 right__padding '}
                            >
                              <div className="row m-0 h-100 border_dark_bottom">
                                <div className="col-md-2_5 px-0 border_dark_right">
                                  <div className={classNames['wip_light_box']}>
                                    <input
                                      id={item?.id}
                                      type="number"
                                      autoComplete="off"
                                      className="side-form-control"
                                      name="wipBillableUnits"
                                      value={item?.wipBillableUnits}
                                      onChange={(e) => {
                                        const {name, value} = e.target;
                                        changeWipData(name, value, index);
                                      }}
                                      placeholder="0"
                                      onKeyDown={blockInvalidChar}
                                      onWheel={(e) => e.target.blur()}
                                    />
                                  </div>
                                </div>
                                <div className="col-md-2_5 px-0 border_dark_right">
                                  <div className={classNames['wip_light_box']}>
                                    <p className="mb-0 truncate">
                                      {`${currencySymbol} ${
                                        item?.wipBillablePerUnit || 0
                                      }`}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-md-2_5 px-0 border_dark_right">
                                  <div className={classNames['wip_light_box']}>
                                    <p className="mb-0 truncate">
                                      {`${currencySymbol} ${
                                        item?.wipTotalBillable || 0
                                      }`}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-md-2_5 px-0 border_dark_right">
                                  <div className={classNames['wip_light_box']}>
                                    <p className="mb-0 truncate">
                                      {`${currencySymbol} ${
                                        item?.wipCostPerUnit || 0
                                      }`}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-md-2_5 px-0 border_dark_right">
                                  <div className={classNames['wip_light_box']}>
                                    <p className="mb-0 truncate">
                                      {`${currencySymbol} ${
                                        item?.wipTotalCosts || 0
                                      }`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className={'row m-0 ' + classNames['wip_list']}>
                        <div className={'col-md-7 pl-0 pr-3 left_padding '}>
                          <div
                            className={
                              'row m-0  h-100 border_dark_bottom ' +
                              classNames['last_one_empty']
                            }
                          >
                            <div
                              className={
                                'col-md-3 px-0 border_dark_right ' +
                                classNames['empty_boxes']
                              }
                            >
                              <div
                                className={
                                  'First_child empty_one ' +
                                  classNames['wip_light_box']
                                }
                              ></div>
                            </div>
                            <div className="col-md-1_50 px-0 border_dark_right">
                              <div
                                className={
                                  'empty_one ' + classNames['wip_light_box']
                                }
                              >
                                <p className="mb-0"></p>
                              </div>
                            </div>
                            <div className="col-md-1_50 px-0 border_dark_right">
                              <div className={classNames['wip_light_box']}>
                                <p className="mb-0">Total</p>
                              </div>
                            </div>
                            <div className="col-md-1_50 px-0 border_dark_right">
                              <div
                                className={
                                  classNames['wip_light_box'] +
                                  ' ' +
                                  classNames['total_box']
                                }
                              >
                                <p className="mb-0 truncate">
                                  {`${currencySymbol} ${
                                    wipData?.Totals?.TotalBillable || 0
                                  }`}
                                </p>
                              </div>
                            </div>
                            <div className="col-md-1_50 px-0 border_dark_right">
                              <div className={classNames['wip_light_box']}>
                                <p className="mb-0">Total</p>
                              </div>
                            </div>
                            <div className="col-md-1_50 px-0 border_dark_right">
                              <div
                                className={
                                  classNames['wip_light_box'] +
                                  ' ' +
                                  classNames['total_box']
                                }
                              >
                                <p className="mb-0 truncate">
                                  {`${currencySymbol} ${
                                    wipData?.Totals?.QuoteCostsTotal || 0
                                  }`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={'col-md-5 pl-0 pr-0 right__padding '}>
                          <div className="row m-0 h-100 border_dark_bottom">
                            <div
                              className={
                                'col-md-2_5 px-0 border_dark_right ' +
                                classNames['empty_boxes']
                              }
                            >
                              <div
                                className={
                                  'empty_one ' + classNames['wip_light_box']
                                }
                              >
                                <p className="mb-0"></p>
                              </div>
                            </div>
                            <div className="col-md-2_5 px-0 border_dark_right">
                              <div className={classNames['wip_light_box']}>
                                <p className="mb-0">Running Totals</p>
                              </div>
                            </div>
                            <div className="col-md-2_5 px-0 border_dark_right">
                              <div
                                className={
                                  classNames['wip_light_box'] +
                                  ' ' +
                                  classNames['total_box']
                                }
                              >
                                <p className="mb-0 truncate">
                                  {`${currencySymbol} ${
                                    wipData?.Totals?.RunningTotal || 0
                                  }`}
                                </p>
                              </div>
                            </div>
                            <div className="col-md-2_5 px-0 border_dark_right">
                              <div className={classNames['wip_light_box']}>
                                <p className="mb-0">Total</p>
                              </div>
                            </div>
                            <div className="col-md-2_5 px-0 border_dark_right">
                              <div
                                className={
                                  classNames['wip_light_box'] +
                                  ' ' +
                                  classNames['total_box']
                                }
                              >
                                <p className="mb-0 truncate">
                                  {`${currencySymbol} ${
                                    wipData?.Totals?.WIPCostsTotal || 0
                                  }`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row m-0 mt-4">
                        <div className={'col-md-7 pl-0 pr-3 '}>
                          <div className={classNames['border_right']}>
                            <div className="d-block">
                              <div className="d-flex mt-1 justify-content-end align-items-center">
                                <div
                                  className={
                                    'mr-5 ' + classNames['wip_inner_box']
                                  }
                                >
                                  <p className="left-part">Total Billable</p>
                                  <p className="right-part d-block truncate">
                                    {`${currencySymbol} ${
                                      wipData?.Totals?.TotalBillable || 0
                                    }`}
                                  </p>
                                </div>
                                <div
                                  className={
                                    'mr-5 ' + classNames['wip_inner_box']
                                  }
                                >
                                  <p className="left-part">Total Costs</p>
                                  <p className="right-part d-block truncate">{`${currencySymbol} ${
                                    wipData?.Totals?.QuoteTotal || 0
                                  }`}</p>
                                </div>
                              </div>
                              <div className="d-flex  mt-1 align-items-center justify-content-end">
                                <div
                                  className={
                                    'mr-5 ' + classNames['wip_inner_box']
                                  }
                                >
                                  <p className="left-part">Profit</p>
                                  <p className="right-part d-block truncate">
                                    {getProfitAndMargin(
                                      true,
                                      wipData?.['Totals']?.TotalBillable || 0,
                                    )}
                                  </p>
                                </div>
                                <div
                                  className={
                                    'mr-5 ' + classNames['wip_inner_box']
                                  }
                                >
                                  <p className="left-part">Margin</p>
                                  <p className="right-part d-block truncate">
                                    {getProfitAndMargin(
                                      false,
                                      wipData?.['Totals']?.TotalBillable || 0,
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-5 pl-3 pr-0 ">
                          <div className="d-block">
                            <div className="d-flex align-items-center justify-content-end mt-1">
                              <div
                                className={
                                  'mr-5 ' + classNames['wip_inner_box']
                                }
                              >
                                <p className="left-part">Running Totals</p>
                                <p className="right-part d-block truncate">{`${currencySymbol} ${
                                  wipData?.Totals?.RunningTotal || 0
                                }`}</p>
                              </div>
                              <div
                                className={
                                  'mr-5 ' + classNames['wip_inner_box']
                                }
                              >
                                <p className="left-part">Total Costs</p>
                                <p className="right-part d-block truncate">{`${currencySymbol} ${
                                  wipData?.Totals?.WIPCostsTotal || 0
                                }`}</p>
                              </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-end mt-1">
                              <div
                                className={
                                  'mr-5 ' + classNames['wip_inner_box']
                                }
                              >
                                <p className="left-part">Profit</p>
                                <p className="right-part d-block truncate">
                                  {getProfitAndMargin(
                                    true,
                                    wipData?.['Totals']?.RunningTotal || 0,
                                  )}
                                </p>
                              </div>
                              <div
                                className={
                                  'mr-5 ' + classNames['wip_inner_box']
                                }
                              >
                                <p className="left-part">Margin</p>
                                <p className="right-part d-block truncate">
                                  {getProfitAndMargin(
                                    false,
                                    wipData?.['Totals']?.RunningTotal || 0,
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-end pt-20 pr-1">
        <Button
          variant="primary"
          className="mr-2"
          onClick={downloadScreenshot}
          disabled={isImageDownloading}
        >
          Snapshot
        </Button>
        <Button
          variant="primary"
          onClick={onUpdateWIPData}
          disabled={!Object.keys(wipData).length}
        >
          Save
        </Button>
      </div>
    </>
  );
};

export default Wip;
