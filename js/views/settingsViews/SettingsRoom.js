import React, { Component } from 'react'
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

import { Background } from './../components/Background'
import { ListEditableItems } from './../components/ListEditableItems'
import { IconButton } from '../components/IconButton'
import { getStonesFromState } from '../../util/dataUtil'
import { CLOUD } from '../../cloud/cloudAPI'
var Actions = require('react-native-router-flux').Actions;
import { styles, colors } from './../styles'

export class SettingsRoom extends Component {
  constructor() {
    super();
    this.deleting = false;
  }

  componentDidMount() {
    const { store } = this.props;
    this.unsubscribe = store.subscribe(() => {
      if (this.deleting === false)
        this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  _removeRoom() {
    const store = this.props.store;
    const state = store.getState();
    this.deleting = true;
    this.props.eventBus.emit('showLoading','Removing this room in the Cloud.');
    CLOUD.forGroup(this.props.groupId).deleteLocation(this.props.locationId)
      .then(() => {
        let removeActions = [];
        this.props.eventBus.emit('hideLoading');
        let stones = getStonesFromState(state, this.props.groupId, this.props.locationId);
        Actions.pop();

        removeActions.push({groupId: this.props.groupId, locationId: this.props.locationId, type: "REMOVE_LOCATION"});
        for (let stoneId in stones) {
          if (stones.hasOwnProperty(stoneId)) {
            removeActions.push({groupId: this.props.groupId, stoneId: stoneId, type: "UPDATE_STONE_CONFIG", data: {locationId: null}});
          }
        }
        store.batchDispatch(removeActions);
      })
      .catch((err) => {
        this.deleting = false;
        Alert.alert("Encountered Cloud Issue.",
          "We cannot delete this Appliance in the Cloud. Please try again later.",
          [{text:'OK', onPress: () => { this.props.eventBus.emit('hideLoading');} }])
      });
  }


  _getItems() {
    const store = this.props.store;
    const state = store.getState();
    const room  = state.groups[this.props.groupId].locations[this.props.locationId];

    let requiredData = {groupId: this.props.groupId, locationId: this.props.locationId};
    let items = [];

    items.push({label:'ROOM SETTINGS',  type:'explanation', below:false});
    items.push({label:'Room Name', type: 'textEdit', value: room.config.name, callback: (newText) => {
      newText = (newText === '') ? 'Untitled Room' : newText;
      store.dispatch({...requiredData, ...{type:'UPDATE_LOCATION_CONFIG', data:{name:newText}}});
    }});
    items.push({label:'Icon', type: 'icon', value: room.config.icon, callback: () => {
      Actions.roomIconSelection({locationId: this.props.locationId, icon: room.config.icon, groupId: this.props.groupId})
    }});


    if (Object.keys(state.groups[this.props.groupId].stones).length >= 4) {
      items.push({label:'INDOOR LOCALIZATION', type: 'explanation',  below:false});
      if (room.config.fingerprintRaw) {
        items.push({label:'Retrain Room', type: 'navigation', icon: <IconButton name="ios-finger-print" size={22} button={true} color="#fff" buttonStyle={{backgroundColor:colors.green2.hex}} />, callback: () => {
          Alert.alert('Retrain Room','Only do this if you experience issues with the indoor localization.',[
            {text: 'Cancel', style: 'cancel'},
            {text: 'OK', onPress: () => {Actions.roomTraining({roomName: room.config.name, locationId: this.props.locationId})}},
          ])
        }});
        items.push({label:'If the indoor localization seems off or when you have moved Crownstones around, ' +
        'you can retrain this room to improve accuracy.', type: 'explanation',  below:true});
      }
      else {
        items.push({label:'Train localization in room', type: 'navigation', icon: <IconButton name="ios-finger-print" size={22} button={true} color="#fff" buttonStyle={{backgroundColor:colors.green2.hex}} />, callback: () => {
          Actions.roomTraining({roomName: room.config.name, locationId: this.props.locationId});
        }});
        items.push({label:'Before you can use indoor localization other than enter/exit your house, you need to train all rooms so Crownstone can learn how to position you.', type: 'explanation',  below:true});
      }
    }
    else {
      items.push({label:'Indoor localization on room-level is only possible when you have 4 or more Crownstones registered.', type: 'explanation',  below:false});
      items.push({type: 'spacer', height:30});
    }

    items.push({
      label: 'Remove Room',
      type: 'button',
      icon: <IconButton name="ios-trash" size={22} button={true} color="#fff" buttonStyle={{backgroundColor:colors.red.hex}} />,
      callback: () => {
        Alert.alert("Are you sure?","'Removing this Room will make all contained Crownstones floating.'",
          [{text: "Cancel"}, {text:'OK', onPress: this._removeRoom.bind(this)}])
      }
    });
    items.push({label:'Removing this Room will make all contained Crownstones floating.',  type:'explanation', below:true});

    return items;
  }

  render() {
    return (
      <Background image={this.props.backgrounds.menu} >
        <ScrollView>
          <ListEditableItems items={this._getItems()} />
        </ScrollView>
      </Background>
    );
  }
}