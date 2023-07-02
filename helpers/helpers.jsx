import moment from 'moment';

export const throttle = (func, delay) => {
  // Previously called time of the function
  let prev = 0;
  return (...args) => {
    // Current called time of the function
    let now = new Date().getTime();

    // Logging the difference between previously
    // called and current called timings
    // console.log(now - prev, delay);

    // If difference is greater than delay call
    // the function again.
    if (now - prev > delay) {
      prev = now;

      // "..." is the spread operator here
      // returning the function with the
      // array of arguments
      return func(...args);
    }
  };
};

export function until(promiseOrPromiseList) {
  if (!promiseOrPromiseList) {
    console.error('no promise passed.', promiseOrPromiseList);
    return Promise.reject(['Unknown Error']);
  }
  //array of promises
  if (Array.isArray(promiseOrPromiseList)) {
    return Promise.all(promiseOrPromiseList)
      .then((data) => {
        return [null, data];
      })
      .catch((err) => {
        return [err, promiseOrPromiseList.map(() => undefined)];
      });
  }
  //single promise call
  return promiseOrPromiseList
    .then((data) => {
      return [null, data];
    })
    .catch((err) => {
      return [err];
    });
}

export function uniqueItems(objArray, key) {
  if (!objArray || !key) {
    console.error('no args', objArray, key);
    return objArray;
  }
  return objArray.reduce((result, obj) => {
    if (result.find((o) => o[key] == obj[key])) {
      return result;
    }
    return [...result, obj];
  }, []);
}

export function getUniqueArrByKey(arr, key) {
  return [...new Map(arr.map((item) => [item[key], item])).values()];
}

export function string_to_slug(str = '', separator = '-') {
  if (!str) return str;
  str = str.trim();
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from = 'åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;';
  const to = 'aaaaaaeeeeiiiioooouuuunc------';

  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  return str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, '') // trim - from end of text
    .replace(/-/g, separator);
}

export function slugToFormattedStr(slug = '', separator = '_') {
  if (!slug) return slug;
  slug = slug.trim();
  let words = slug.split(separator);
  words = words.map((w) => {
    return w[0].toUpperCase() + w.substr(1);
  });
  return words.join(' ');
}

/**
 *
 * @param {{}|[]} obj
 * @returns {{}|[]} obj
 */
export function cloneObject(obj) {
  var clone = Array.isArray(obj) ? [] : {};
  for (var i in obj) {
    if (obj[i] != null && typeof obj[i] == 'object')
      clone[i] = cloneObject(obj[i]);
    else clone[i] = obj[i];
  }
  return clone;
}

/**
 * @description adds a unique_id key if the objects in array doesnot have id key.
 * @param {Object[]} listOfObjects
 */
export function addIdKey(listOfObjects, keyName = 'id') {
  return listOfObjects.map((i, idx) => ({
    ...i,
    [keyName]: i[keyName] || new Date().getTime() + '' + idx + Math.random(),
  }));
}

/**
 * https://stackoverflow.com/a/49860927/7314900
 * @param {HTMLElement|Element} element
 * @param {("top"|"bottom"|"left"|"right")} direction
 * todo: direction should be calculated basing on its position and offset inparent.
 */
export function scrollToTargetWithOffset(element, direction) {
  var headerOffset = 30;
  var elementPosition = element.getBoundingClientRect()[direction];
  var offsetPosition = ['top', 'left'].includes(direction)
    ? elementPosition - headerOffset
    : elementPosition + headerOffset;
  element.parentElement.scrollTo({
    [direction]: offsetPosition,
    behavior: 'smooth',
  });
}

export function sleep(ms = 500) {
  return new Promise((resolve) => {
    let wait = setTimeout(() => {
      clearTimeout(wait);
      resolve('waited for atleast ' + ms + ' milliseconds');
    }, ms);
  });
}

