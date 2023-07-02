import {useState, useEffect, useContext, Suspense} from 'react';
import './App.css';
import './styles/side-custom.css';
import './styles/global.css';
import './styles/custom-radio.css';
import Settings from './Settings';
import Talent from './Talent/talentSearch';
import AddTalent from './Talent/talentSearch/addTalent';
import ProjectTabs from './projects/projectTabs';
import ViewCalandar from './projects/projectTabs/auditions/viewCalendar';
import ViewCalendarSession from './projects/projectTabs/session/viewCalendar';
import Notes from './projects/projectTabs/auditions/notes';
import SessionNotes from './projects/projectTabs/session/notes';
import SetupAudition from './projects/projectTabs/auditions/setupAudition';
import SetupSessions from './projects/projectTabs/session/setupSessions';
import Projects from './projects/index';
import Compare from './Talent/compare';
import Quotes from './Finance/Quotes';
import QuoteClassic from './Finance/Quotes/quotes/quoteClassic/quoteClassic';
import QuoteTier from './Finance/Quotes/quotes/quoteTier/quoteTier';
import QuoteLoc from './Finance/Quotes/quotes/quoteLoc/quoteLoc';
import QuoteLa from './Finance/Quotes/quotes/quoteLa/quoteLa';
// import ViewAddQuote from './Finance/Quotes/quotes/viewAddQuote';
import ViewAddQuoteNew from './Finance/Quotes/quotes/viewQuotes/viewAddQuoteNew';
import PoBook from './Finance/PoBook';
import Suppliers from './Finance/Suppliers';
import Users from './Users/index';
import {AuthContextProvider, AuthContext} from './contexts/auth.context';
import {ScrollToTop} from './components/ScrollToTop';
import SideMenuNew from './components/SideMenu-new';
import LoginError from './components/login-error';
import {QueryClient, QueryClientProvider} from 'react-query';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import {DataContextProvider} from './contexts/data.context';
import {Loading} from './components/LoadingComponents/loading';
import {RestfulProvider} from 'restful-react';
import {Toast} from 'erp-react-components';
import {library} from '@fortawesome/fontawesome-svg-core';
import {
  faAngleDown,
  faAngleRight,
  faAngleUp,
  faPlus,
  faStar,
  faStarHalf,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import Clients from './clients/index';
import Dashboard from './Dashboard/index';
import Reports from './Reports/reports';
import CreateReport from './Reports/createReport/createReport';
import CustomReport from './Reports/customReport/customReport';
import DefaultReport from './Reports/defaultReport/defaultReports';
import FinanceReport from './Reports/financeReport/financeReports';
import {ErrorBoundary} from 'react-error-boundary';
import Calendar from './calendar';
import {setComponentsTheme} from 'erp-react-components';
import ERPCommandPalette from './ERPCommandPalette';
import EditCustomPdfQuote from './Finance/Quotes/quotes/editCustom-pdf-quote';

library.add(
  faAngleRight,
  faTimes,
  faAngleUp,
  faAngleDown,
  faStar,
  faStarHalf,
  faPlus,
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
      cacheTime: 5 * 60000,
    },
  },
});

function App() {
  return (
    <RestfulProvider>
      <Suspense
        fallback={
          <div style={{width: '100%', height: '100vh'}}>
            <Loading />
          </div>
        }
      >
        <AuthContextProvider>
        <QueryClientProvider client={queryClient}>
          <Home />
          </QueryClientProvider>
        </AuthContextProvider>
        <Toast />
      </Suspense>
    </RestfulProvider>
  );
}

const Home = (props) => {
  // const [initialized, setInitialized] = useState(false);

  const authContext = useContext(AuthContext);

  // useEffect(() => {
  //   if (!initialized) {
  //     setInitialized(true);
  //   }
  // }, []);
  useEffect(() => {
    setComponentsTheme({
      primaryColor: '145, 207, 0',
      primaryColorLight: '145, 207, 0',
    });
  }, []);
  useEffect(() => {
    if (authContext.isLoggedIn !== null) {
      //remove loader overlay
      // const overlay = document.getElementById('initial-loading-overlay');
      // overlay && document.body.removeChild(overlay);
    }
  }, [authContext.isLoggedIn]);

  // const handleLogout = async () => {
  //   localStorage.clear();
  //   window.location = `${process.env.REACT_APP_OPServer}/oxauth/restv1/end_session?post_logout_redirect_uri=${process.env.REACT_APP_redirectURL}`;
  // };

  if (authContext.loginError) {
    document.getElementById('initial-loading-overlay') &&
    document.body.removeChild(
      document.getElementById('initial-loading-overlay'),
    );
    return (
      <LoginError
      message={authContext.loginError}
      onTryAgain={authContext.handleLogout}
    />
      // <LoginError message={authContext.loginError} onTryAgain={handleLogout} />
    );
  }

  if (authContext.isLoggedIn !== true) {
    return (
      <div style={{width: '100%', height: '100vh'}}>
        <Loading />
      </div>
    );
  }
  if (authContext.isLoggedIn) {
    //remove loader overlay
    document.getElementById('initial-loading-overlay') &&
      document.body.removeChild(
        document.getElementById('initial-loading-overlay'),
      );
  } else {
    return <></>;
  }
  return <Main />;
};

