require('jest-fetch-mock').enableMocks();
fetchMock.dontMock();
global.navigator = {
    onLine: false
};