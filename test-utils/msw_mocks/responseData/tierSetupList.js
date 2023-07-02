export default {
  response: {
    count: 3,
    next: null,
    previous: null,
    result: [
      {
        currencyId: 1,
        buyOut: 30,
        id: 4,
        name: 'Custom Tier',
        units: 'Session',
        fee: 20,
        currency: {
          id: 1,
          name: 'Indian Rupee',
        },
      },
      {
        currencyId: 1,
        buyOut: 600.15,
        id: 3,
        name: 'Tier1',
        units: 'Hourly',
        fee: 500,
        currency: {
          id: 1,
          name: 'Indian Rupee',
        },
      },
      {
        currencyId: 1,
        buyOut: 300,
        id: 2,
        name: 'Tier2',
        units: 'Hourly',
        fee: 200,
        currency: {
          id: 1,
          name: 'Indian Rupee',
        },
      },
    ],
  },
  endPoint: 'https://gateway.ptw.com/dev/side/tierSetup/',
};
