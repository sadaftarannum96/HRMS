import {randomCharString, randomNumberString, until} from 'helpers/helpers';
import {Crypto, DefaultCrypto} from './cryptoUtils';

type env = {
  clientId: string;
  OPServer: string;
  GatewayServer: string;
  redirectURL: string;
  scope: string;
  userInfoEndpoint: string;
  extra: string;
};

type TokenResponse = {
  access_token: string;
  token_type?:
    | 'bearer'
    | 'mac' /* treating token type as optional, as its going to be inferred. */;
  expires_in?: string /* lifetime in seconds. */;
  refresh_token?: string;
  scope?: string;
  id_token?: string /* https://openid.net/specs/openid-connect-core-1_0.html#TokenResponse */;
  issued_at?: number;
};

const RESPONSE_TYPE_TOKEN = 'token' as const;
const RESPONSE_TYPE_CODE = 'code' as const;
const GRANT_TYPE_AUTHORIZATION_CODE = 'authorization_code';
const GRANT_TYPE_REFRESH_TOKEN = 'refresh_token';
const BUILT_IN_PARAMETERS = [
  'redirect_uri',
  'client_id',
  'response_type',
  'state',
  'scope',
];

const crypto = new DefaultCrypto();
export function OAuthImplementation(env: env) {
  let config = {
    authorization_endpoint: '',
    token_endpoint: '',
    revocation_endpoint: '',
    end_session_endpoint: '',
    userinfo_endpoint: '',
  }; //todo: copy from network tab, as these probably will never change
  const internal = {code_verifier: ''}; //this is not sent in buildurl, but will need this after coming back
  const redirectReqParams: Record<string, string> = {
    client_id: env.clientId,
    redirect_uri: env.redirectURL,
    scope: env.scope,
    response_type: RESPONSE_TYPE_CODE,
    state: randomCharString(10),
  };
  const extras = {
    ...JSON.parse(env.extra),
    nonce: crypto.generateRandom(10),
  };

  function getConfig() {
    return fetch(env.OPServer + '/.well-known/openid-configuration', {
      method: 'GET',
      headers: {},
      credentials: 'omit',
      mode: 'cors',
    })
      .then((r) => r.json())
      .then((r) => {
        config = {
          authorization_endpoint: r.authorization_endpoint,
          token_endpoint: r.token_endpoint,
          revocation_endpoint: r.revocation_endpoint,
          end_session_endpoint: r.end_session_endpoint,
          userinfo_endpoint: r.userinfo_endpoint,
        };
      })
      .catch((e) => {
        console.error(e);
      });
  }

  async function sendToAuthServerPage() {
    await getConfig();
    const url = await buildRequestUrl();
    saveAuthItemsToStorage();
    window.location.href = url;
  }

  async function buildRequestUrl() {
    await setupCodeVerifier();
    // copy over extras to redirectReqParams
    if (env.extra) {
      addExtrasToObj(redirectReqParams);
    }

    const query = new URLSearchParams(redirectReqParams).toString(); //does not support recursive objects
    const baseUrl = config.authorization_endpoint;
    const url = `${baseUrl}?${query}`;
    return url;
  }

  /**
   *
   * @param {{}}redirectReqParams
   * @description impure function, modifies the param
   */
  function addExtrasToObj(redirectReqParams) {
    for (const key in extras) {
      if (Object.prototype.hasOwnProperty.call(extras, key)) {
        // check before inserting to requestMap
        if (BUILT_IN_PARAMETERS.indexOf(key) < 0) {
          redirectReqParams[key] = extras[key];
        }
      }
    }
  }

  function setupCodeVerifier(usePkce = true): Promise<string | undefined> {
    if (!usePkce) {
      return Promise.resolve(undefined);
    } else {
      const codeVerifier = crypto.generateRandom(128);

      const challenge: Promise<string | undefined> = crypto
        .deriveChallenge(codeVerifier)
        .then((result) => {
          if (result) {
            // keep track of the code used.
            internal['code_verifier'] = codeVerifier;
            extras['code_challenge'] = result;
            // We always use S256. Plain is not good enough.
            extras['code_challenge_method'] = 'S256';
            return 'w';
          }
        })
        .catch((error) => {
          console.error(
            'Unable to generate PKCE challenge. Not using PKCE',
            error,
          );
          return undefined;
        });
      return challenge;
    }
  }

  function hasRandomPrefix() {
    return sessionStorage.getItem('authItemsPrefix');
  }

  function saveAuthItemsToStorage() {
    const randomPrefix = crypto.generateRandom(5);
    sessionStorage.setItem('authItemsPrefix', randomPrefix);
    sessionStorage.setItem(
      randomPrefix + '__redirectReqParams',
      JSON.stringify(redirectReqParams),
    );

    sessionStorage.setItem(randomPrefix + '__internal', JSON.stringify(internal));

    sessionStorage.setItem(randomPrefix + '__config', JSON.stringify(config));
  }
  function removeAuthItemsToStorage() {
    const randomPrefix = sessionStorage.getItem('authItemsPrefix');
    sessionStorage.removeItem('authItemsPrefix');
    sessionStorage.removeItem(randomPrefix + '__redirectReqParams');

    sessionStorage.removeItem(randomPrefix + '__internal');

    sessionStorage.removeItem(randomPrefix + '__config');
  }

  function loadAuthItemsFromStorage() {
    const randomPrefix = sessionStorage.getItem('authItemsPrefix');
    const _redirectReqParams = JSON.parse(
      sessionStorage.getItem(randomPrefix + '__redirectReqParams'),
    );
    for (const i in _redirectReqParams) {
      if (['client_id', 'redirect_uri', 'scope'].includes(i)) {
        continue; //take the hardcoded values, rather than trusting sessionstorage
      }
      redirectReqParams[i] = _redirectReqParams[i];
    }
    const _internal = JSON.parse(
      sessionStorage.getItem(randomPrefix + '__internal'),
    );
    for (const i in _internal) {
      internal[i] = _internal[i];
    }
    const _config = JSON.parse(sessionStorage.getItem(randomPrefix + '__config'));
    for (const i in _config) {
      config[i] = _config[i];
    }
  }

  /**
   * @description coming back from authServer.
   * step1: receive the code from queryparams
   * step2: send the code and code_verifier(from sessionStorage) and get token
   * step3:
   */
  async function completeAuth(cb) {
    loadAuthItemsFromStorage(); //things generated and saved (to sessionStorage) before going to authServer
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    const generatedState = redirectReqParams.state;
    if (!generatedState || !state || state != generatedState) {
      console.error(
        'Possible tampering, state does not match with generated state',
        state,
        generatedState,
      );
      return sendToAuthServerPage();
    }
    const tokenRequestBody = {
      code,
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      redirect_uri: redirectReqParams.redirect_uri,
      client_id: env.clientId,
    };
    if (env.extra) {
      addExtrasToObj(tokenRequestBody);
    }
    tokenRequestBody['code_verifier'] = internal['code_verifier'];
    const [err, tokenResponse]: [any, TokenResponse] = await until(
      fetch(config.token_endpoint, {
        method: 'POST',
        body: new URLSearchParams(tokenRequestBody).toString(),
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        mode: 'cors',
        credentials: 'omit',
      }).then(async (r) => {
        if (r.status !== 200) throw await r.json();
        return r.json();
      }),
    );
    if (err) {
      //todo: call sendToAuthServer()
      return console.error(err);
    }

    removeAuthItemsToStorage();

    // ... do something with token response
    (window as any).AUTH_STR = tokenResponse.access_token;
    localStorage.setItem('awl_token', tokenResponse.access_token);
    localStorage.setItem('id_token', tokenResponse.id_token);
    localStorage.setItem('refresh_token', tokenResponse.refresh_token);
    cb?.();
  }

  async function setUpTokenRefresh() {
    await getConfig();
    let tokenRefreshTimeout;
    continuouslyRefreshToken();

    function continuouslyRefreshToken() {
      const accessToken = localStorage.getItem('awl_token');
      if (!accessToken) return console.error('no access token', accessToken);
      const [, base64] = accessToken.split('.');
      const {exp} = JSON.parse(window.atob(base64));
      const msRemaining = (exp - 60) * 1000 - Date.now(); //60 seconds before timeout
      clearTimeout(tokenRefreshTimeout);
      if (msRemaining < 0) return;
      tokenRefreshTimeout = setTimeout(async () => {
        await refreshToken(config, {
          grant_type: GRANT_TYPE_REFRESH_TOKEN,
          client_id: env.clientId,
          refresh_token: localStorage.getItem('refresh_token'),
          scope: env.scope,
        });
        // eslint-disable-next-line no-console
        console.log('token refreshed');
        continuouslyRefreshToken();
      }, msRemaining);
      process.env.NODE_ENV == 'development' &&
        // eslint-disable-next-line no-console
        console.log('token refresh is set up at ', new Date((exp - 60) * 1000));
    }
  }

  function revokeToken() {
    if (!config.revocation_endpoint)
      return Promise.reject(
        new Error('endpoint url not found, ' + JSON.stringify(config)),
      );
    // return fetch(config.revocation_endpoint, {
    //   method:"DELETE",
    //   headers: {
    //     Authorization:
    //       'Bearer ' + (window as any).AUTH_STR ||
    //       localStorage.getItem('awl_token'),
    //   },
    // })
    //   .then((res) => res.json())
    //   .then((r) => {
    //     return r;
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     throw err;
    //   });//todo: not working
    return Promise.resolve(true);
  }

  return {
    getConfig,
    sendToAuthServerPage,
    hasRandomPrefix,
    completeAuth,
    setUpTokenRefresh,
    revokeToken
  };
}

async function refreshToken(config, body, cb?: () => void) {
  if (!config.token_endpoint)
    return console.error('no config endpoing', config, body);
  const [err, tokenResponse]: [any, TokenResponse] = await until(
    fetch(config.token_endpoint, {
      method: 'POST',
      body: new URLSearchParams(body).toString(),
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      mode: 'cors',
      credentials: 'omit',
    }).then(async (r) => {
      if (r.status !== 200) throw await r.json();
      return r.json();
    }),
  );
  if (err) {
    //todo: call sendToAuthServer()
    return console.error(err);
  }

  (window as any).AUTH_STR = tokenResponse.access_token;
  localStorage.setItem('awl_token', tokenResponse.access_token);
  localStorage.setItem('id_token', tokenResponse.id_token);
  localStorage.setItem('refresh_token', tokenResponse.refresh_token);
  cb?.();
}
