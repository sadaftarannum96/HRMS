import {useState, useEffect} from 'react';
import {until} from 'helpers/helpers';
import {fetchLanguages} from 'apis/data.api';

export default function useFetchLanguages(
  {skipOnLoad, type} = {skipOnLoad: false},
) {
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    !skipOnLoad && fetchAndSaveLanguages();
  }, []);

  async function fetchAndSaveLanguages() {
    const [err, data] = await until(fetchLanguages());
    if (err) {
      console.error(err);
      return;
    }
    setLanguages(data.result);
  }

  return {languages};
}
