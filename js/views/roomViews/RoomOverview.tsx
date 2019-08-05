
import { Languages } from "../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("RoomOverview", key)(a,b,c,d,e);
}
import * as React from 'react';
import {
  Alert,
  ScrollView,
  View
} from 'react-native';

import { Background }           from '../components/Background'
import { DeviceEntry }          from '../components/deviceEntries/DeviceEntry'
import { BatchCommandHandler }  from '../../logic/BatchCommandHandler'
import { SeparatedItemList }    from '../components/SeparatedItemList'
import { RoomBanner }           from '../components/RoomBanner'

import {
  getPresentUsersInLocation,
  getCurrentPowerUsageInLocation,
  getStonesAndAppliancesInLocation,
  canUseIndoorLocalizationInSphere,
  enoughCrownstonesInLocationsForIndoorLocalization} from "../../util/DataUtil";
import { styles, colors, screenHeight, tabBarHeight, topBarHeight, } from '../styles'
import { DfuStateHandler }        from '../../native/firmware/DfuStateHandler';
import { DfuDeviceEntry }         from '../components/deviceEntries/DfuDeviceEntry';
import { RoomExplanation }        from '../components/RoomExplanation';
import { Permissions }            from "../../backgroundProcesses/PermissionManager";
import { SphereDeleted }          from "../static/SphereDeleted";
import { RoomDeleted }            from "../static/RoomDeleted";
import { preparePictureURI }      from "../../util/Util";
import { LiveComponent }          from "../LiveComponent";
import { core } from "../../core";
import { NavigationUtil } from "../../util/NavigationUtil";
import { StoneAvailabilityTracker } from "../../native/advertisements/StoneAvailabilityTracker";
import { Navigation } from "react-native-navigation";
import { TopBarUtil } from "../../util/TopBarUtil";


export class RoomOverview extends LiveComponent<any, any> {
  static options(props) {
    getTopBarProps(core.store.getState(), props, true);
    return TopBarUtil.getOptions(NAVBAR_PARAMS_CACHE);
  }

  unsubscribeStoreEvents : any;
  unsubscribeSetupEvents : any;
  viewingRemotely : boolean;
  viewingRemotelyInitial : boolean;
  justFinishedSetup : any;
  pictureTaken : any = null;
  nearestStoneIdInSphere : any;
  nearestStoneIdInRoom : any;