export function downloadFileFromData(binaryData, fileName) {
  const url = window.URL.createObjectURL(new Blob([binaryData]));
  const link = document.createElement('a');
  link.href = url;

  //todo: set proper name
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function downloadImageFromData(image, name, extension) {
  const a = document.createElement('a');
  a.href = image;
  a.download = `${name}.${extension}`;
  a.click();
}

/*
  https://stackoverflow.com/a/61613914/7314900
*/
export function reorder(array, sourceIndex, destinationIndex) {
  const smallerIndex = Math.min(sourceIndex, destinationIndex);
  const largerIndex = Math.max(sourceIndex, destinationIndex);

  return [
    ...array.slice(0, smallerIndex),
    ...(sourceIndex < destinationIndex
      ? array.slice(smallerIndex + 1, largerIndex + 1)
      : []),
    array[sourceIndex],
    ...(sourceIndex > destinationIndex
      ? array.slice(smallerIndex, largerIndex)
      : []),
    ...array.slice(largerIndex + 1),
  ];
}

export function getUniqueNumber() {
  const u = (window.__AWL_UNIQUE_NUMBER__ =
    (window.__AWL_UNIQUE_NUMBER__ || 0) + 1);
  return u;
}

export function mapToLabelValue(d) {
  if (!Array.isArray(d)) {
    console.error('mapToLabelValue :not an array', d);
    return [];
  }
  return d.map((d) => ({
    value: d.service || d.id || d.value,
    label:
      (d.projectStatus &&
        `${d.name}${
          d.projectStatus === 'Inactive' ? ` (${d.projectStatus})` : ''
        }`) ||
      d.service ||
      d.name ||
      d.label ||
      d.timezone ||
      d.firstName + ' ' + d.lastName,
  }));
}

export function getNestedValue(obj, path) {
  if (!obj) {
    return null;
  }
  if (!path) {
    return obj;
  }
  const properties = typeof path == 'string' ? path.split('.') : path;
  return getNestedValue(obj[properties.shift()], properties.join('.'));
}

/**
 * https://stackoverflow.com/a/46008856/7314900
 * Dynamically sets a deeply nested value in an object.
 * Optionally "bores" a path to it if its undefined.
 * @function
 * @param {!object} obj  - The object which contains the value you want to change/set.
 * @param {!array|string} path  - The array representation of path to the value you want to change/set.
 * @param {!mixed} value - The value you want to set it to.
 * @param {boolean} setrecursively - If true, will set value of non-existing path as well.
 */
export function setDeep(
  obj,
  path,
  value,
  setrecursively = false,
  returnObj = true,
  modifyOriginal = false,
) {
  if (!modifyOriginal) {
    obj = JSON.parse(JSON.stringify(obj));
  }
  if (typeof path == 'string') path = path.split('.');
  path.reduce((a, b, level) => {
    if (
      setrecursively &&
      typeof a[b] === 'undefined' &&
      level !== path.length - 1
    ) {
      a[b] = {};
      return a[b];
    }

    if (level === path.length - 1) {
      a[b] = value;
      return value;
    }
    return a[b];
  }, obj);
  if (returnObj) {
    return obj;
  }
}

// https://stackoverflow.com/a/59590002/7314900
export function camelToTitleCase(str) {
  return str
    .replace(/[0-9]{2,}/g, (match) => ` ${match} `)
    .replace(/[^A-Z0-9][A-Z]/g, (match) => `${match[0]} ${match[1]}`)
    .replace(
      /[A-Z][A-Z][^A-Z0-9]/g,
      (match) => `${match[0]} ${match[1]}${match[2]}`,
    )
    .replace(/[ ]{2,}/g, () => ' ')
    .replace(/\s./g, (match) => match.toUpperCase())
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
}

/**
 * deep objectCompare
 * @link https://gist.github.com/nicbell/6081098
 */
export function objectCompare(obj1, obj2) {
  if (!obj1 || !obj2) return false;
  //Loop through properties in object 1
  for (var p in obj1) {
    //Check property exists on both objects
    if (
      Object.prototype.hasOwnProperty.call(obj1, p) !==
      Object.prototype.hasOwnProperty.call(obj2, p)
    )
      return false;

    switch (typeof obj1[p]) {
      //Deep compare objects
      case 'object':
        if (!objectCompare(obj1[p], obj2[p])) return false;
        break;
      //Compare function code
      case 'function':
        if (
          typeof obj2[p] == 'undefined' ||
          obj1[p].toString() != obj2[p].toString()
        )
          return false;
        break;
      //Compare values
      default:
        if (obj1[p] != obj2[p]) return false;
    }
  }

  //Check object 2 for any extra properties
  for (var v in obj2) {
    if (typeof obj1[v] == 'undefined') return false;
  }
  return true;
}

export function getKeyValuePairOfObj(obj) {
  let arr = [];
  for (const [key, value] of Object.entries(obj)) {
    arr.push({
      label: value,
      value: key,
    });
  }
  return arr;
}

export function getKeyValuePairOfObjForPercantage(obj) {
  let arr = [];
  for (const [key, value] of Object.entries(obj)) {
    arr.push({
      label: value,
      value: Number(key.slice(0, -1)),
    });
  }
  return arr.sort((a, b) => a.value - b.value);
}

/**
 *
 * @param {string} date date in dateString orr YYYY-MM-DD format
 * @param {string} time time in 24hour format HH:mm
 * @returns {string} isoString
 */
export function createIsoString(date, time) {
  if (!date) throw new Error('date not given');
  const d = new Date(date);
  if (time) {
    d.setHours(time.split(':')[0]);
    d.setMinutes(time.split(':')[1]);
  }
  return d.toISOString();
}

export function createDatetimeString(date, time) {
  if (!date) throw new Error('date not given');
  const d = new Date(date);
  if (time) {
    d.setHours(time.split(':')[0]);
    d.setMinutes(time.split(':')[1]);
  }
  return (
    d.getFullYear() +
    '-' +
    (d.getMonth() + 1) +
    '-' +
    d.getDate() +
    ' ' +
    d.getHours() +
    ':' +
    d.getMinutes()
  );
}

//https://stackoverflow.com/questions/5072136/javascript-filter-for-objects
// filter by specific key
export function filterkey(object, ...keys) {
  return keys.reduce((result, key) => ({...result, [key]: object[key]}), {});
}

export function placeCaretAtEnd(el) {
  el.focus();
  if (
    typeof window.getSelection != 'undefined' &&
    typeof document.createRange != 'undefined'
  ) {
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != 'undefined') {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
}
export function ellipsize(str = '', maxLen = 50) {
  if (!isNaN(str)) str = str + ''; //catch numbers
  if (!str) str = ''; //catch null or undefined

  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
}

export function checkValidString(str) {
  // var special_chars = new RegExp('[@_!#$%^&*()<>?/\|}{~:]')
  var special_chars_digits = new RegExp(/^[a-zA-Z ]+$/);
  var check = special_chars_digits.test(str);
  return !check;
}

// getting time format

export const ctype_alnum = (str) => {
  var code, i, len;
  var isNumeric = false,
    isAlpha = false,
    isSpace = false, //I assume that it is all non-alphanumeric
    isHyphen = false;

  if (str) {
    for (i = 0, len = str.length; i < len; i++) {
      code = str.charCodeAt(i);
      switch (true) {
        case code > 47 && code < 58: // check if 0-9
          isNumeric = true;
          break;
        case (code > 64 && code < 91) || (code > 96 && code < 123): //check if A-Z or a-z
          isAlpha = true;
          break; // not 0-9, not A-Z or a-z
        case code === 32:
          isSpace = true; //check for spaces
          break;
        case code === 189 || code === 45:
          isHyphen = true; //check for spaces
          break;
        default:
          return false; //stop function with false result, no more checks
      }
    }
  }

  return (
    (isNumeric && isAlpha) ||
    (isSpace && isNumeric && isAlpha) ||
    (isHyphen && isAlpha && !isSpace) ||
    (isAlpha && !isSpace)
  ); //return the loop results, if both are true or all three are true, the string is certainly alphanumeric
};

export function secondsToTime(in_seconds) {
  var time = '';
  in_seconds = parseFloat(in_seconds.toFixed(2));
  var hours = Math.floor(in_seconds / 3600);
  var minutes = Math.floor((in_seconds - hours * 3600) / 60);
  var seconds = in_seconds - hours * 3600 - minutes * 60;
  seconds = seconds.toFixed(0);

  if (hours < 10) {
    hours = '0' + hours;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  time = minutes + ':' + seconds;

  return time;
}

export function formatSubmittedData(originalData) {
  // let result = [];
  // selectedData.map((l) =>
  //   originalData.map((dl) => {
  //     if (l === dl.id || dl.value) {
  //       result.push({id: dl.id || dl.value, name: dl.name || dl.value});
  //     }
  //   }),
  // );

  let result = {};
  for (var i in originalData) {
    if (originalData[i].id) {
      result[originalData[i].id] = originalData[i].name;
    }
  }
  return result;
}

export const getDivWidth = (startTimeVal, endTimeVal) => {
  var startTime = moment(startTimeVal, 'HH:mm');
  var endTime = moment(endTimeVal, 'HH:mm');
  var diff = moment.duration(endTime.diff(startTime));
  const minutes = diff.hours() * 60 + diff.minutes();
  const width = (minutes / 60) * 100;
  return width;
};

export const getTotalMin = (startTimeVal, endTimeVal) => {
  const startTime = moment(startTimeVal, 'HH:mm');
  const endTime = moment(endTimeVal, 'HH:mm');
  var diff = moment.duration(endTime.diff(startTime));
  const minutes = diff.hours() * 60 + diff.minutes();
  return minutes;
};

export const getDivLeft = (startTimeVal) => {
  const leftPercent = (startTimeVal.split(':')[1] / 60) * 100;
  return leftPercent;
};

export const getMoreEventPosition = (startTimeVal, endTimeVal) => {
  let width = getDivWidth(startTimeVal, endTimeVal);
  const widthVal = width < 0 ? (width = 40) : width;
  return getDivLeft(startTimeVal) + widthVal / 2 - 10; //in between of event width (+more) and here 10 is +more div width
};

export const getDivHeight = (
  currentSlot,
  allSlots,
  eventPosition,
  sessionList,
) => {
  let isBetweenBefore = false;
  let isBetweenAfter = false;
  let isSame = false;
  const particularSlots = Object.keys(allSlots || {})
    .map((key) => allSlots[key])
    .flat()
    .filter((s, index, all) => {
      const afterCurrentSlot = all.filter((s) =>
        moment(s.startTime, 'HH:mm').isAfter(
          moment(currentSlot.startTime, 'HH:mm'),
        ),
      );
      const beforeCurrentSlot = all.filter((s) =>
        moment(s.startTime, 'HH:mm').isBefore(
          moment(currentSlot.startTime, 'HH:mm'),
        ),
      );
      const sameStartTime = all.filter((s) =>
        moment(s.startTime, 'HH:mm').isSame(
          moment(currentSlot.startTime, 'HH:mm'),
        ),
      );
      const sameEndTime = all.filter((s) =>
        moment(s.endTime, 'HH:mm').isSame(moment(currentSlot.endTime, 'HH:mm')),
      );
      isBetweenAfter = moment(
        afterCurrentSlot?.[0]?.startTime,
        'HH:mm',
      ).isBetween(
        moment(currentSlot?.startTime, 'HH:mm'),
        moment(currentSlot?.endTime, 'HH:mm'),
      );
      isBetweenBefore = moment(currentSlot?.startTime, 'HH:mm').isBetween(
        moment(
          beforeCurrentSlot?.[beforeCurrentSlot.length - 1]?.startTime,
          'HH:mm',
        ),
        moment(
          beforeCurrentSlot?.[beforeCurrentSlot.length - 1]?.endTime,
          'HH:mm',
        ),
      );
      isSame = sameStartTime.length === sameEndTime.length;
      const startTimeSplit = s?.startTime?.split(':') || [];
      const currentSlotTimeSplit = currentSlot?.startTime?.split(':') || [];
      return (
        (startTimeSplit.length &&
          currentSlotTimeSplit.length &&
          startTimeSplit[0] === currentSlotTimeSplit[0] &&
          startTimeSplit[1] === currentSlotTimeSplit[1]) ||
        isBetweenAfter ||
        isBetweenBefore ||
        isSame
      );
    });
  if (particularSlots.length > 1) {
    return {
      height: sessionList.length > 1 ? 100 / 2 : 100,
      top:
        eventPosition === 1
          ? 50
          : isBetweenBefore && isBetweenAfter && isSame
          ? 50
          : 0,
    };
  }
  return {height: 100, top: 0};
};
export const randomCharString = function (length) {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYYZabcdefghijklmnopqrstuvwxyyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export function randomNumberString(length) {
  let text = '';
  const possible = '0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export const specialCharacters = ['+', '-', '=', '@'];

export const bytesIntoMb = (bytes) => {
  return (bytes / 1024 / 1024).toFixed(2);
};

//you will get albhabet by number like this 0->A , 1->B
export const getAlphabetByIndex = (index = 0) => {
  const updatedIndex = index % 26;
  const hasAlphabetComplete = parseInt(index / 26);
  //Converting a number to a string with base 36.
  //while the numbers 0–9 are used to represent their decimal values that's why we are adding 10 here because characters will start from 10 in Hexadecimal system
  const alphabet = (updatedIndex + 10).toString(36).toUpperCase();
  const extra = hasAlphabetComplete ? hasAlphabetComplete : '';
  return alphabet + extra;
};
//this are the currency symbols that does not supported by jsPdf
export const currencyName = (symbol) => {
  const obj = {
    '₹': 'INR',
    '؋': 'AFN',
    '₼': 'AZN',
    '៛': 'KHR',
    '₡': 'CRC',
    '₱': 'CUP',
    Kč: 'CZK',
    '﷼': 'IRR',
    '₪': 'ILS',
    лв: 'KZT',
    '₩': 'KPW',
    ден: 'MKD',
    '₮': 'MNT',
    'د.إ': 'MNT',
    '₦': 'NGN',
    zł: 'PLN',
    '₺': 'TRY',
    '₫': 'VND',
    Дин: 'RSD',
  };
  return obj[symbol];
};

export function hasOnlySpecialCharacters(string) {
  var regex = /^[!@#$%^&*/()_ -]+$/;
  if (regex.test(string)) return true;
  return false;
}

export function getLeftOfRoomFinder(startTime) {
  let minrems = 0.10833333333333334;
  let [startHour, startMin] = (startTime || '').split(':');
  let totalMin = parseInt(startHour) * 60 + parseInt(startMin);
  return totalMin * minrems;
}

export function getWidthOfRoomFinder(startTime, endTime) {
  let minrems = 0.10833333333333334;
  let [startHour, startMin] = (startTime || '').split(':');
  let [endHour, endMin] = (endTime || '').split(':');
  let totalMin =
    (parseInt(endHour) - parseInt(startHour)) * 60 +
    parseInt(endMin - startMin);
  return totalMin * minrems < 4.25 ? 4.25 : totalMin * minrems;
}

export function getMarginTopOfRoomFinder(index) {
  return `${2.6 + 5 * index + 0.35 * index}rem`;
}

export function quotesErrShow(formErr) {
  for (let i in formErr) {
    if (typeof formErr[i] === 'undefined') continue;
    if (typeof formErr[i] === 'string') return formErr[i];
    return quotesErrShow(formErr[i]);
  }
}

export const blockInvalidChar = (e) =>
  ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

export const focusWithInModal = (e, isAdvanceSearch) => {
  let isAdvanceSearchEnter = isAdvanceSearch;
  //Fetch node list from which required elements could be grabbed as needed.
  const modal = document.getElementById('side-modal-focus');
  if (!modal) return;
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, li, a,[tabindex]:not([tabindex="-1"])',
  );
  const firstFocusable = focusable[0];
  const lastFocusable = focusable[focusable.length - 1];

  if (e.ctrlKey || e.altKey) {
    return;
  }

  const keys = {
    9: () => {
      //9 = TAB
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    },
    13: () => {
      //13 = ENTER
      if (isAdvanceSearchEnter) {
        isAdvanceSearchEnter = false;
        firstFocusable.focus();
        e.preventDefault();
      }
    },
  };

  if (keys[e.keyCode]) {
    keys[e.keyCode]();
  }
};

export const closeCalendarOnTab = (e, datePickerRef) => {
  if (datePickerRef?.current && !datePickerRef.current.state.open) {
    if (e?.keyCode === 13 || e?.which === 13) {
      // close date picker popup when we click shift + Tab
      e.preventDefault();
      datePickerRef.current?.setOpen(true);
    }
  }
};

export const isFilterEmpty = (filters) => {
  return Object.keys(filters).some(
    (filterKey) => filters[filterKey].length > 0,
  );
};

export const formattedLatestVersion = (value) => {
  let val = typeof value === 'number' ? `${value}.0` : value;
  const str = val.toString();
  const convertedNum = Number(str.split('.')[1]);
  const increamentVal = convertedNum + 1;
  const firstVal = str.split('.')[0];
  const totalStr = firstVal + '.' + increamentVal;
  return totalStr;
};
