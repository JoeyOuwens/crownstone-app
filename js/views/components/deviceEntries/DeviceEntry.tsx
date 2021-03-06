
import { Languages } from "../../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("DeviceEntry", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component } from 'react';
import {
  Animated,
  ActivityIndicator,
  Switch,
  TouchableOpacity,
  Text,
  View, ViewStyle, PanResponder
} from "react-native";

import { Icon } from '../Icon';
import { Util } from '../../../util/Util'
import { styles, colors, screenWidth } from "../../styles";
import { AlternatingContent }                 from '../animated/AlternatingContent';
import { MINIMUM_REQUIRED_FIRMWARE_VERSION }  from '../../../ExternalConfig';
import { INTENTS }                            from '../../../native/libInterface/Constants';
import { StoneUtil }                          from "../../../util/StoneUtil";
import { DeviceEntrySubText }                 from "./DeviceEntrySubText";
import {AnimatedCircle} from "../animated/AnimatedCircle";
import { SlideFadeInView, SlideSideFadeInView } from "../animated/SlideFadeInView";
import { xUtil } from "../../../util/StandAloneUtil";
import { STONE_TYPES } from "../../../Enums";
import { core } from "../../../core";
import { NavigationUtil } from "../../../util/NavigationUtil";
import { StoneAvailabilityTracker } from "../../../native/advertisements/StoneAvailabilityTracker";
import { DataUtil } from "../../../util/DataUtil";
import Slider from "@react-native-community/slider";
import { DeviceEntryIcon } from "./submodules/DeviceEntryIcon";
import { safeStoreUpdate } from "../../deviceViews/DeviceOverview";

const PADDING_LEFT = 15;
const PADDING_RIGHT = 15;

export class DeviceEntry extends Component<any, any> {

  _panResponder;
  baseHeight : number;
  unsubscribe = [];
  animating = false;
  id = xUtil.getUUID();

  showMeshMessageTimeout;

  // these are used to determine persisting the switchstate.
  actualState = 0;
  storedSwitchState = 0;
  storeSwitchState = false;
  storeSwitchStateTimeout = null;

  revertToNormalViewTimeout = null;

  constructor(props) {
    super(props);
    let state = core.store.getState();
    let stone = state.spheres[this.props.sphereId].stones[this.props.stoneId];
    let switchState = stone.state.state;
    this.actualState = switchState;
    this.storedSwitchState = switchState;
    this.state = {
      pendingCommand:  false,
      backgroundColor: new Animated.Value(0),
      statusText:      null,
      percentage:      switchState,
    };
  }

  componentDidMount() {
    // this event makes the background of the device entry blink to incidate the error.
    this.unsubscribe.push(core.eventBus.on('showErrorInOverview', (stoneId) => {
      if (stoneId === this.props.stoneId) {
        Animated.spring(this.state.backgroundColor, { toValue: 10, friction: 1.5, tension: 90 }).start();
        setTimeout(() => {
          Animated.timing(this.state.backgroundColor, { toValue: 0, duration: 2500 }).start();
        }, 5000);
      }
    }));

    this.unsubscribe.push(core.eventBus.on('databaseChange', (data) => {
      let change = data.change;
      if (change.updateStoneState && change.updateStoneState.stoneIds[this.props.stoneId]) {
        let change = data.change;
        let state = core.store.getState();
        let stone = state.spheres[this.props.sphereId].stones[this.props.stoneId];
        if (!stone || !stone.config) { return; }
        if (stone.state.state !== this.props.percentage) {
          this.setState({percentage: stone.state.state})
          return;
        }
        this.forceUpdate();
        return
      }
    }));
  }

  componentWillUnmount() { // cleanup
    this.unsubscribe.forEach((unsubscribe) => { unsubscribe();});
    if (this.storeSwitchState) {
      clearTimeout(this.storeSwitchStateTimeout);
      this.storedSwitchState = safeStoreUpdate(this.props.sphereId, this.props.stoneId, this.storedSwitchState);
    }
    clearTimeout(this.showMeshMessageTimeout);
    clearTimeout(this.revertToNormalViewTimeout);
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    if ( this.props.switchView !== prevProps.switchView ) {
      let state = core.store.getState();
      if (state.app.hasSeenSwitchView === false) {
        let stone = state.spheres[this.props.sphereId].stones[this.props.stoneId];
        let useSwitchView = this.props.switchView && stone.abilities.dimming.enabledTarget && !StoneAvailabilityTracker.isDisabled(this.props.stoneId);
        if (useSwitchView && state.app.hasSeenSwitchView === false) {
          core.store.dispatch({ type: 'UPDATE_APP_SETTINGS', data: { hasSeenSwitchView: true } });
        }
      }
    }
  }