  constructor(props) {
    super(props);

    let initialState = {pendingRequests:{}};
    this.unsubscribeSetupEvents = [];

    this.viewingRemotely = true;
    this.justFinishedSetup = "";

    this.nearestStoneIdInSphere = undefined;
    this.nearestStoneIdInRoom = undefined;

    let state = core.store.getState();
    const sphere = state.spheres[this.props.sphereId];
    if (sphere) {
      this.viewingRemotely = sphere.state.present === false;
    }

    this.state = initialState;

    this.viewingRemotelyInitial = this.viewingRemotely;

    this._updateNavBar();
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'edit')  { NavigationUtil.launchModal( "RoomEdit",{ sphereId: this.props.sphereId, locationId: this.props.locationId }); }
    if (buttonId === 'train') {
      if (this.viewingRemotely === true) {
        Alert.alert(
          lang("_Youre_not_in_the_Sphere__header"),
          lang("_Youre_not_in_the_Sphere__body"),
          [{text:lang("_Youre_not_in_the_Sphere__left")}])
      }
      else {
        NavigationUtil.launchModal( "RoomTraining_roomSize",{ sphereId: this.props.sphereId, locationId: this.props.locationId });
      }
    }
  }


  componentDidMount() {
    this.unsubscribeSetupEvents.push(core.eventBus.on("dfuStoneChange", (handle) => { this.forceUpdate(); }));
    this.unsubscribeSetupEvents.push(core.eventBus.on("setupComplete",  (handle) => {
      this.forceUpdate();
    }));

    this.unsubscribeStoreEvents = core.eventBus.on("databaseChange", (data) => {
      let change = data.change;

      if (change.removeLocation && change.removeLocation.locationIds[this.props.locationId] ||
          change.removeSphere   && change.removeSphere.sphereIds[this.props.sphereId]) {
          return this.forceUpdate()
      }
      if (
        (change.changeAppliances)      ||
        (change.updateApplianceConfig) ||
        (change.updateStoneConfig)     ||
        (change.changeFingerprint)     ||
        (change.userPositionUpdate     && change.userPositionUpdate.locationIds[this.props.locationId])   ||
        (change.updateLocationConfig   && change.updateLocationConfig.locationIds[this.props.locationId]) ||
        (change.changeSphereUsers      && change.changeSphereUsers.sphereIds[this.props.sphereId])        ||
        (change.changeStoneState       && change.changeStoneState.sphereIds[this.props.sphereId])         ||
        (change.stoneUsageUpdated      && change.stoneUsageUpdated.sphereIds[this.props.sphereId])        ||
        (change.changeSphereState      && change.changeSphereState.sphereIds[this.props.sphereId])        ||
        (change.stoneLocationUpdated   && change.stoneLocationUpdated.sphereIds[this.props.sphereId])     ||
        (change.changeStones)
      ) {
        this.forceUpdate();
        this._updateNavBar();
        return;
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribeSetupEvents.forEach((unsubscribe) => { unsubscribe(); });
    this.unsubscribeStoreEvents();

    // we keep open a connection for a few seconds to await a second command
    BatchCommandHandler.closeKeptOpenConnection();
    NAVBAR_PARAMS_CACHE = null;
  }

  _renderer(item, index, stoneId) {
    if (item.dfuMode === true) {
      return (
        <View key={stoneId + '_dfu_entry'}>
        <View style={[styles.listView, {backgroundColor: colors.white.rgba(0.8)}]}>
          <DfuDeviceEntry
            key={stoneId + '_dfu_element'}
            sphereId={this.props.sphereId}
            handle={item.advertisement && item.advertisement.handle}
            name={item.data && item.data.name}
            stoneId={item.data && item.data.id}
          />
        </View>
      </View>
      )
    }
    else {
      return (
        <View key={stoneId + '_entry'}>
          <DeviceEntry
            stoneId={stoneId}
            locationId={this.props.locationId}
            sphereId={this.props.sphereId}
            viewingRemotely={this.viewingRemotely}
            nearestInSphere={stoneId === this.nearestStoneIdInSphere}
            nearestInRoom={stoneId === this.nearestStoneIdInRoom}
            dfuMode={item.dfuMode === true}
          />
        </View>
      );
    }
  }

  _getStoneList(stones) {
    let stoneArray = [];
    let ids = [];
    let stoneIds = Object.keys(stones);
    let shownHandles = {};

    if (DfuStateHandler.areDfuStonesAvailable() === true && Permissions.inSphere(this.props.sphereId).canUpdateCrownstone) {
      let dfuStones = DfuStateHandler.getDfuStones();

      let dfuIds = Object.keys(dfuStones);
      dfuIds.forEach((dfuId) => {
        if (dfuStones[dfuId].data && dfuStones[dfuId].data.locationId === this.props.locationId) {
          shownHandles[dfuStones[dfuId].advertisement.handle] = true;
          ids.push(dfuId);
          dfuStones[dfuId].dfuMode = true;
          stoneArray.push(dfuStones[dfuId]);
        }
      });
    }

    let tempStoneDataArray = [];
    stoneIds.forEach((stoneId) => {
      // do not show the same device twice
      let handle = stones[stoneId].stone.config.handle;
      if (shownHandles[handle] === undefined) {
        tempStoneDataArray.push({stone: stones[stoneId], id: stoneId});
      }
    });

    // sort the order of things by crownstone Id
    tempStoneDataArray.sort((a,b) => { return a.stone.stone.config.crownstoneId - b.stone.stone.config.crownstoneId });

    tempStoneDataArray.forEach((stoneData) => {
      ids.push(stoneData.id);
      stoneArray.push(stoneData.stone);
    });

    return { stoneArray, ids };
  }


  _updateNavBar() {
    getTopBarProps(core.store.getState(), this.props, this.viewingRemotely);
    Navigation.mergeOptions(this.props.componentId, TopBarUtil.getOptions(NAVBAR_PARAMS_CACHE))
  }


  render() {
    const store = core.store;
    const state = store.getState();
    const sphere = state.spheres[this.props.sphereId];
    if (!sphere) { return <SphereDeleted/> }
    let location = sphere.locations[this.props.locationId];
    if (!location) {
      return <RoomDeleted/>
    }

    let seeStoneInDfuMode = DfuStateHandler.areDfuStonesAvailable();

    let usage  = getCurrentPowerUsageInLocation(  state, this.props.sphereId, this.props.locationId);
    let users  = getPresentUsersInLocation(       state, this.props.sphereId, this.props.locationId);
    let stones = getStonesAndAppliancesInLocation(state, this.props.sphereId, this.props.locationId);
    let canDoLocalization = canUseIndoorLocalizationInSphere(state, this.props.sphereId);

    // if we're the only crownstone and in the floating crownstones overview, assume we're always present.
    this.viewingRemotely = sphere.state.present === false && seeStoneInDfuMode !== true;

    let backgroundImage = core.background.light;

    if (location.config.picture) {
      backgroundImage = { uri: preparePictureURI(location.config.picture) };
    }

    let amountOfStonesInRoom = Object.keys(stones).length;
    let content = undefined;
    if (amountOfStonesInRoom > 0) {
      let {stoneArray, ids} = this._getStoneList(stones);
      this._setNearestStoneInRoom(ids);
      this._setNearestStoneInSphere(state.spheres[this.props.sphereId].stones);
      let viewHeight = screenHeight-tabBarHeight-topBarHeight-100;

      content = (
        <ScrollView style={{position:'relative', top:-1}}>
          <View style={{height: Math.max(stoneArray.length*81 + 0.5*viewHeight, viewHeight)} /* make sure we fill the screen */}>
            <SeparatedItemList
              items={stoneArray}
              ids={ids}
              separatorIndent={false}
              renderer={this._renderer.bind(this)}
            />
          </View>
        </ScrollView>
      );
    }

    return (
      <Background image={backgroundImage}>
        <RoomBanner
          presentUsers={users}
          noCrownstones={amountOfStonesInRoom === 0}
          canDoLocalization={canDoLocalization}
          amountOfStonesInRoom={amountOfStonesInRoom}
          hideRight={this.props.hideRight}
          usage={usage}
          viewingRemotely={this.viewingRemotely}
          overlayText={this.props.overlayText}
        />
        <RoomExplanation
          state={state}
          explanation={ this.props.explanation }
          sphereId={    this.props.sphereId }
          locationId={  this.props.locationId }
        />
        {content}
      </Background>
    );
  }

  _setNearestStoneInRoom(ids) {
    let rssi = -1000;
    for (let i = 0; i < ids.length; i++) {
      let stoneRssi = StoneAvailabilityTracker.getAvgRssi(ids[i]);
      if (stoneRssi > rssi) {
        rssi = stoneRssi;
        this.nearestStoneIdInRoom = ids[i];
      }
    }
  }

  _setNearestStoneInSphere(allStones) {
    let rssi = -1000;
    let stoneIds = Object.keys(allStones);
    for (let i = 0; i < stoneIds.length; i++) {
      let stoneRssi = StoneAvailabilityTracker.getAvgRssi(stoneIds[i]);
      if (stoneRssi > rssi) {
        rssi = stoneRssi;
        this.nearestStoneIdInSphere = stoneIds[i];
      }
    }
  }
}


function getTopBarProps(state, props, viewingRemotely) {
  let enoughCrownstonesInLocations = enoughCrownstonesInLocationsForIndoorLocalization(state, props.sphereId);
  let sphere = state.spheres[props.sphereId];
  if (!sphere) { return }
  let location = sphere.locations[props.locationId];
  if (!location) { return }

  let title = location.config.name;

  NAVBAR_PARAMS_CACHE = { title: title }

  let spherePermissions = Permissions.inSphere(props.sphereId);

  if (spherePermissions.editRoom === true) {
    NAVBAR_PARAMS_CACHE["edit"] = true;
  }
  else if (spherePermissions.editRoom === false && enoughCrownstonesInLocations === true) {
    NAVBAR_PARAMS_CACHE["nav"] = {id:'train',text:'Train'};
  }

  return NAVBAR_PARAMS_CACHE;
}

let NAVBAR_PARAMS_CACHE : topbarOptions = null;



