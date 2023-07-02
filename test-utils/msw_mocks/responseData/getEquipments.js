export default {
  response: {
    count: 1,
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
    ],
    message: 'Record Found Successfully',
    id: null,
    statusCode: 200,
  },
  endPoint: 'https://gateway.ptw.com/dev/side/studios/:id/',
};