  _pressedDevice(stone) {
    let newSwitchState = (stone.state.state > 0 ? 0 : 100);
    this.setState({pendingCommand:true});
    if (newSwitchState > 0) {
      StoneUtil.turnOnBCH(
        this.props.sphereId,
        this.props.stoneId,
        stone,
        {keepConnectionOpen: true, keepConnectionOpenTimeout: 2},
        (err, result) => {
          let newState = {pendingCommand:false, percentage: newSwitchState};
          this.setState(newState);
        },
        1,
        'from _pressedDevice in DeviceEntry'
      );
    }
    else {
      StoneUtil.switchBCH(
        this.props.sphereId,
        this.props.stoneId,
        stone, newSwitchState,
        {keepConnectionOpen: true, keepConnectionOpenTimeout: 2},
        (err, result) => {
          let newState = {pendingCommand:false, percentage: newSwitchState};
          this.setState(newState);
        },
        1,
        'from _pressedDevice in DeviceEntry'
      );
    }


  }

  _getControl(stone) {
    let content;
    let action = null;
    if (StoneAvailabilityTracker.isDisabled(this.props.stoneId) === false) {
      if (stone.errors.hasError) {
        content = <Switch value={stone.state.state === 1} disabled={true} />;
        action = () => { this._basePressed(); }
      }
      else if (stone.config.locked) {
        content = <Icon name={'md-lock'} color={colors.black.rgba(0.2)} size={32} />;
        action = () => { this._basePressed(); }
      }
      else if (this.state.pendingCommand === true) {
        content = <ActivityIndicator animating={true} size='large' color={colors.black.rgba(0.5)} />;
      }
      else {
        content = <Switch value={stone.state.state > 0} onValueChange={() => { this._pressedDevice(stone); }}/>;
        action = () => { this._pressedDevice(stone);  }
      }
    }


    let wrapperStyle : ViewStyle = {height: this.baseHeight, width: 75, paddingRight:15, alignItems:'flex-end', justifyContent:'center'};
    if (action) {
      return (
        <TouchableOpacity onPress={() => { action() }} style={wrapperStyle}>
          {content}
        </TouchableOpacity>
      );
    }
    else {
      return <View style={wrapperStyle}>{content}</View>;
    }
  }

  _basePressed() {
    NavigationUtil.navigate( "DeviceOverview",{sphereId: this.props.sphereId, stoneId: this.props.stoneId, viewingRemotely: this.props.viewingRemotely})
  }

  _getExplanationText(state, useSwitchView) {
    let explanationStyle = { color: colors.iosBlue.hex, fontSize: 12};
    let explanation = null;

    if (this.props.hideExplanation !== true) {
      if (state.app.hasSeenDeviceSettings === false) {
        explanation = <Text style={explanationStyle}>{  lang("Tap_me_for_more_") }</Text>;
      }
      else if (state.app.hasSeenSwitchView !== true && this.props.amountOfDimmableCrownstonesInLocation > 1) {
        explanation = <Text style={explanationStyle}>{ lang("Tap_icon_to_quickly_dim_y") }</Text>;
      }
    }

    if (explanation) {
      return (
        <View style={{height:15}}>
          {explanation}
        </View>
      )
    }
    return null;
  }



  _switch(stone, state) {
    StoneUtil.switchBCH(
      this.props.sphereId,
      this.props.stoneId,
      stone,
      state,
      {},
      () => { this._planStoreAction(state); },
      1,
      'from _getButton in DeviceSummary',
      true
    );
  }

  _planStoreAction(state) {
    this.actualState = state;
    this.storeSwitchState = true;
    clearTimeout(this.storeSwitchStateTimeout);
    this.storeSwitchStateTimeout = setTimeout(() => {
      this.storeSwitchState = false;
      this.storedSwitchState = safeStoreUpdate(this.props.sphereId, this.props.stoneId, this.storedSwitchState);
    }, 3000);
  }


