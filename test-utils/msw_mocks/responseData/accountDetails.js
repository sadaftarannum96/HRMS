export default {
  response: {
    count: 1,
    next: null,
    previous: null,
    result: [
      {
        createdOn: '2022-02-16T09:31:52',
        updatedOn: '2022-02-16T09:31:52',
        isActive: true,
        createdBy: 21,
        employeeCount: null,
        cityId: 52,
        countryId: 35,
        isApproved: true,
        parentCompanyId: null,
        phoneNumber: '9483483923',
        isStrategic: false,
        id: 445,
        name: 'Tata Power',
        website: null,
        pincode: null,
        address1: null,
        address2: null,
        address3: null,
        finance: null,
        parentComapnyName: null,
        createdByName: 'Jaya Surya',
        leadSourceGroup: null,
        conversionNote: null,
        currency: {
          id: 138,
          name: 'Venezuela Bolivar Fuerte',
        },
        annualRevenue: null,
        marketType: {
          id: 11,
          name: 'Games',
        },
        city: {
          id: 52,
          name: 'PTW Japan',
        },
        country: {
          id: 35,
          name: 'Japan',
        },
        industry: {
          id: 9,
          name: 'Entertainment',
        },
        clientType: {
          id: 289,
          name: 'Self-Publishing Developer',
        },
        owners: [
          {
            userId: 120003122,
            name: 'mithun mi',
            regions: [
              {
                id: 7,
                name: 'LATAM',
              },
            ],
            departments: [
              {
                id: 290,
                name: 'Player Support',
                code: 'PLRS',
              },
            ],
          },
          {
            userId: 6,
            name: 'Vamshi Aditya',
            regions: [
              {
                id: 9,
                name: 'APAC',
              },
            ],
            departments: [
              {
                id: 295,
                name: 'Localization',
                code: 'LOC',
              },
            ],
          },
        ],
        billingEntities: null,
        services: null,
      },
    ],
    message: 'Record found successfully',
    id: null,
    statusCode: 200,
  },
  endPoint: 'https://gateway.ptw.com/dev/crm/crmcompany/:id', //?isMyLead=false&isParent=true
};
