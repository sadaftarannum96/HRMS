import {useState, useContext, useEffect} from 'react';
import classNames from '../financials.module.css';
import {Button} from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import {
  until,
  mapToLabelValue,
  cloneObject,
  blockInvalidChar,
} from 'helpers/helpers';
import * as yup from 'yup';
import {Formik} from 'formik';
import {getFinancialCostType, getFinancialCostData} from './financials.api';
import {DataContext} from 'contexts/data.context';
import {CustomSelect} from 'erp-react-components';
import SelectDropdownArrows from 'components/selectDropdownArrows';

const AddCost = (props) => {
  const dataProvider = useContext(DataContext);
  const [costTypeList, setCostTypeList] = useState([]);

  useEffect(() => {
    fetchCostTyleList();
    dataProvider.fetchStudios();
  }, []);

  const [defaultValues, setDefaultValues] = useState({
    type: null,
    studioId: null,
    currencyId: null,
    amount: '',
    other: '',
    description: '',
    milestoneId:  props?.selectedMilestone?.[0] || null,
  });

  useEffect(() => {
    if (!props.selectedCostId) return;
    onEditCost(props.selectedCostId);
  }, [props.selectedCostId]);

  const onEditCost = async (id) => {
    const [err, res] = await until(getFinancialCostData(id));
    if (err) {
      return console.error(err);
    }
    if ((res.result || []).length > 0) {
      const data = res.result[0];
      setDefaultValues({
        ...defaultValues,
        type: data.type,
        studioId: data.studio?.id,
        currencyId: data.currency?.id,
        amount: data.amount,
        other: data.other,
        description: data.description,
        milestoneId: data.milestone?.id,
      });
    }
  };

  const schema = yup.object({
    type: yup.string().required('Please select type').nullable(),
    studioId: yup.string().required('Please select studio').nullable(),
    currencyId: yup.string().required('Please select currency').nullable(),
    milestoneId: yup.string().required('Please select milestone').nullable(),
    amount: yup
      .string()
      .required('Please enter amount')
      .max(8, 'Maximum of 8 digits')
      .test('maxDigitsAfterDecimal', 'Enter valid decimal', (number) =>
        /^\d+(\.\d{1,2})?$/.test(number),
      )
      .nullable(),
    other: yup.string().max(20, 'Maximum of 20 characters').nullable(),
    description: yup.string().max(50, 'Maximum of 50 characters').nullable(),
  });

  async function fetchCostTyleList() {
    const [err, res] = await until(getFinancialCostType());
    if (err) {
      return console.error(err);
    }
    setCostTypeList(
      Object.keys(res.result).map((o) => ({
        label: o,
        value: o,
      })) || [],
    );
  }
  return (
    <>
      <Formik
        initialValues={defaultValues}
        enableReinitialize={true}
        onSubmit={async (data) => {
          const newData = cloneObject(data);
          const milestoneId = newData.milestoneId;
          delete newData['milestoneId'];
          if (props.selectedCostId) {
            props.onUpdateCost(newData, props.selectedCostId);
          } else {
            props.onCreateCost(newData, milestoneId);
          }
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
              className="d-flex flex-column flex-grow-1 side-custom-scroll"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <div className="d-flex flex-column flex-grow-1 side-custom-scroll pr-1">
                <div className="row m-0 ml-1">
                  <div className="col-md-4 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Type*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <CustomSelect
                          name="type"
                          options={costTypeList}
                          placeholder={'Select'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          searchable={false}
                          checkbox={true}
                          searchOptions={true}
                          onChange={(value) => {
                            setFieldValue('type', value);
                          }}
                          value={values.type}
                          unselect={false}
                        />
                        {formErrors.type && (
                          <span className="text-danger input-error-msg">
                            {formErrors.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Studio*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <CustomSelect
                          searchOptions={true}
                          name="studioId"
                          value={values.studioId}
                          options={mapToLabelValue(dataProvider.studios)}
                          placeholder={'Select Studio'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          onChange={(value) => {
                            setFieldValue('studioId', value);
                          }}
                          unselect={false}
                        />
                        {formErrors.studioId && (
                          <span className="text-danger input-error-msg">
                            {formErrors.studioId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-5 pl-0 pr-0">
                    <div className="row m-0 ml-1">
                      <div className="col-md-6 pl-0 pr-4">
                        <div className="side-form-group">
                          <label>Amount*</label>
                          <div className={'mt-1 ' + classNames['mode-select']}>
                            <input
                              type="number"
                              name="amount"
                              autoComplete="off"
                              className={'mt-1 side-form-control mr-2 '}
                              onChange={(v) => {
                                handleChange(v);
                              }}
                              value={values.amount}
                              placeholder="Enter Amount"
                              onKeyDown={blockInvalidChar}
                            />
                            {formErrors.amount && (
                              <span className="text-danger input-error-msg">
                                {formErrors.amount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 pl-0 pr-0">
                        <div className="side-form-group">
                          <label>Currency*</label>
                          <div className={'mt-1 ' + classNames['mode-select']}>
                            <CustomSelect
                              name="currencyId"
                              options={props.currencyList}
                              placeholder={'Select Currency'}
                              menuPosition="bottom"
                              renderDropdownIcon={SelectDropdownArrows}
                              searchable={false}
                              checkbox={true}
                              searchOptions={true}
                              onChange={(value) => {
                                setFieldValue('currencyId', value);
                              }}
                              value={values.currencyId}
                              unselect={false}
                            />
                            {formErrors.currencyId && (
                              <span className="text-danger input-error-msg">
                                {formErrors.currencyId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Milestone*</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <CustomSelect
                          name="milestoneId"
                          options={mapToLabelValue(
                            (props.projectDetails || {}).projectMilestones
                              ? (props.projectDetails || {}).projectMilestones
                              : [],
                          )}
                          placeholder={'Select'}
                          menuPosition="bottom"
                          renderDropdownIcon={SelectDropdownArrows}
                          searchable={false}
                          checkbox={true}
                          searchOptions={true}
                          onChange={(value) => {
                            setFieldValue('milestoneId', value);
                          }}
                          value={values.milestoneId}
                          disabled={props.selectedCostId}
                          unselect={false}
                        />
                        {formErrors.milestoneId && (
                          <span className="text-danger input-error-msg">
                            {formErrors.milestoneId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 pl-0 pr-4">
                    <div className="side-form-group">
                      <label>Other</label>
                      <div className={'mt-1 ' + classNames['mode-select']}>
                        <input
                          type="text"
                          name="other"
                          autoComplete="off"
                          className={'mt-1 side-form-control mr-2 '}
                          onChange={(v) => {
                            handleChange(v);
                          }}
                          value={values.other}
                          placeholder="Enter other"
                        />
                        {formErrors.other && (
                          <span className="text-danger input-error-msg">
                            {formErrors.other}
                          </span>
                        )}
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
              </div>
              <div className="d-flex justify-content-end pt-20 pr-1 pb-1">
                <Button
                  type="submit"
                  className="add_button_invoice"
                  variant="primary"
                  disabled={props.isSubmitting}
                >
                  {props?.selectedCostId ? 'Save' : 'Add'}
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
export default AddCost;
