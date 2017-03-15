// __tests__/Intro-test.js
// Note: test renderer must be required after react-native.
let jest = require("jest");
jest.mock('react-native-fs', () => {return {};});
jest.mock('react-native-device-info');

jest.mock('../js/ExternalConfig', () => {
  return {
    CLOUD_ADDRESS: 'https://crownstone-cloud-dev.herokuapp.com/api/',
    DEBUG: true,
    LOG_SCHEDULER: false,
    LOG_BLE: false,
    LOG_EVENTS: true,
    LOG_STORE: false,
    LOG_MESH: true,
    LOG_CLOUD: true,
    LOG_DEBUG: true,
    LOGGING: true,
    LOG_ERRORS: true,
    LOG_WARNINGS: true,
    LOG_VERBOSE: true,
    LOG_TO_FILE: false,
    DISABLE_NATIVE: true,
    SILENCE_CLOUD: true,
    OVERRIDE_DATABASE: false,
    NO_LOCATION_NAME: 'None',
    ENCRYPTION_ENABLED: true,
    AMOUNT_OF_CROWNSTONES_FOR_INDOOR_LOCALIZATION: 4,
    NETWORK_REQUEST_TIMEOUT: 15000,
    HIGH_FREQUENCY_SCAN_MAX_DURATION: 15000,
    DISABLE_TIMEOUT: 30000,
    KEEPALIVE_INTERVAL: 60,
    KEEPALIVE_REPEAT_ATTEMPTS: 1,
    RESET_TIMER_FOR_NEAR_AWAY_EVENTS: 20000,
    RELEASE_MODE: false,
    TESTING_IN_PROCESS: true,
    LOCAL_TESTING: false
  }
});

jest.mock('../js/native/Bluenet', () => {
  return {
    Bluenet: {
      connect: (handle, callback) => {console.log("connecting to ", handle); setTimeout(() => {callback({error:false});},250)},
      multiSwitch: (arr, callback) => {console.log("multiSwitch to ", arr); callback({error:false});},
      disconnect: (callback) => {console.log("disconnect"); callback({error:false});},
      phoneDisconnect: (callback) => {console.log("disconnect"); callback({error:false});},
    }
  }
});

import { Bluenet } from "../js/native/Bluenet"
import { BatchCommandHandler } from "../js/logic/BatchCommandHandler"
import { eventBus } from "../js/util/EventBus"

test('object assignment', () => {
  let mockStone = {config: {crownstoneId:'iAmFrank', meshNetworkId : 123, handle:'yet to find me'}};
  let keepAlive =      { commandName:'keepAlive'};
  let keepAliveState = { commandName:'keepAliveState', state: 1, timeout: 150, changeState: true };
  let setSwitchState = { commandName:'setSwitchState', state: 1};
  let multiSwitch =    { commandName:'multiSwitch',    state: 1, timeout: 0, intent: 4};

  let meshEmit = {
    handle: 'this is my handle',
    stoneId: 'la stone id',
    meshNetworkId: 123,
    rssi: -60,
  };
  let directEmit = {
    handle: 'this is my handle',
    stoneId: 'la stone id',
    rssi: -60,
  };


  BatchCommandHandler.load(mockStone, 'stoneId', 'sphereId', multiSwitch).catch((x) => {console.log('load',x)});
  BatchCommandHandler.execute().catch((x) => {console.log('execute',x)});
  let { directCommands, meshNetworks } = BatchCommandHandler._extractTodo();

  expect(directCommands).toEqual({sphereId:[]});
  console.log(BatchCommandHandler._extractTodo().meshNetworks.sphereId['123']);
  eventBus.emit("updateMeshNetwork_sphereId_123", meshEmit);

  expect({one: 1, two: 2}).toEqual({one: 1, two: 2});
});