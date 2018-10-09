
import { Languages } from "../../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("SphereBehaviour", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component } from 'react';
import {
  Alert,
  Dimensions,
  TouchableHighlight,
  PixelRatio,
  ScrollView,
  Switch,
  Text,
  View
} from 'react-native';
import {Permissions} from "../../../backgroundProcesses/PermissionManager";
import {OrangeLine} from "../../styles";
import {LOG} from "../../../logging/Log";
import {Background} from "../../components/Background";
import {ListEditableItems} from "../../components/ListEditableItems";

export class SphereBehaviour extends Component<any, any> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: lang("Sphere_behaviour"),
    }
  };

  unsubscribeStoreEvents: any;

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.unsubscribeStoreEvents = this.props.eventBus.on("databaseChange", (data) => {
      let change = data.change;
      if (
        change.changeSphereConfig && change.changeSphereConfig.sphereIds[this.props.sphereId]
      ) {
          this.forceUpdate();
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribeStoreEvents();
  }

  _getDelayLabel(delay) {
    if (delay === undefined || delay == 0)
      return 'None';

    if (delay < 60) {
      return 'after ' + Math.floor(delay) + ' seconds';
    }
    else {
      return 'after ' + Math.floor(delay/60) + ' minutes';
    }
  }

  _getItems() {
    let items = [];

    const store = this.props.store;
    const state = store.getState();

    let spherePermissions = Permissions.inSphere(this.props.sphereId);

    if (spherePermissions.editSphere) {
      let options = [];
      options.push({label: lang("__Minutes"), value: 300});
      options.push({label: lang("___Minutes"), value: 600});
      options.push({label: lang("___Minutes"), value: 900});
      options.push({label: lang("___Minutes"), value: 1800});
      items.push({label: lang("SPHERE_EXIT_DELAY"), type: 'explanation', below: false});
      items.push({
        type: 'dropdown',
        label: lang("Delay"),
        value: Math.max(300, state.spheres[this.props.sphereId].config.exitDelay), // max to allow older versions of the app that have a timeout of 2 minutes to also turn off at 5
        valueLabel: this._getDelayLabel(state.spheres[this.props.sphereId].config.exitDelay),
        dropdownHeight: 130,
        items: options,
        buttons: true,
        callback: (newValue) => {
          LOG.info("SettingsSphere: new Value for exit delay", newValue);
          store.dispatch({
            sphereId: this.props.sphereId,
            type: 'UPDATE_SPHERE_CONFIG',
            data: {exitDelay: newValue}
          });
        }
      });
      items.push({
        label: lang("If_nobody_is_left_in_the_"),
        type: 'explanation',
        below: true,
        style: {paddingBottom: 0}
      });
    }

    return items;
  }

  render() {
    return (
      <Background image={this.props.backgrounds.menu} hasNavBar={false}>
        <OrangeLine/>
        <ScrollView>
          <ListEditableItems items={this._getItems()} />
        </ScrollView>
      </Background>
    );
  }
}
