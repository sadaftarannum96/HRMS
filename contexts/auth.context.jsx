import {
  useState,
  useEffect,
  createContext,
} from 'react';
import {until} from '../helpers/helpers';
import {fetchUserDetails, fetchUserPermissions} from '../auth/auth.api';
import {useIsFirstRender} from 'components/customHooks/isFirstRender';
import {toastService} from 'erp-react-components';
import {OAuthImplementation} from 'OAuthImpl/index';

const FEATURE_NAMES = {
  REPORTS: 'Reports',
  HIERARCHY: 'Hierarchy',
  PROFILE: 'Profile',
  GROUPS: 'Groups',
  DEPARTMENT: 'Department',
  HOLIDAYS: 'Holidays',
  LEAVES: 'Leaves',
  SETTINGS: 'Settings',
  HOLIDAY_LIST: 'Holiday List',
  LEAVE_MASTER: 'Leave Master',
  REQUESTS: 'Requests',
  SKILL_MANAGEMENT: 'Skill Management',
  ASSET_MANAGEMENT: 'Asset Management',
  USER_ACCESS: 'User Access',
  ACCESS_GROUPS: 'Access Groups',
  USERS: 'Users',
  BRANCHES: 'Branches',
  COMPANY_INFORMATION: 'Company Information',
};
console.dir(FEATURE_NAMES);

/**
 * @type {Context<{isLoggedIn:boolean,isCandidateLoggedIn:boolean, loadUserDetails:()=>void,checkLogin:()=>void,checkLogin:()=>void,userDetails:UserDetails.RootObject,canView:accessValues,canEdit:accessValues,canDelete:accessValues,canAdd:accessValues,profileSettings:Object,helpers:{ dateStr:(u:string,options:Object)=>string,timeStr:(u:string)=>string,dateTimeStr:(u:string,{format}:{format:string})=>string}}>}
 */
export const AuthContext = createContext({
  isLoggedIn: null,
  isCandidateLoggedIn: false,
  loadUserDetails: () => {
    console.log('load user details not updated');
  },
  checkLogin: () => {
    console.log('check login not updated');
  },
  loadprofileSettings: () => {},
  userDetails: {},
  canView: {},
  canEdit: {},
  canDelete: {},
  canAdd: {},
  profileSettings: {},
  helpers: {
    dateStr: (utcDate, options) => {
      return '';
    },
    timeStr: (time) => {
      return '';
    },
    dateTimeStr: (utcDateTime, options) => {
      return '';
    },
  },
});

