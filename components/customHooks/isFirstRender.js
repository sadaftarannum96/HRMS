import {useRef, useEffect} from 'react';

/**
 * https://stackoverflow.com/a/56267719/7314900
 */
export const useIsFirstRender = () => {
  const isMountRef = useRef(true);
  useEffect(() => {
    isMountRef.current = false;
  }, []);
  return isMountRef.current;
};
