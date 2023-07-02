import {useContext, useRef} from 'react';
import {
  hasOnlySpecialCharacters,
  blockInvalidChar,
  closeCalendarOnTab,
} from 'helpers/helpers';
import classNames from '../financials.module.css';
import {Button} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as yup from 'yup';
import moment from 'moment';
import {Formik} from 'formik';
import {AuthContext} from 'contexts/auth.context';
import {CustomSelect} from 'erp-react-components';

const AddInvoicePo = (props) => {
  const authProvider = useContext(AuthContext);
  const profileDetails = authProvider.profileSettings;

  const invoiceDatePickerRef = useRef();
  const d365DatePickerRef = useRef();

  const defaultValues = {
    invoiceNumber: '',
    currencyId: props?.poCurrencyId || null,
    net: '',
    invoiceDate: '',
    d365: '',
    description: '',
  };

  const schema = yup.object({
    invoiceNumber: yup
      .string()
      .required('Please enter invoice number')
      .max(20, 'Maximum of 20 characters')
      .matches(
        /^[A-Za-z0-9 _/-]*[A-Za-z0-9 _]*$/,
        'Please enter valid invoice number',
      )
      .test(
        'invoiceNumber',
        'Only special characters are not allowed',
        (value) => !hasOnlySpecialCharacters(value),
      )
      .nullable(),
    currencyId: yup.string().required('Please select currency').nullable(),
    net: yup
      .string()
      .required('Please enter net amount')
      .max(8, 'Maximum of 8 digits')
      .test('maxDigitsAfterDecimal', 'Enter valid decimal', (number) =>
        /^-?[0-9]\d*(\.\d{1,2})?$/.test(number),
      )
      .nullable(),
    invoiceDate: yup.string().required('Please select invoice date').nullable(),
    // d365: yup
    //   .string()
    //   .required('Please enter D365')
    //   .max(20, 'Maximum of 20 characters')
    //   .matches(
    //     /^[A-Za-z0-9 ]*[A-Za-z][A-Za-z0-9 ]*$/,
    //     'Please enter valid D365',
    //   )
    //   .nullable(),
    description: yup.string().max(100, 'Maximum of 100 characters').nullable(),
  });

  return (
    <>
      <Formik
        initialValues={defaultValues}
        enableReinitialize={true}
        onSubmit={async (data) => {
          const newData = {
            ...data,
            invoiceDate: data.invoiceDate
              ? moment(data.invoiceDate).format('YYYY-MM-DD')
              : null,
            d365: data.d365 ? moment(data.d365).format('YYYY-MM-DD') : null,
          };
          props.onCreatePoInvoice(newData);
        }}
        validationSchema={schema}
      >
        {({
          values,
          handleSubmit,
          handleChange,
          errors,
          status,
          touches,
          setFieldValue,
          touched,
        }) => {
          status = status || {};
          const formErrors = {};
          for (let f in values) {
            if (touched[f]) {
              formErrors[f] = errors[f] || status[f];
            }
          }
          return (
            <form
              className="d-flex flex-column flex-grow-1"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <div className="row m-0 ml-1">
                <div className="col-md-4 pl-0 pr-4">
                  <div className="side-form-group">
                    <label>Invoice Number*</label>
                    <div className={'mt-1 ' + classNames['mode-select']}>
                      <input
                        type="text"
                        name="invoiceNumber"
                        autoComplete="off"
                        className={'mt-1 side-form-control '}
                        onChange={handleChange}
                        value={values.invoiceNumber}
                        placeholder="Enter Invoice No"
                      />
                      {formErrors.invoiceNumber && (
                        <span className="text-danger input-error-msg">
                          {formErrors.invoiceNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-4 pl-0 pr-4">
                  <div className="side-form-group">
                    <label>Currency*</label>
                    <div className={'mt-1 ' + classNames['mode-select']}>
                      <CustomSelect
                        name="currencyId"
                        options={props.currencyList}
                        placeholder={'Select'}
                        menuPosition="bottom"
                        searchable={false}
                        checkbox={true}
                        searchOptions={true}
                        onChange={(value) => {
                          setFieldValue('currencyId', value);
                        }}
                        value={values.currencyId}
                        unselect={false}
                        disabled
                      />
                      {formErrors.currencyId && (
                        <span className="text-danger input-error-msg">
                          {formErrors.currencyId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-4 pl-0 pr-0">
                  <div className="side-form-group">
                    <label>Net*</label>
                    <div className={'mt-1 ' + classNames['mode-select']}>
                      <input
                        type="number"
                        name="net"
                        autoComplete="off"
                        className={'mt-1 side-form-control mr-2 '}
                        onChange={(v) => {
                          // handleChange(v);
                          {v.target.value.length < 22 && handleChange(v)}
                        }}
                        value={values.net}
                        placeholder="Enter Net"
                        onKeyDown={blockInvalidChar}
                      />
                      {formErrors.net && (
                        <span className="text-danger input-error-msg">
                          {formErrors.net}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-4 pl-0 pr-4">
                  <div
                    className={
                      'side-form-group ' + classNames['invoice_date_picker']
                    }
                  >
                    <label>Invoice Date*</label>
                    <div className="mt-1 side-datepicker">
                      <DatePicker
                        ref={invoiceDatePickerRef}
                        name="invoiceDate"
                        placeholderText="Select Invoice Date"
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
                        onBlur={() => {}}
                        onChange={(dateObj) => {
                          setFieldValue('invoiceDate', dateObj);
                        }}
                        selected={
                          values.invoiceDate
                            ? moment(values.invoiceDate).toDate()
                            : null
                        }
                        peekNextMonth
                        showMonthDropdown
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={50}
                        onKeyDown={(e) =>
                          closeCalendarOnTab(e, invoiceDatePickerRef)
                        }
                        preventOpenOnFocus={true}
                        onFocus={e => e.target.blur()}
                      />
                      {formErrors.invoiceDate && (
                        <span className="text-danger input-error-msg">
                          {formErrors.invoiceDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-4 pl-0 pr-0">
                  <div
                    className={
                      'side-form-group ' + classNames['invoice_date_picker']
                    }
                  >
                    <label>D365</label>
                    <div className="mt-1 side-datepicker">
                      <DatePicker
                        ref={d365DatePickerRef}
                        name="d365"
                        placeholderText="Select D365 Date"
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
                        onBlur={() => {}}
                        onChange={(dateObj) => {
                          setFieldValue('d365', dateObj);
                        }}
                        selected={
                          values.d365 ? moment(values.d365).toDate() : null
                        }
                        minDate={new Date('1970-01-01')}
                        peekNextMonth
                        showMonthDropdown
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={50}
                        onKeyDown={(e) =>
                          closeCalendarOnTab(e, d365DatePickerRef)
                        }
                        preventOpenOnFocus={true}
                        onFocus={e => e.target.blur()}
                      />
                      {/* {formErrors.invoiceDate && (
                        <span className="text-danger input-error-msg">
                          {formErrors.invoiceDate}
                        </span>
                      )} */}
                    </div>
                  </div>
                </div>
                <div className="col-md-12 pl-0 pr-0">
                  <div className="mb-1 side-form-group">
                    <label>Description</label>
                    <textarea
                      style={{resize: 'none'}}
                      rows="4"
                      cols="50"
                      className="mt-1 side-form-control side-custom-scroll pr-1 flex-grow-1 textarea-resize-off description-area "
                      name="description"
                      placeholder="Enter Description"
                      onChange={handleChange}
                      value={values.description}
                    ></textarea>
                    {formErrors.description && (
                      <span className="text-danger input-error-msg">
                        {formErrors.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end pt-20 pr-1 pb-1">
                <Button
                  type="submit"
                  className="add_button_invoice"
                  variant="primary"
                  disabled={props.isSubmitting}
                >
                  Add
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
export default AddInvoicePo;
