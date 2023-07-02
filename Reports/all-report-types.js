export const dateFieldList = [
  {
    name: 'Created Date',
    id: 'CreatedDate',
  },
];

export const defaultReportLits = [
  {name: 'Projects', value: 'projects', reportType: 'Projects'},
  {name: 'Sales Invoices', value: 'salesInVoice', reportType: 'Sales'},
  {name: 'POs', value: 'purchaseOrder', reportType: 'PO'},
  {name: 'Supplier Invoices', value: 'supplierInVoice', reportType: 'Supplier'},
  {name: 'WIP', value: 'wip', reportType: 'WIP'},
  {name: 'All PO Invoices', value: 'all', reportType: 'PoWiseInvoice'},
  {name: 'PO Invoices with D365', value: '1', reportType: 'PoWiseInvoice'},
  {name: 'PO Invoices without D365', value: '0', reportType: 'PoWiseInvoice'},
  {name: 'Studio Occupancy', value: 'studioOccupancyReport', reportType: 'studioOccupancyReport'},
];

export const filterFieldTypes = {
  Alphanumeric: ['Equals', 'Not equals', 'Contains', 'Not contains'],
  'Date Field': [
    'Equals',
    'Not equals',
    'Less than',
    'Greater than',
    'Between',
  ],
  Numeric: ['Equals', 'Not equals', 'Less than', 'Greater than', 'Between'],
  Text: ['Contains', 'Not contains'],
  'Drop down': ['Equals', 'Not equals'],
};

export const yesNoList = [
  {label: 'True', value: 'true'},
  {label: 'False', value: 'false'},
];

export const financeReportsList = [
  {
    id: 'completedProjectsYearwise',
    name: 'Margin - Completed projects',
    content:
      'Margin required for all completed projects, if possible, year-wise',
  },
  {
    id: 'InProgressProjects',
    name: 'Revenue for a particular month - Projects in Progress',
    content: 'Revenue for a particular month - Projects in Progress',
  },
  {
    id: 'DifferentStatusProjects',
    name: 'Revenue and cost for particular month',
    content: 'Revenue and cost for particular month',
  },
  {
    id: 'InCompleteProjects',
    name: 'Comparison of Budgeted Margin and Actual Margin - Incomplete projects',
    content:
      'Comparison of Budgeted Margin and Actual Margin - Incomplete projects',
  },
  {
    id: 'PurchaseOrderWiseProjects',
    name: 'Cost for projects, PO wise',
    content:
      "Report showing PO wise cost of projects showing cost in the transaction currency as well as the entity's currency",
  },
  // {
  //   id: 'billingReconciliation',
  //   name: 'Billing reconciliation',
  //   content:
  //     'Reconciliation of invoices raised for a particular month in Administer and Axapta',
  // },
  // {
  //   id: 'costReconciliation',
  //   name: 'Cost reconciliation',
  //   content:
  //     'Reconciliation of cost booked for a particular month in Administer and Axapta',
  // },
];

export const supplierInvoicesList = [
  {name: 'All PO Invoices', id: 'all'},
  {name: 'PO Invoices with D365', id: '1'},
  {name: 'PO Invoices without D365', id: '0'},
];
