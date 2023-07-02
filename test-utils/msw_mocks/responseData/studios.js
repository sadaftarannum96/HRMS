export default {
  response: {
    count: 5,
    next: null,
    previous: null,
    result: [
      {
        id: 5,
        name: 'WPP',
        rooms: [
          {
            id: 6,
            name: 'Wpp Room1',
            costPerHour: 6,
            currencyId: 1,
          },
        ],
        equipments: [
          {
            id: 6,
            name: 'Mouse',
            equipmentCount: 200,
            available: null,
            inUse: null,
          },
        ],
      },
      {
        id: 4,
        name: 'Cafe Ole',
        rooms: [
          {
            id: 5,
            name: 'Cafe Ole Room1',
            costPerHour: 6,
            currencyId: 1,
          },
        ],
        equipments: [],
      },
      {
        id: 3,
        name: 'Lola MX',
        rooms: [
          {
            id: 4,
            name: 'Lola Room1',
            costPerHour: 6,
            currencyId: 1,
          },
        ],
        equipments: [],
      },
      {
        id: 2,
        name: 'Jarpa',
        rooms: [
          {
            id: 3,
            name: 'Jarpa1',
            costPerHour: 6,
            currencyId: 1,
          },
        ],
        equipments: [],
      },
      {
        id: 1,
        name: 'Studio Bangalore',
        rooms: [
          {
            id: 1,
            name: 'Bangalore1',
            costPerHour: 6,
            currencyId: 1,
          },
          {
            id: 2,
            name: 'Bangalore2',
            costPerHour: 6,
            currencyId: 1,
          },
        ],
        equipments: [
          {
            id: 5,
            name: 'Tv',
            equipmentCount: 200,
            available: null,
            inUse: null,
          },
          {
            id: 4,
            name: 'Cables',
            equipmentCount: 600,
            available: null,
            inUse: null,
          },
          {
            id: 3,
            name: 'Tablet',
            equipmentCount: 300,
            available: null,
            inUse: null,
          },
          {
            id: 2,
            name: 'Laptop',
            equipmentCount: 500,
            available: null,
            inUse: null,
          },
          {
            id: 1,
            name: 'Iphone',
            equipmentCount: 320,
            available: null,
            inUse: null,
          },
        ],
      },
    ],
  },
  endPoint: 'https://gateway.ptw.com/dev/side/studios/',
};
