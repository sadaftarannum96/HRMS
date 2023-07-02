import {useState, useEffect, createContext} from 'react';
import Axios from '../helpers/api_client';
import {fetchManagers} from '../apis/leave-master/leave-master.api';
import {until} from '../helpers/helpers';
import {RECORDS_PER_PAGE} from 'helpers/constants';
import useOffset from 'components/customHooks/useOffset';

export const LMContext = createContext({
  onMyViewSelect: () => {
    console.error('LMContext not initiated properly.');
  },
  myView: null,
  leavesRequested: null,
  fetchRequestedLeaves: null,
  fetchRejectedLeaves: null,
  fetchApprovedLeaves: null,
  managers: null,
  fetchManagers: null,
  leavesRejected: null,
  leavesApproved: null,
  fetchAllLeaves: null,
});

export function LMContextProvider(props) {
  const [myView, setMyView] = useState(null);
  const [managers, setManagers] = useState([]);
  const [leavesRequested, setLeavesRequested] = useState([]);
  const [leavesRejected, setLeavesRejected] = useState([]);
  const [leavesApproved, setLeavesApproved] = useState([]);
  const [filters, setFilters] = useState({
    leavesRequested: {},
    leavesRejected: {},
    leavesApproved: {},
  });

  //pagination list
  const [isLoading, setIsLoading] = useState(false);
  const {offset, reset: resetOffset, fetchMore} = useOffset(fetchMoreLeaves);
  const [loadingMore, setLoadingMore] = useState(false);
  const [requestNumTotalRecords, setRequestNumTotalRecords] = useState(10);
  const [approvedNumTotalRecords, setApprovedNumTotalRecords] = useState(10);
  const [rejectedNumTotalRecords, setRejectedNumTotalRecords] = useState(10);

  //pagination list ends

  useEffect(() => {
    _fetchManagers();
  }, []);

  useEffect(() => {
    fetchAllLeaves();
    resetOffset();
  }, [myView, filters]);

  function fetchAllLeaves() {
    getPendingLeaves(filters['leavesRequested']);
    getRejectedLeaves(filters['leavesRejected']);
    getLeavesApproved(filters['leavesApproved']);
  }

  function fetchMoreLeaves() {
    if (props.children.props.activeKey === 'leavesRequested') {
      getMorePendingLeaves(filters['leavesRequested']);
    } else if (props.children.props.activeKey === 'leavesRejected') {
      getMoreRejectedLeaves(filters['leavesRejected']);
    } else if (props.children.props.activeKey === 'leavesApproved') {
      getMoreLeavesApproved(filters['leavesApproved']);
    } else {
      getMorePendingLeaves(filters['leavesRequested']);
      getMoreRejectedLeaves(filters['leavesRejected']);
      getMoreLeavesApproved(filters['leavesApproved']);
    }
  }

  async function _fetchManagers() {
    const [err, res] = await until(fetchManagers());
    if (err) return console.error(err);
    setManagers(res.result || []);
  }

  const getRejectedLeaves = (filters) => {
    setIsLoading(true);
    let param = '';
    if (myView) {
      param += '&managerId=' + myView;
    }
    if (filters) {
      for (var i in filters) {
        param += '&' + i + '=' + filters[i];
      }
    }
    param += '&offset=' + offset;
    param += '&limit=' + RECORDS_PER_PAGE;
    Axios.get(
      `${process.env.REACT_APP_API_GATEWAY_URL}lms/leaves/?status=REJECTED` +
        param,
    )
      .then((res) => {
        setIsLoading(false);
        setRejectedNumTotalRecords(res.data.count || RECORDS_PER_PAGE);
        setLeavesRejected(res.data.result || []);
      })
      .catch((err) => {
        setIsLoading(false);
        return console.error(err);
      });
  };

  const getMoreRejectedLeaves = (filters) => {
    setLoadingMore(true);
    let param = '';
    if (myView) {
      param += '&managerId=' + myView;
    }
    if (filters) {
      for (var i in filters) {
        param += '&' + i + '=' + filters[i];
      }
    }
    param += '&offset=' + offset;
    param += '&limit=' + RECORDS_PER_PAGE;
    Axios.get(
      `${process.env.REACT_APP_API_GATEWAY_URL}lms/leaves/?status=REJECTED` +
        param,
    )
      .then((res) => {
        setLoadingMore(false);

        let data = leavesRejected.concat(res.data.result || []);
        setRejectedNumTotalRecords(res.data.count || RECORDS_PER_PAGE);
        setLeavesRejected(data || []);
      })
      .catch((err) => {
        setLoadingMore(false);
        return console.error(err);
      });
  };

  const getLeavesApproved = (filters) => {
    setIsLoading(true);
    let param = '';
    if (myView) {
      param += '&managerId=' + myView;
    }
    if (filters) {
      for (var i in filters) {
        param += '&' + i + '=' + filters[i];
      }
    }
    param += '&offset=' + offset;
    param += '&limit=' + RECORDS_PER_PAGE;
    Axios.get(
      `${process.env.REACT_APP_API_GATEWAY_URL}lms/leaves/?status=APPROVED` +
        param,
    )
      .then((res) => {
        setIsLoading(false);
        setApprovedNumTotalRecords(res.data.count || RECORDS_PER_PAGE);
        setLeavesApproved(res.data.result || []);
      })
      .catch((err) => {
        setIsLoading(false);
        return console.error(err);
      });
  };

  const getMoreLeavesApproved = (filters) => {
    setLoadingMore(true);
    let param = '';
    if (myView) {
      param += '&managerId=' + myView;
    }
    if (filters) {
      for (var i in filters) {
        param += '&' + i + '=' + filters[i];
      }
    }
    param += '&offset=' + offset;
    param += '&limit=' + RECORDS_PER_PAGE;
    Axios.get(
      `${process.env.REACT_APP_API_GATEWAY_URL}lms/leaves/?status=APPROVED` +
        param,
    )
      .then((res) => {
        setLoadingMore(false);
        let data = leavesApproved.concat(res.data.result || []);
        setApprovedNumTotalRecords(res.data.count || RECORDS_PER_PAGE);
        setLeavesApproved(data || []);
      })
      .catch((err) => {
        setLoadingMore(false);
        return console.error(err);
      });
  };

  const getPendingLeaves = (filters) => {
    setIsLoading(true);
    let param = '';
    if (myView) {
      param += '&managerId=' + myView;
    }
    if (filters) {
      for (var i in filters) {
        param += '&' + i + '=' + filters[i];
      }
    }
    param += '&offset=' + offset;
    param += '&limit=' + RECORDS_PER_PAGE;
    Axios.get(
      `${process.env.REACT_APP_API_GATEWAY_URL}lms/leaves/?status=PENDING` + param,
    )
      .then((res) => {
        setIsLoading(false);
        setRequestNumTotalRecords(res.data.count || RECORDS_PER_PAGE);
        setLeavesRequested(res.data.result || []);
      })
      .catch((err) => {
        setIsLoading(false);
        return console.error(err);
      });
  };

  const getMorePendingLeaves = (filters) => {
    setLoadingMore(true);
    let param = '';
    if (myView) {
      param += '&managerId=' + myView;
    }
    if (filters) {
      for (var i in filters) {
        param += '&' + i + '=' + filters[i];
      }
    }
    param += '&offset=' + offset;
    param += '&limit=' + RECORDS_PER_PAGE;
    Axios.get(
      `${process.env.REACT_APP_API_GATEWAY_URL}lms/leaves/?status=PENDING` + param,
    )
      .then((res) => {
        setLoadingMore(false);
        let data = leavesRequested.concat(res.data.result || []);
        setRequestNumTotalRecords(res.data.count || RECORDS_PER_PAGE);
        setLeavesRequested(data || []);
      })
      .catch((err) => {
        setLoadingMore(false);
        return console.error(err);
      });
  };

  return (
    <LMContext.Provider
      value={{
        onMyViewSelect: setMyView,
        myView,
        leavesRequested,
        fetchRequestedLeaves: getPendingLeaves,
        fetchRejectedLeaves: getRejectedLeaves,
        fetchApprovedLeaves: getLeavesApproved,
        managers,
        fetchManagers: _fetchManagers,
        leavesRejected,
        leavesApproved,
        fetchAllLeaves: fetchAllLeaves,
        setFilters: (leaveType, filtersObj) => {
          setFilters({...filters, [leaveType]: filtersObj});
        },
        getFilters: (leaveType) => {
          return filters[leaveType];
        },
        isLoading,
        loadingMore,
        requestNumTotalRecords,
        approvedNumTotalRecords,
        rejectedNumTotalRecords,
        fetchMore,
      }}
    >
      {props.children}
    </LMContext.Provider>
  );
}
