// src/mocks/handlers.js

import {rest} from 'msw';
import accounts from './responseData/accounts';
import cities from './responseData/cities';
import countries from './responseData/countries';
import editTaskData from './responseData/editTaskData';
import logActivityData from './responseData/logActivity';
import users from './responseData/users';
import regions from './responseData/regions';
import contacts from './responseData/contacts';
import contactsFilters from './responseData/contactsFilters';
import campaigns from './responseData/campaigns';
import childOpportunityDetails from './responseData/childOpportunityDetails';
import accountDetails from './responseData/accountDetails';
import accountList from './responseData/accountList';
import contactDocuments from './responseData/contactDocuments';
// import contactStatusList from './responseData/_contactStatusList';
import branches from './responseData/branches';
import assumptions from './responseData/assumptions';
import departments from './responseData/departments';
import contactStatus from './responseData/contactStatus';
import timezones from './responseData/timezones';
import currencyList from './responseData/currencyList';
import bulletin from './responseData/bulletin';
import favouriteProject from './responseData/favouriteProject';
import project from './responseData/project';
import projectTask from './responseData/projectTask';
import attributeAndComponents from './responseData/attributeAndComponents';
import studios from './responseData/studios';
import dashboardEvents from './responseData/dashboardEvents';
import markedEvents from './responseData/markedEvents';
import projectDetails from './responseData/projectDetails';
import usersLessData from './responseData/usersLessData';
import sessionTypes from './responseData/sessionTypes';
import talentList from './responseData/talentList';
import sessionStatus from './responseData/sessionStatus';
import usersAllDetails from './responseData/usersAllDetails';
import projectCategories from './responseData/projectCategories';
import projectList from './responseData/projectList';
import character from './responseData/character';
import suppliers from './responseData/suppliers';
import iamApplication from './responseData/iamApplication';
import iamRoleIds from './responseData/iamRoleIds';
import getEquipments from './responseData/getEquipments';
import priorityList from './responseData/priorityList';
import purchaseOrderData from './responseData/purchaseOrderData';
import quoteTypeList from './responseData/quoteTypeList';
import variableTypeList from './responseData/variableTypeList';
import variableNameList from './responseData/variableNameList';
import charaterTalentList from './responseData/charaterTalentList';
import talentFilterList from './responseData/talentFilterList';
import charaterStatusLits from './responseData/charaterStatusLits';
import quoteSetupList from './responseData/quoteSetupList';
import tierSetupList from './responseData/tierSetupList';
import equipmentList from './responseData/equipmentList';
import clientsData from './responseData/clientsData';
import opportunityLessData from './responseData/opportunityLessData';
import talentLessData from './responseData/talentLessData';
import allTalentList from './responseData/allTalentList';
import languages from './responseData/languages';
import clientList from './responseData/clientList';
import potentialProjects from './responseData/potentialProjects';
import buyoutHistoryList from './responseData/buyoutHistoryList';
import indivisualTalentData from './responseData/indivisualTalentData';

const Apis = {
  [accounts.endPoint]: accounts.response,
  // [accountList.endPoint]: accountList.response,
  [contacts.endPoint]: contacts.response,
  [cities.endPoint]: cities.response,
  [countries.endPoint]: countries.response,
  [editTaskData.endPoint]: editTaskData.response,
  [logActivityData.endPoint]: logActivityData.response,
  [users.endPoint]: users.response,
  [regions.endPoint]: regions.response,
  // [childOpportunityDetails.endPoint]: childOpportunityDetails.response,
  [accountDetails.endPoint]: accountDetails.response,
  [contactsFilters.endPoint]: contactsFilters.response,
  [campaigns.endPoint]: campaigns.response,
  [contactDocuments.endPoint]: contactDocuments.response,
  [branches.endPoint]: branches.response,
  [assumptions.endPoint]: assumptions.response,
  [departments.endPoint]: departments.response,
  [contactStatus.endPoint]: contactStatus.response,
  [timezones.endPoint]: timezones.response,
  [currencyList.endPoint]: currencyList.response,
  [attributeAndComponents.endPoint]: attributeAndComponents.response,
  // '*': {
  //   result: [],
  // },

  // side
  [studios.endPoint]: studios.response,
  [dashboardEvents.endPoint]: dashboardEvents.response,
  [markedEvents.endPoint]: markedEvents.response,
  [bulletin.endPoint]: bulletin.response,
  [favouriteProject.endPoint]: favouriteProject.response,
  [project.endPoint]: project.response,
  [projectTask.endPoint]: projectTask.response,
  [projectDetails.endPoint]: projectDetails.response,
  [usersLessData.endPoint]: usersLessData.response,
  [sessionTypes.endPoint]: sessionTypes.response,
  [talentList.endPoint]: talentList.response,
  // [sessionStatus.endPoint]: sessionStatus.response,
  // for users module
  [usersAllDetails.endPoint]: usersAllDetails.response,
  //for Project module
  [projectCategories.endPoint]: projectCategories.response,
  [projectList.endPoint]: projectList.response,
  [character.endPoint]: character.response,
  //for quotes module
  [suppliers.endPoint]: suppliers.response,
  //setupSession
  [iamApplication.endPoint]: iamApplication.response,
  [iamRoleIds.endPoint]: iamRoleIds.response,
  //setting
  [getEquipments.endPoint]: getEquipments.response,
  //poBook
  [purchaseOrderData.endPoint]: purchaseOrderData.response,
  [charaterTalentList.endPoint]: charaterTalentList.response,
  [talentFilterList.endPoint]: talentFilterList.response,
  [charaterStatusLits.endPoint]: charaterStatusLits.response,
  [quoteSetupList.endPoint]: quoteSetupList.response,
  [tierSetupList.endPoint]: tierSetupList.response,
  [equipmentList.endPoint]: equipmentList.response,
  [clientsData.endPoint]: clientsData.response,
  //Raise PO
  [talentLessData.endPoint]: talentLessData.response,
  [allTalentList.endPoint]: allTalentList.response,
  [languages.endPoint]: languages.response,
  [clientList.endPoint]: clientList.response,
  //potentential projects
  [potentialProjects.endPoint]: potentialProjects.response,
  //talent
  [buyoutHistoryList.endPoint]: buyoutHistoryList.response,
  [indivisualTalentData.endPoint]: indivisualTalentData.response,
};