export function AuthContextProvider(props) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [loginError, setLoginError] = useState(false);
  const [isCandidateLoggedIn] = useState(null);
  const isFirstRender = useIsFirstRender();
  const emptyProfileDetails = {
    timeZone: '',
    timeFormat: '12Hours',
    nameFormat: '',
    dateFormat: 'yyyy-MM-dd',
    id: '',
  };
  const [profileSettings, setprofileSettings] = useState(emptyProfileDetails);
  const [/**@type {UserDetails.RootObject} */ userDetails, setUserDetails] =
    useState({});

  const [oAuth2] = useState(
    OAuthImplementation({
      clientId: process.env.REACT_APP_clientId,
      OPServer: process.env.REACT_APP_OPServer,
      GatewayServer: process.env.REACT_APP_GatewayServer,
      redirectURL: process.env.REACT_APP_redirectURL,
      scope: process.env.REACT_APP_scope,
      userInfoEndpoint: process.env.REACT_APP_userInfoEndpoint,
      extra: process.env.REACT_APP_extra,
    }),
  );

  useEffect(() => {
    window.AUTH_STR = localStorage.getItem('awl_token');
    if (window.AUTH_STR === 'undefined') window.AUTH_STR = undefined;
    (async () => {
      if (localStorage.getItem('login-error')) {
        setLoginError(localStorage.getItem('login-error'));
        return;
      }

      if (!window.AUTH_STR) {
        oAuth2.hasRandomPrefix() //||oauth2.codeInUrl()
          ? oAuth2.completeAuth(() => {
              const returnUrl = localStorage.getItem('return-url');
              localStorage.removeItem('return-url');
              window.location.href = returnUrl || '/';
            })
          : (!localStorage.getItem('return-url') &&	
          localStorage.setItem('return-url', window.location.pathname),	
        oAuth2.sendToAuthServerPage());
        // await ERPAuthorization.getConfiguration();
        // ERPAuthorization.makeAuth(code);
      } else {
        checkLogin(() => {
          oAuth2.setUpTokenRefresh();
        });
      }
    })();
    // localStorage.removeItem("userDetails")//todo: remove this also after implementing
    return () => {
      // localStorage.clear();//todo:uncomment the line after implementing api auth on page load
    };
  }, []);

  useEffect(() => {
    if (isFirstRender)
      return () => {
        console.log('after first render useffect update');
      };
    setIsLoggedIn(!!userDetails.id);
  }, [userDetails]);

  useEffect(() => {
    if (loginError) {
      setIsLoggedIn(false);
    }
  }, [loginError]);

  //fetch profile details

  // async function getProfileDetails(userId) {
  //   userId = userId || (userDetails || {}).id;
  //   const [err, data] = await until(fetchProfileInfo(userId));
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }
  //   const m = {
  //     ...emptyProfileDetails,
  //     ...(data.result[0] || {}),
  //     dateFormat:
  //       (data.result[0] || {}).dateFormat || emptyProfileDetails.dateFormat,
  //   };
  //   setprofileSettings(m); //merging the objects so that if result doesnot have a key, it will be emptystring instead of undefined
  // }

  ///end of profile detail

  async function loadUserDetails(cb) {
    const [err, [userDetailsRes, permissionsRes]] = await until([
      fetchUserDetails(),
      fetchUserPermissions(),
    ]);
    if (err) {
      console.error(err);
      toastService.error({
        msg: err.message,
      });
      return setLoginError(err.message || 'Login Error');
      // console.error(err);
      // if (err.message === 'An unexpected error occurred') {
      //   toastService.error({
      //     msg: 'Permissions denied for this user',
      //   });
      // } else {
      //   toastService.error({msg: err.message});
      // }
      // return setIsLoggedIn(false); //setToastMsg()
    }
    setUserDetails({
      ...userDetailsRes,
      permission: permissionsRes.permissions?.length
        ? permissionsRes.permissions || []
        : [],
    });
    // console.log(userDetailsRes, permissionsRes);
    const currentUserId = userDetailsRes.id;
    const firstName = userDetailsRes.firstName;
    const lastName = userDetailsRes.lastName || '';
    const name = `${firstName} ${lastName}`;
    localStorage.setItem('currentUserId', currentUserId);
    localStorage.setItem('empName', name);
    localStorage.setItem('userDetails', JSON.stringify(userDetailsRes));
    cb && cb();
  }

  function checkLocalStorage(cb) {
    window.AUTH_STR = localStorage.getItem('awl_token');
    setIsLoggedIn(window.AUTH_STR);
    cb();
  }

  function checkLogin(cb) {
    loadUserDetails(cb);
  }

  const handleLogout = async (endSession = true) => {	
    oAuth2	
      .revokeToken(window.AUTH_STR)	
      .then((success) => {	
        if (!success) {	
          failedCallback();	
        }	
        successCallback();	
      })	
      .catch((err) => {	
        console.error(err);	
        successCallback();	
        // failedCallback()//todo: fix the api and use failedcb instead of successcb	
      });	
    function successCallback() {	
      const url = `${	
        process.env.REACT_APP_OPServer	
      }/oxauth/restv1/end_session?post_logout_redirect_uri=${	
        process.env.REACT_APP_redirectURL	
      }&id_token_hint=${localStorage.getItem('id_token')}`;	
      [	
        'awl_token',	
        'refresh_token',	
        'logging_out_due_to_auth_error',	
        'id_token',	
        'empName',	
        'currentUserId',	
        'userDetails',	
        'login-error',	
      ].forEach((name) => localStorage.removeItem(name));	
      if (endSession) {	
        window.location = url;	
      }	
    }	
    function failedCallback() {	
      return toastService.error({	
        msg: 'An error occured while logging out',	
      });	
    }	
  };	
  window.logout = handleLogout; //to be able to use in api_client.js
  
  async function loadprofileSettings() {
    setprofileSettings(
      JSON.parse(localStorage.getItem('profileSettings')) || {},
    );
  }

  function getFlatPermissionData(permissionContext) {
    const data = {};
    permissionContext.forEach((feature) => {
      data[feature.name] = {...feature.permissions};
      if (feature?.features?.length)
        data[feature.name] = {
          ...data[feature.name],
          ...getFlatPermissionData(feature.features),
        };
    });
    return data;
  }

  const permissions = getFlatPermissionData(userDetails.permission || []);

  return (
    <AuthContext.Provider
      value={{
        setUserDetails,
        loadUserDetails,
        userDetails,
        checkLocalStorage,
        checkLogin,
        isLoggedIn,
        isCandidateLoggedIn,
        loadprofileSettings,
        // getProfileDetails,
        profileSettings,
        permissions,
        loginError,
        handleLogout
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
