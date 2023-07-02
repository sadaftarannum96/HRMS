
import fs from 'fs';
import path from 'path'

export const tMatchRegex = /\bt\((\r\n)?\+? *"? *?'(.+)',?(\r\n)?"?\+?'?( *)?\)/g

export function until(promiseOrPromiseList) {
  if (!promiseOrPromiseList) {
    console.error('no promise passed.', promiseOrPromiseList);
    return Promise.reject([new Error('Unknown Error')]);
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

export function string_to_slug(str = '', separator = '-',upperCase=true) {
  return str.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, "") //remove diacritics
  .toUpperCase()
  .replace(/\s+/g, '_') //spaces to dashes
  .replace(/&/g, '_AND_') //ampersand to and
  .replace(/[^\w-]+/g, '') //remove non-words
  .replace(/--+/g, '_') //collapse multiple dashes
  .replace(/-+/g, '_') //collapse single dash
  .replace(/^-+/, '') //trim starting dash
  .replace(/-+$/, ''); //trim ending dash
}



// https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
export function Walk(directoryName, done, excludeFolders = []) {
    var results = [];
    fs.readdir(directoryName, function (err, list) {
      if (err) return done(err);
      list = list.filter(
        (f) =>
          !excludeFolders.includes(f) &&
          !f.match(/(.css)/) &&
          !f.match(/(.http)/) &&
          !f.match(/(.api.js)/),
      );
      var pending = list.length;
      if (!pending) return done(null, results);
      list.forEach(function (file) {
        file = path.resolve(directoryName, file);
        fs.stat(file, function (err, stat) {
          if (stat && stat.isDirectory()) {
            Walk(
              file,
              function (err, res) {
                results = results.concat(res);
                if (!--pending) done(null, results);
              },
              excludeFolders,
            );
          } else {
            results.push(file);
            if (!--pending) done(null, results);
          }
        });
      });
    });
    //   return files;
  }
 
  
 export const WalkPromise = function (path, excludeFolders) {
    return new Promise((resolve, reject) => {
      Walk(
        path,
        function (err, results) {
          if (err) return reject(err);
          // console.log(results.length);
          resolve(results);
        },
        excludeFolders,
      );
    });
  };