const Main = () => {
  const {permissions} = useContext(AuthContext);
  // console.log(permissions, '---->')
  const ROUTES = [
    {
      component: Dashboard,
      path: '/dashboard',
      hasAccess: true,
      label: 'Dashboard',
      keywords: 'events, todo list',
    },
    {
      component: Settings,
      path: '/settings',
      hasAccess: permissions['Settings']?.isView,
      label: 'Settings',
      keywords:
        'settings, bulletin, equipment, studios, currency, quote setup, tier setup',
    },
    {
      component: Talent,
      path: '/talent/talentSearch',
      hasAccess: permissions['Talent']?.isView,
      label: 'Talent Search',
      keywords: 'talent search',
    },
    {
      component: AddTalent,
      path: '/talent/talentSearch/editTalent/:talentId',
      hasAccess: permissions['Talent']?.['Talent Data']?.isView,
      label: 'Add Talent',
      keywords: 'talent search',
    },
    {
      component: AddTalent,
      path: '/talent/talentSearch/addTalent',
      hasAccess: permissions['Talent']?.['Talent Data']?.isView,
      label: 'Add Talent',
      keywords: 'talent search',
    },
    {
      component: Compare,
      path: '/talent/compare',
      hasAccess: permissions['Talent']?.['Talent Data']?.isView,
      label: 'Talent Compare',
      keywords: 'Talent Compare',
    },
    {
      component: Projects,
      path: '/projects',
      hasAccess: permissions['Projects']?.isView,
      label: 'Projects',
      keywords: 'projects',
    },
    {
      component: ProjectTabs,
      path: '/projects/projectDetails/:projectId',
      hasAccess: permissions['Projects']?.['Project Details']?.isView,
      label: 'Projects',
      keywords: 'projects',
    },
    {
      component: ViewCalandar,
      path: '/projects/projectTabs/viewCalendar/:projectId/:auditionId/:milestoneId/:characterIds',
      hasAccess: true,
      label: 'Calendar',
      keywords: 'calendar',
    },
    {
      component: ViewCalendarSession,
      path: '/projects/projectTabs/session/viewCalendar/:projectId/:sessionId/:milestoneId',
      hasAccess: true,
      label: 'Calendar',
      keywords: 'calendar',
    },
    {
      component: ViewCalendarSession,
      path: '/projects/projectTabs/session/viewCalendar/:projectId/:sessionId/:milestoneId/:characterIds/:talentIds',
      hasAccess: true,
      label: 'Calendar',
      keywords: 'calendar',
    },
    {
      component: Notes,
      path: '/projects/projectTabs/auditions/notes/:projectId/:auditionId/:milestoneId',
      hasAccess: true,
      label: 'Audition Notes',
      keywords: 'project, audition, notes',
    },
    {
      component: SessionNotes,
      path: '/projects/projectTabs/session/notes/:projectId/:sessionId/:milestoneId',
      hasAccess: true,
      label: 'Session Notes',
      keywords: 'project, session, notes',
    },
    {
      component: SetupAudition,
      path: '/projects/projectTabs/auditions/setupAudition/:projectId/:milestoneId',
      hasAccess: true,
      label: 'Setup Audition',
      keywords: 'project, audition, setup audition',
    },
    {
      component: SetupSessions,
      path: '/projects/projectTabs/session/setupSessions/:projectId/:milestoneId',
      hasAccess: true,
      label: 'Setup Session',
      keywords: 'project, session, setup session',
    },
    {
      component: Users,
      path: '/users',
      hasAccess: permissions['Users']?.isView,
      label: 'Users',
      keywords: 'users',
    },
    {
      component: Clients,
      path: '/clients',
      hasAccess: permissions['Client']?.isView,
      label: 'Clients',
      keywords: 'clients',
    },
    {
      component: Suppliers,
      path: '/finance/suppliers',
      hasAccess: permissions['Finance']?.['Suppliers']?.isView,
      label: 'Suppliers',
      keywords: 'finance, suppliers',
    },
    {
      component: PoBook,
      path: '/finance/poBook',
      hasAccess: permissions['Finance']?.['PO Book']?.isView,
      label: 'PO Book',
      keywords: 'finance, suppliers',
    },
    {
      component: ViewAddQuoteNew,
      path: '/finance/quotes/viewAddQuote/:quoteId',
      // component: ViewAddQuoteNew,
      // path: '/finance/quotes/viewQuotes/viewAddQuoteNew/:quoteId',
      hasAccess: permissions['Finance']?.['Quotes']?.isView,
      label: 'Add Quote',
      keywords: 'finance, quotes, add quote',
    },
    {
      component: QuoteClassic,
      path: '/finance/quotes/quoteClassic',
      hasAccess: permissions['Finance']?.['Quotes']?.isView,
      label: 'Quote Classic',
      keywords: 'finance, quotes, quote classic',
    },
    {
      component: QuoteTier,
      path: '/finance/quotes/quoteTier',
      hasAccess: permissions['Finance']?.['Quotes']?.isView,
      label: 'Quote Tier',
      keywords: 'finance, quotes, quote tier',
    },
    {
      component: QuoteLoc,
      path: '/finance/quotes/quoteLoc',
      hasAccess: permissions['Finance']?.['Quotes']?.isView,
      label: 'Quote LOC',
      keywords: 'finance, quotes, quote loc',
    },
    {
      component: QuoteLa,
      path: '/finance/quotes/quoteLa',
      hasAccess: permissions['Finance']?.['Quotes']?.isView,
      label: 'Quote LA',
      keywords: 'finance, quotes, quote la',
    },
    {
      component: Quotes,
      path: '/finance/quotes',
      hasAccess: permissions['Finance']?.['Quotes']?.isView,
      label: 'Quotes',
      keywords: 'finance, quotes',
    },
    {
      component: Calendar,
      path: '/calendar',
      hasAccess:
        permissions['Calendar']?.isView &&
        (permissions['Calendar']?.['All Calendar']?.isView ||
          permissions['Calendar']?.['Own Calendar']?.isView),
      label: 'Calendar',
      keywords: 'calendar, all calendar, own calendar',
    },
    {
      component: EditCustomPdfQuote,
      path: '/finance/quotes/editCustom-pdf-quote',
      hasAccess: permissions['Finance']?.['Quotes']?.isView,
      label: 'Edit CUstom Pdf',
      keywords: 'finance, quotes, Edit CUstom Pdf',
    },
    {
      component: Reports,
      path: '/reports',
      hasAccess: permissions['Reports']?.isView,
      label: 'Reports',
      keywords: 'reports',
    },
    {
      component: CreateReport,
      path: '/reports/createReport',
      hasAccess: permissions['Reports']?.['Reports']?.isAdd,
      label: 'Create Report',
      keywords: 'reports, create report',
    },
    {
      component: CreateReport,
      path: '/reports/editReport/:id',
      hasAccess: permissions['Reports']?.['Reports']?.isEdit,
      label: 'Create Report',
      keywords: 'reports, create report',
    },
    {
      component: CustomReport,
      path: '/reports/customReport/:id',
      hasAccess: permissions['Reports']?.['Reports']?.isEdit,
      label: 'Custom Report',
      keywords: 'reports, custom report',
    },
    {
      component: DefaultReport,
      path: '/reports/defaultReport/:report',
      hasAccess: permissions['Reports']?.['Reports']?.isView,
      label: 'Default Report',
      keywords: 'reports, default report',
    },
    {
      component: DefaultReport,
      path: '/report/finance/PurchaseOrderInvoices/:report',
      hasAccess: permissions['Reports']?.['Reports']?.isView,
      label: 'Default Report',
      keywords: 'reports, default report',
    },
    {
      component: FinanceReport,
      path: '/reports/financeReport/:report',
      hasAccess: permissions['Reports']?.['Reports']?.isView,
      label: 'Finance Report',
      keywords: 'reports, finance report',
    },
  ];
  const routes = ROUTES.filter((r) => r.hasAccess);

  return (
    <DataContextProvider>
      <div className="App">
        <div className="main">
          <Router>
            <ScrollToTop />
            <ERPCommandPalette />
            <ErrorBoundary
              FallbackComponent={({error, resetErrorBoundary}) => (
                <div
                  style={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <h4>An Error Occured while performing the last action.</h4>
                  <br />
                  <button
                    onClick={() => window.location.reload()}
                    className="btn btn-primary"
                  >
                    Try again
                  </button>
                </div>
              )}
              onError={(error, info) => {
                //call api
                console.log('error boundary', error, info);
              }}
              onReset={() => {
                console.log('reset triggered');
              }}
            >
              <SideMenuNew />
              <div className="main-content">
                <Switch>
                  <Route path={'/'} exact>
                    <Redirect
                      to={
                        routes.length > 0
                          ? routes[0].path || {}
                          : '/noPermissions'
                      }
                    />
                  </Route>
                  {routes.map((r) => {
                    return (
                      <Route
                        key={r.path}
                        path={r.path}
                        exact
                        component={r.component}
                      />
                    );
                  })}
                  <Route path={'/*'}>
                    <Redirect
                      to={
                        routes.length > 0 ? routes[0] || {} : '/noPermissions'
                      }
                    />
                  </Route>

                  <Suspense
                    fallback={
                      <div
                        style={{
                          width: '100%',
                          height: '100vh',
                          background: '#fff',
                        }}
                      >
                        <Loading />
                      </div>
                    }
                  ></Suspense>
                </Switch>
              </div>
            </ErrorBoundary>
          </Router>
        </div>
      </div>
    </DataContextProvider>
  );
};

export default App;
