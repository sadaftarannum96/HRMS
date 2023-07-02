/*eslint no-console:"warn" */
import {
  TokenRequest,
  BaseTokenRequestHandler,
  GRANT_TYPE_AUTHORIZATION_CODE,
  AuthorizationServiceConfiguration,
  RedirectRequestHandler,
  AuthorizationNotifier,
  FetchRequestor,
  LocalStorageBackend,
  AuthorizationRequest,
  DefaultCrypto,
  StringMap,
  GRANT_TYPE_REFRESH_TOKEN,
  TokenResponse,
} from '@openid/appauth';
// import {BasicQueryStringUtils} from '@openid/appauth';
import {NoHashQueryStringUtils} from './noHashQueryStringUtils';
import {randomNumberString} from 'helpers/helpers';

const dev = {
  clientId: process.env.REACT_APP_clientId,
  OPServer: process.env.REACT_APP_OPServer,
  GatewayServer: process.env.REACT_APP_GatewayServer,
  redirectURL: process.env.REACT_APP_redirectURL,
  scope: process.env.REACT_APP_scope,
  userInfoEndpoint: process.env.REACT_APP_userInfoEndpoint,
  extra: process.env.REACT_APP_extra,
};

const prod = dev;

const environment = process.env.REACT_APP_STAGE === 'production' ? prod : dev;

interface ERPAuth {
  showMessage: (message: string) => void;
}

export class Authorization implements ERPAuth {
  constructor({showMessage, notifier, authorizationHandler, authRequest}) {
    this.showMessage = showMessage;
    this.notifier = notifier;
    this.authorizationHandler = authorizationHandler;
    this.authRequest = authRequest;
  }
  showMessage(msg: string) {
    console.log(msg);
  }
  configuration: AuthorizationServiceConfiguration;
  notifier: AuthorizationNotifier;
  authorizationHandler: RedirectRequestHandler;
  code: string;
  tokenHandler: BaseTokenRequestHandler;
  authRequest: AuthorizationRequest;
  tokenResponse: TokenResponse;
  request: any;

  async getConfiguration(): Promise<void> {
    await AuthorizationServiceConfiguration.fetchFromIssuer(
      environment.OPServer,
      new FetchRequestor(),
    )
      .then((response) => {
        console.log('Fetched service configuration', response);
        this.configuration = response;
        this.showMessage('Completed fetching configuration');
      })
      .catch((error) => {
        console.log('Something bad happened', error);
        this.showMessage(`Something bad happened ${error}`);
      });
  }

  makeAuth(code: string): void {
    // uses a redirect flow
    // set notifier to deliver responses
    this.authorizationHandler.setAuthorizationNotifier(this.notifier);
    // set a listener to listen for authorization responses
    this.notifier.setAuthorizationListener(async (request, response, error) => {
      if (error) return console.error(error);
      this.request = request;
      console.log('Authorization request complete ', request, response, error);
      if (response) {
        this.code = response.code;
        this.showMessage(`Authorization Code ${response.code}`);
        if (this.code) this.tokenRequest();
        else {
          // create a request
          // make the authorization request
        }
      }
    });
    if (code)
      this.authorizationHandler.completeAuthorizationRequestIfPossible();
    else
      this.authorizationHandler.performAuthorizationRequest(
        this.configuration,
        this.authRequest,
      );
  }
  tokenRequest(): void {
    this.tokenHandler = new BaseTokenRequestHandler(new FetchRequestor());

    let request: TokenRequest | null = null;
    let isRefreshTokenRequest = false;
    // debugger;

    if (this.code) {
      let extras: StringMap | undefined = undefined;
      if (this.request && this.request.internal) {
        extras = {};
        extras['code_verifier'] = this.request.internal['code_verifier'];
      }
      // use the code to make the token request.
      request = new TokenRequest({
        client_id: environment.clientId,
        redirect_uri: environment.redirectURL,
        grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
        code: this.code,
        refresh_token: undefined,
        extras: extras,
      });
    } else if (this.tokenResponse) {
      isRefreshTokenRequest = true;
      // use the token response to make a request for an access token
      request = new TokenRequest({
        client_id: environment.clientId,
        redirect_uri: environment.redirectURL,
        grant_type: GRANT_TYPE_REFRESH_TOKEN,
        code: undefined,
        refresh_token: this.tokenResponse.refreshToken,
        extras: undefined,
      });
    }

    this.tokenHandler
      .performTokenRequest(this.configuration, request)
      .then((response) => {
        console.log(response, 'response--------->');
        if (!this.tokenResponse) this.tokenResponse = response;
        // ... do something with token response
        (window as any).AUTH_STR = response.accessToken;
        localStorage.setItem('awl_token', response.accessToken);
        localStorage.setItem('id_token', response.idToken);
        // localStorage.setItem('refresh_token', response.refreshToken);
        // if(!response.refreshToken) //todo:call api to nginx error log
        localStorage.setItem(
          'userDetails',
          getUserDetailsFromToken(response.accessToken),
        ); //todo: temporary, until gateway server works
        // window.location.reload();
        const returnUrl = localStorage.getItem('return-url');
        localStorage.removeItem('return-url');
        window.location.href = returnUrl || '/';
      });
  }
}
//   loadTokenResponseFromLocalStorage(): void {
//     //since we are reloading page after initial auth...
//     this.tokenResponse = JSON.parse(
//       localStorage.getItem('tokenResponse') || null,
//     );
//   }
//   async setUpForFirstTokenRefresh(): Promise<void> {
//     if (!this.configuration) await this.getConfiguration();
//     this.loadTokenResponseFromLocalStorage(); //this will populate this.tokenresponse
//     this.setupForNextTokenRefresh();
//   }
//   setupForNextTokenRefresh(): void {
//     if (!this.tokenResponse) {
//       console.error('no token response', this);
//       return;
//     }
//     const elapsedTime = Date.now() - this.tokenResponse.issuedAt * 1000;
//     const expiry = this.tokenResponse.expiresIn * 1000 - elapsedTime - 10000; //call for refresh few seconds early
//     if (expiry < 10000)
//       return console.error(
//         'why is this happening?',
//         expiry,
//         this.tokenResponse,
//       );
//     clearTimeout(this.tokenRefreshTimeout);
//     this.tokenRefreshTimeout = setTimeout(() => {
//       // console.log(expiry);
//       this.tokenRequest(); //subsequent calls for refresh token
//     }, expiry);
//   }
// }

// export class NoHashQueryStringUtils extends BasicQueryStringUtils {
//   parse(input, useHash) {
//     return super.parse(input, false /* never use hash */);
//   }
// }

export const ERPAuthorization = new Authorization({
  showMessage: console.log,
  authorizationHandler: new RedirectRequestHandler(
    new LocalStorageBackend(),
    new NoHashQueryStringUtils(),
    window.location,
    new DefaultCrypto(),
  ),
  notifier: new AuthorizationNotifier(),
  authRequest: new AuthorizationRequest({
    client_id: environment.clientId,
    redirect_uri: environment.redirectURL,
    scope: environment.scope,
    response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
    state: undefined,
    extras: environment.extra
      ? {
          ...JSON.parse(environment.extra),
          nonce: randomNumberString(10),
        }
      : {},
  }),
});

function getUserDetailsFromToken(token) {
  if (!token) return '{}';
  const data = JSON.parse(atob(token.split('.')[1]));
  return JSON.stringify({emailId: data.user_id});
}