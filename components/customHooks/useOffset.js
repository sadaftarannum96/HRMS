import {RECORDS_PER_PAGE} from 'helpers/constants';
import {useEffect, useRef, useState} from 'react';

function useOffset(fetchMoreFunc, {perPage} = {perPage: RECORDS_PER_PAGE}) {
  const [offsetFlag, setOffsetFlag] = useState(0);
  const offsetRef = useRef(0);
  const firstRenderRef = useRef(true);
  const setOffSet = (value) => {
    offsetRef.current = value;
    setOffsetFlag(Date.now());
  };

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return () => {};
    }
    fetchMoreFunc();
  }, [offsetFlag]);

  return {
    setOffSet,
    offset: offsetRef.current,
    offsetFlag,
    reset: () => (offsetRef.current = 0),
    resetAndFetch: () => {
      offsetRef.current = 0;
      setOffsetFlag(Date.now());
    },
    fetchMore: () => {
      offsetRef.current += perPage;
      setOffsetFlag(Date.now());
    },
  };
}

export default useOffset;
