import {useContext} from 'react';
import {CommandPalette} from 'erp-react-components';
import {useHistory} from 'react-router-dom';
import {AuthContext} from './contexts/auth.context';

export default function ERPCommandPalette() {
  const {permissions} = useContext(AuthContext);
  const history = useHistory();
  const onSelect = (url) => {
    history.push(url);
  };

  const ROUTES = [
    {
      path: '/dashboard',
      hasAccess: true,
      label: 'Dashboard',
      keywords: 'events, todo list',
    },
    {
      path: '/settings',
      hasAccess: permissions['Settings']?.isView,
      label: 'Settings',
      keywords:
        'settings, bulletin, equipment, studios, currency, quote setup, tier setup',
    },
    {
      path: '/talent/talentSearch',
      hasAccess: permissions['Talent']?.isView,
      label: 'Talent Search',
      keywords: 'talent search',
    },
    {
      path: '/talent/talentSearch/editTalent/:talentId',
      hasAccess: permissions['Talent']?.['Talent Data']?.isView,
      label: 'Add Talent',
      keywords: 'talent search',
    },
    {
      path: '/talent/talentSearch/addTalent',
      hasAccess: permissions['Talent']?.['Talent Data']?.isView,
      label: 'Add Talent',
      keywords: 'talent search',
    },
    {
      path: '/talent/compare',
      hasAccess: permissions['Talent']?.['Talent Data']?.isView,
      label: 'Talent Compare',
      keywords: 'Talent Compare',
    },
    {
      path: '/projects',
      hasAccess: permissions['Projects']?.isView,
      label: 'Projects',
      keywords: 'projects',
    },
    {
      path: '/projects/projectDetails/:projectId',
      hasAccess: permissions['Projects']?.['Project Details']?.isView,
      label: 'Projects',
      keywords: 'projects',
    },
    {
      path: '/projects/projectTabs/viewCalendar/:projectId/:auditionId/:milestoneId/:characterIds',
      hasAccess: true,
      label: 'Calendar',
      keywords: 'calendar',
    },
    {
      path: '/projects/projectTabs/session/viewCalendar/:projectId/:sessionId/:milestoneId/:characterIds/:talentIds',
      hasAccess: true,
      label: 'Calendar',
      keywords: 'calendar',
    },
    {
      path: '/projects/projectTabs/auditions/notes/:projectId/:auditionId/:milestoneId',
      hasAccess: true,
      label: 'Audition Notes',
      keywords: 'project, audition, notes',
    },
    {
      path: '/projects/projectTabs/session/notes/:projectId/:sessionId/:milestoneId',
      hasAccess: true,
      label: 'Session Notes',
      keywords: 'project, session, notes',
    },
    {
      path: '/projects/projectTabs/auditions/setupAudition/:projectId/:milestoneId',
      hasAccess: true,
      label: 'Setup Audition',
      keywords: 'project, audition, setup audition',
    },
    {
      path: '/projects/projectTabs/session/setupSessions/:projectId/:milestoneId',
      hasAccess: true,
      label: 'Setup Session',
      keywords: 'project, session, setup session',
    },
    {
      path: '/users',
      hasAccess: permissions['Users']?.isView,
      label: 'Users',
      keywords: 'users',
    },
    {
      path: '/clients',
      hasAccess: permissions['Client']?.isView,
      label: 'Clients',
      keywords: 'clients',
    },
    {
      path: '/finance/suppliers',
      hasAccess: permissions['Finance']?.['Suppliers']?.isView,
      label: 'Suppliers',
      keywords: 'finance, suppliers',
    },
    {
      path: '/finance/poBook',
      hasAccess: permissions['Finance']?.['PO Book']?.isView,
      label: 'PO Book',
      keywords: 'finance, suppliers',
    },
    {
      path: '/finance/quotes/viewAddQuote/:quoteId',
      // path: '/finance/quotes/viewQuotes/viewAddQuoteNew/:quoteId',
      hasAccess: permissions['Finance']?.['Quotes']?.isView,
      label: 'Add Quote',
      keywords: 'finance, quotes, add quote',
    },
    {
      path: '/finance/quotes/quoteClassic',
      hasAccess: permissions['Finance']?.['Quotes']?.isView,
      label: 'Quote Classic',
      keywords: 'finance, quotes, quote classic',
    },
    {
      path: '/finance/quotes/quoteTier',
      hasAccess: permissions['Finance']?.['Quotes']?.isView,
      label: 'Quote Tier',
      keywords: 'finance, quotes, quote tier',
    },
    {
      path: '/finance/quotes/quoteLoc',
      hasAccess: permissions['Finance']?.['Quotes']?.isView,
      label: 'Quote LOC',
      keywords: 'finance, quotes, quote loc',
    },
    {
      path: '/finance/quotes/quoteLa',
      hasAccess: permissions['Finance']?.['Quotes']?.isView,
      label: 'Quote LA',
      keywords: 'finance, quotes, quote la',
    },
    {
      path: '/finance/quotes',
      hasAccess: permissions['Finance']?.['Quotes']?.isView,
      label: 'Quotes',
      keywords: 'finance, quotes',
    },
    {
      path: '/calendar',
      hasAccess:
        permissions['Calendar']?.isView &&
        (permissions['Calendar']?.['All Calendar']?.isView ||
          permissions['Calendar']?.['Own Calendar']?.isView),
      label: 'Calendar',
      keywords: 'calendar, all calendar, own calendar',
    },
    {
      path: '/reports',
      hasAccess: permissions['Reports']?.isView,
      label: 'Reports',
      keywords: 'reports',
    },
    {
      path: '/reports/createReport',
      hasAccess: permissions['Reports']?.['Reports']?.isAdd,
      label: 'Create Report',
      keywords: 'reports, create report',
    },
    {
      path: '/reports/editReport/:id',
      hasAccess: permissions['Reports']?.['Reports']?.isEdit,
      label: 'Create Report',
      keywords: 'reports, create report',
    },
    {
      path: '/reports/customReport/:id',
      hasAccess: permissions['Reports']?.['Reports']?.isEdit,
      label: 'Custom Report',
      keywords: 'reports, custom report',
    },
    {
      path: '/reports/defaultReport/:report',
      hasAccess: permissions['Reports']?.['Reports']?.isView,
      label: 'Default Report',
      keywords: 'reports, default report',
    },
    {
      path: '/reports/financeReport/:report',
      hasAccess: permissions['Reports']?.['Reports']?.isView,
      label: 'Finance Report',
      keywords: 'reports, finance report',
    },
 ];

  const UMSFilteredList = ROUTES.filter((eachRoute) => {
    const isColonExists = (eachRoute.path || '').includes(':');
    return !isColonExists;
  });
  const UMSUrlList = UMSFilteredList.map((eachRoute) => {
    return {
      url: eachRoute.path,
      label: eachRoute.label,
      keywords: eachRoute.keywords,
      onClick: () => onSelect(eachRoute.path),
    };
  });
  const commands = [
    {
      command: '/filter',
      label: 'Filter by given options',
      filterTabs: [],
    },
    {
      command: '/find',
      label: 'Search the page',
      filterTabs: [],
    },
  ];
  return <CommandPalette list={UMSUrlList} commands={commands} />;
}
