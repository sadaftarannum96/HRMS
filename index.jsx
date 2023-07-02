import ReactDOM from 'react-dom/client';
import './index.css';
import './components/customDropdown/customDropdown.css';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'styles/global-variables.css';
import 'styles/darkMode.css';
import 'styles/custom-radio.css';
import 'styles/side-custom.css';
import App from './App';

//eslint-disable-next-line no-console
console.log(`${process.env.__APP_NAME__} ${process.env.__APP_VERSION__}`);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<App />);
/**
 * showing tooltip for table cells with ellipsis
 */
const tooltip = document.createElement('div');
tooltip.classList.add('ellipsis-tooltip');
tooltip.style.position = 'fixed';
document.body.appendChild(tooltip);
let currentTarget = null;
document.body.addEventListener(
  'mousemove',
  (e) => {
    if (
      ((e.target.tagName === 'TD' ||
        e.target.tagName === 'A' ||
        e.target.tagName === 'BUTTON' ||
        e.target.tagName === 'H5' ||
        e.target.tagName === 'P') &&
        e.target.childNodes.length === 1) ||
      e.target.tagName === 'INPUT'
    ) {
      if (
        e.target.offsetWidth < e.target.scrollWidth &&
        currentTarget !== e.target
      ) {
        currentTarget = e.target;

        const displayValue =
          e.target.tagName === 'INPUT'
            ? e.target.defaultValue
            : e.target.textContent;
        tooltip.classList.add('show');
        tooltip.innerHTML = displayValue;
        const {top, left, right, bottom} = e.target.getBoundingClientRect();
        // tooltip.style.width = right - left + 'px';
        if (window.innerHeight / 2 < top) {
          tooltip.style.bottom = window.innerHeight - top + 'px';
          tooltip.style.top = 'unset';
        } else if (window.innerHeight / 2 > top) {
          tooltip.style.top = bottom + 'px';
          // tooltip.style.maxWidth = '100%';
          // tooltip.style.minWidth = '10%';
          tooltip.style.bottom = 'unset';
        }
        tooltip.style.left = left + 'px';
        tooltip.style.backgroundColor = '#fff';
        tooltip.style.border = '1px solid #ccc';
        tooltip.style.borderRadius = '6px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.padding = '0.5rem';
        tooltip.style.fontSize = '0.75rem';
        tooltip.style.zIndex = 100000;
        tooltip.style.wordBreak = 'break-word';
        tooltip.style.boxShadow =
          '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24), 0 -1px 3px rgba(0,0,0,0.24)';
        // tooltip.style.maxWidth =
        //   document.body.clientWidth - left - 50 /*padding-right*/ + 'px';
        if ((displayValue || '').length > 350) {
          tooltip.style.maxWidth = '70%';
          tooltip.style.left = right - left + 70 + 'px';
        } else {
          tooltip.style.maxWidth = '10%';
          tooltip.style.left = left + 'px';
        }

        document.body.addEventListener('keydown', () => {
          tooltip.classList.remove('show');
          currentTarget = null;
        });
        e.target.addEventListener(
          'mouseleave',
          () => {
            tooltip.classList.remove('show');
            currentTarget = null;
          },
          {once: true},
        );
        document.body.addEventListener(
          'click',
          () => {
            tooltip.classList.remove('show');
            currentTarget = null;
          },
          {
            once: true,
            capture: true /*<Link>tag might have e.stopPropagation(). So.*/,
          },
        );

        window.addEventListener(
          'scroll',
          () => {
            tooltip.classList.remove('show');
            currentTarget = null;
          },
          {capture: true, once: true},
        );
      }
    }
  },
  {capture: true},
);

window.TABLE_LIMIT = 15;
if (document.body.clientHeight > 1100) {
  //>1080
  window.TABLE_LIMIT = 30;
}

if (document.body.clientHeight > 1800) {
  //4k = 3840 X 2160 => document.body will be atleast a 200px less than the screen height.
  window.TABLE_LIMIT = 60;
}

function toggleZenMode() {
  document.body.classList.toggle('dark-theme');
}
const zenBtn = document.getElementById('dark-theme-btn');
if (zenBtn) {
  zenBtn.addEventListener('click', toggleZenMode);
  zenBtn.style.display = '';
  window.toggleZenMode = toggleZenMode;
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

window.addEventListener(
  'storage',
  function () {
    // this triggers if this.localStorage of  same domain, changes i.e on cleared due to logout in other tab, we want to logout in this tab too.
    if (!this.localStorage.getItem('awl_token')) {
      //this.window.location.origin === "crm-dev.ptw.com" && !this.localStorage.getItem('authToken')
      //logout
      window.location = `${
        process.env.REACT_APP_OPServer
      }/oxauth/restv1/end_session?post_logout_redirect_uri=${
        process.env.REACT_APP_redirectURL
      }&id_token_hint=${localStorage.getItem('id_token')}`;
    }
  },
  false,
);

window.addEventListener('resize', (e) => {
  document.body.click();
});
// window.addEventListener(
//   'scroll',
//   (e) => {
//     function isWithInParentBounds(el) {
//       if (!el) return true;
//       const scrollableContainer =
//         el.closest('.side-custom-scroll') || el.closest('.side-custom-table'); //todo: determine with while loop and parent.offsetHeight > parent.clientHeight
//       if (!scrollableContainer) return true;
//       const rect = el.getBoundingClientRect();
//       const containerRect = scrollableContainer.getBoundingClientRect();
//       //
//       if (
//         rect.top < containerRect.top ||
//         rect.right > containerRect.right ||
//         rect.bottom > containerRect.bottom ||
//         rect.left < containerRect.left
//       ) {
//         return false;
//       }
//       //
//       return true;
//     }
//     //
//     window.isWithInParentBounds = isWithInParentBounds;
//     //
//     //scroll containers, so close only if e.target is outside these elements
//     if (
//       ['.popover.show', '.rdw-dropdown-optionwrapper'].some(
//         //'.options-list'
//         (sel) => {
//           // '.react-dropdown-select-dropdown'
//           const targetEl = document.querySelector(sel);
//           return (
//             targetEl && !targetEl.contains(e.target) && e.target !== targetEl
//           );
//         },
//       )
//     ) {
//       document.body.click();
//       document.querySelector('.show.popover')?.classList?.remove('show');
//     }
//     //
//     //just popups in react-portal, so close them on scroll
//     if (
//       !isWithInParentBounds(document.querySelector('.dropdown-menu.show')) &&
//       !document.querySelector('.dropdown-menu.show').contains(e.target)
//     ) {
//       document.body.click();
//     }
//   },
//   {capture: true},
// );
//

document.body.addEventListener('scroll', (e) => {
  e.target.tagName === 'TBODY' && document.body.click();
});
