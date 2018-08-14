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
import { Background } from '../../components/Background'
import { ListEditableItems } from '../../components/ListEditableItems'
import { IconButton } from '../../components/IconButton'
const Actions = require('react-native-router-flux').Actions;
import { colors } from '../../styles';
import {Permissions} from "../../../backgroundProcesses/PermissionManager";
import {OrangeLine} from "../../styles";
import {ScaledImage} from "../../components/ScaledImage";

export class SphereIntegrations extends Component<any, any> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Integrations',
    }
  };


  _getItemsAlternative() {
    let items = [];

    items.push({label:'Here you can integrate with different services. We\'re hard at work to add more!',  type:'largeExplanation'});

    items.push({label:'Thermostats:',  type:'largeExplanation'});
    items.push({
      label: 'Toon®',
      type: 'navigation',
      largeIcon: <ScaledImage source={require('../../../images/thirdParty/logo/toonLogoSmall.png')} targetWidth={45} targetHeight={45} sourceWidth={500} sourceHeight={500} />,
      callback: () => {
        let state = this.props.store.getState();
        let sphere = state.spheres[this.props.sphereId];
        let toonIds = Object.keys(sphere.thirdParty.toons)
        if (toonIds.length === 1) {
          Actions.toonSettings({sphereId: this.props.sphereId, toonId: toonIds[0]});
        }
        else if (toonIds.length > 1) {
          Actions.toonOverview({sphereId: this.props.sphereId});
        }
        else {
          Actions.toonAdd({sphereId: this.props.sphereId});
        }
      }
    });

    items.push({label:'Coming Soon:',  type:'largeExplanation'});


    items.push({
      label: 'Philips Hue',
      type: 'navigation',
      largeIcon:
        <View style={{width:55, height:55, borderRadius:12, alignItems:"center", justifyContent:"center", overflow:'hidden'}}>
          <ScaledImage source={require("../../../images/thirdParty/logo/philipsHue.png")} targetWidth={55} targetHeight={55} sourceWidth={600} sourceHeight={600} />
        </View>,
      callback: () => {
        Alert.alert("Working on it!", "Support for Philips Hue will be added in a future update.", [{text:"OK"}])
      }
    });


    items.push({type:'spacer'});
    items.push({type:'spacer'});
    items.push({type:'spacer'});

    return items;
  }




  render() {
    return (
      <Background image={this.props.backgrounds.menu} hasNavBar={false} >
        <OrangeLine/>
        <ScrollView>
          <ListEditableItems items={this._getItemsAlternative()} />
        </ScrollView>
      </Background>
    );
  }
}