  render() {
    let state = core.store.getState();
    let stone = state.spheres[this.props.sphereId].stones[this.props.stoneId];

    let useControl = stone.config.type === STONE_TYPES.plug || stone.config.type === STONE_TYPES.builtin || stone.config.type === STONE_TYPES.builtinOne;
    let backgroundColor = this.state.backgroundColor.interpolate({
      inputRange: [0,10],
      outputRange: ['rgba(255, 255, 255, 0.8)',  colors.csOrange.rgba(0.5)]
    });

    let WrapperElement : any = TouchableOpacity;
    if (this.props.touchable === false) {
      WrapperElement = View
    }

    let useSwitchView = this.props.switchView && stone.abilities.dimming.enabledTarget && !StoneAvailabilityTracker.isDisabled(this.props.stoneId);
    let switchViewExplanation = !useSwitchView && this.props.switchView;
    let height = this.props.height || 80;
    let sliderWidth = screenWidth - 20 - 60 - 30;
    let explanationText = this._getExplanationText(state, useSwitchView);

    return (
      <Animated.View style={[styles.listView,{flexDirection: 'column', paddingRight:0, height: height, overflow:'hidden', backgroundColor:backgroundColor}]}>
        <View style={{flexDirection: 'row', height: this.baseHeight, paddingRight: 0, paddingLeft: 0, flex: 1}}>
          <TouchableOpacity style={{ height: this.baseHeight, justifyContent: 'center'}} onPress={() => {
            clearTimeout(this.revertToNormalViewTimeout);
            if (this.props.switchView === false && this.props.amountOfDimmableCrownstonesInLocation === 0) {
              this.revertToNormalViewTimeout = setTimeout(() => { this.props.setSwitchView(false); }, 3000);
            }
            this.props.setSwitchView(!this.props.switchView);
          }}>
            <DeviceEntryIcon stone={stone} stoneId={this.props.stoneId} state={state} overrideStoneState={undefined} />
          </TouchableOpacity>
          <WrapperElement
            activeOpacity={ useSwitchView ? 1 : 0.2 }
            style={{flex: 1, height: this.baseHeight, justifyContent: 'center'}}
            onPress={() => { if (useSwitchView === false) { this._basePressed(); }}}
          >
            <View style={{justifyContent:'center'}}>
              <View style={{paddingLeft:20, paddingTop:10}}>
                <Text style={{fontSize: 17}}>{stone.config.name}</Text>
                <SlideFadeInView visible={!useSwitchView} height={25 + (explanationText ? 15 : 0)}>
                  <DeviceEntrySubText
                    statusTextOverride={this.props.statusText}
                    statusText={this.state.statusText}
                    deviceType={stone.config.type}
                    rssi={StoneAvailabilityTracker.getRssi(this.props.stoneId)}
                    disabled={StoneAvailabilityTracker.isDisabled(this.props.stoneId)}
                    currentUsage={stone.state.currentUsage}
                    nearestInSphere={this.props.nearestInSphere}
                    nearestInRoom={this.props.nearestInRoom}
                  />
                  { explanationText }
                </SlideFadeInView>
              </View>
              <SlideFadeInView visible={useSwitchView} height={50}>
                <View style={{paddingLeft: 20}}>
                  <Slider
                    style={{ width: sliderWidth, height: 40 }}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={this.state.percentage}
                    onSlidingStart={   () => {
                      NavigationUtil.setViewBackSwipeEnabled(false);
                      this.props.toggleScrollView(false);
                    }}
                    onSlidingComplete={() => {
                      NavigationUtil.setViewBackSwipeEnabled(true);
                      this.props.toggleScrollView(true);
                    }}
                    minimumTrackTintColor={colors.green.rgba(0.75)}
                    maximumTrackTintColor={colors.black.rgba(0.05)}
                    onValueChange={(value) => { this._switch(stone, value); this.setState({percentage: value})}}
                  />
                  <View style={{position:'absolute', top:-10, left:0,  height:60, width: Math.max(0,(sliderWidth-30)* 0.01*  this.state.percentage) }} />
                  <View style={{position:'absolute', top:-10, right:0, height:60, width: Math.max(0,(sliderWidth-30)*(1-0.01*this.state.percentage))}} />
                </View>
              </SlideFadeInView>
            </View>
          </WrapperElement>
          {useControl === true && xUtil.versions.canIUse(stone.config.firmwareVersion, MINIMUM_REQUIRED_FIRMWARE_VERSION) ?
            <SlideSideFadeInView visible={!useSwitchView} width={75} style={{justifyContent: 'center' }}>
              {this._getControl(stone)}
            </SlideSideFadeInView>
            : <View style={{ width: 15 }}/>
          }
        </View>
      </Animated.View>
    );
  }
}