//add constant category here
const contantCategoryApis = {
  [priorityList.endPoint]: priorityList.response,
  [sessionStatus.endPoint]: sessionStatus.response,
  [variableNameList.endPoint]: variableNameList.response,
  [variableTypeList.endPoint]: variableTypeList.response,
  [quoteTypeList.endPoint]: quoteTypeList.response,
  [opportunityLessData.endPoint]: opportunityLessData.response,
};

const getDynamicResponse = (category) => {
  const obj = {
    quoteType: quoteTypeList.response,
    LAVariableTypes: variableTypeList.response,
    LA: variableNameList.response,
    priority: priorityList.response,
    session_status: sessionStatus.response,
    opportunitylob: opportunityLessData.response,
  };
  return obj[category];
};

const post = {
  'https://gateway.ptw.com/dev/campaign/': {
    success: true,
    message: 'campaign saved',
  },
  'https://gateway.ptw.com/dev/campaign//opportunity/353/': {
    success: true,
    message: 'opportunity saved',
  },
  'https://gateway.ptw.com/dev/crm/crmcontacts/1764': {
    success: true,
    message: 'lead converted',
  },
  'https://gateway.ptw.com/dev/crm/crmcontacts/': {
    success: true,
    message: 'lead added',
  },
  'https://gateway.ptw.com/dev/crm/logactivity/': {
    success: true,
    message: 'log activity added',
  },
  'https://gateway.ptw.com/dev/side/projectTask/': {
    success: true,
    message: 'Project task added successfully',
  },
  'https://gateway.ptw.com/dev/side/favourite/:id/': {
    success: true,
    message: 'Project added to favourite successfully',
  },
  'https://gateway.ptw.com/dev/side/bulletin/': {
    success: true,
    message: 'Bulletin created successfully',
  },
};

const put = {
  'https://gateway.ptw.com/dev/crm/opportunity/:id/': {
    success: true,
    message: 'opportunity updated',
  },
  'https://gateway.ptw.com/dev/crm/logactivity/:id/': {
    success: true,
    message: 'logactivity updated',
  },
  'https://gateway.ptw.com/dev/side/users/:id/': {
    success: true,
    message: 'User Updated Successfully',
  },
  'https://gateway.ptw.com/dev/side/castList/:id/': {
    success: true,
    message: 'Castlisted talent updated successfully',
  },
};

const deleteMethods = {
  'https://gateway.ptw.com/dev/side/users/:id/': {
    success: true,
    message: 'User Deleted Successfully',
  },
  'https://gateway.ptw.com/dev/side/castList/:id/:id/': {
    success: true,
    message: 'Talent Deleted Successfully',
  },
};

export const handlers = [
  /* rest.get(groupDetails.endpoint, (req, res, ctx) => {
    const query = req.url.searchParams;
    let result = groupDetails.res;
    if (query.searchString) {
      result = result.filter(
        (g) =>
          query.searchString.toLowerCase().indexOf(g.name.toLowerCase()) > -1,
      );
    }
    return res(
      ctx.status(200),
      ctx.json({
        result,
        count: 2,
        next: null,
      }),
    );
  }), */

  ...Object.entries(Apis).map(([k, v]) => {
    // Handles a GET /user request
    return rest.get(k, (req, res, ctx) => {
      // req.url.href.includes("/status/") && console.log(req.url.href,v)
      const query = req.url.searchParams;
      return res(ctx.status(200), ctx.json(v));
    });
  }),

  ...Object.entries(contantCategoryApis).map(([k, v]) => {
    // Handles a GET /user request
    return rest.get(k, (req, res, ctx) => {
      // req.url.href.includes("/status/") && console.log(req.url.href,v)
      let contantCategory = req.url.searchParams.get('category');
      if (!contantCategory) {
        contantCategory = req.url.searchParams.get('lob');
        if (contantCategory) contantCategory = 'opportunitylob';
      }
      if (contantCategory)
        return res(
          ctx.status(200),
          ctx.json(getDynamicResponse(contantCategory)),
        );
      return res(ctx.status(200), ctx.json(v));
    });
  }),

  // Handles a POST /login request
  ...Object.entries(post).map(([k, v]) => {
    return rest.post(k, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(v));
    });
  }),
  // Handles a POST /login request
  ...Object.entries(put).map(([k, v]) => {
    return rest.put(k, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(v));
    });
  }),

  // Handles a Delete /user request
  ...Object.entries(deleteMethods).map(([k, v]) => {
    return rest.delete(k, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(v));
    });
  }),
];
