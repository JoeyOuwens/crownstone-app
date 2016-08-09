import React, { Component } from 'react' 
import {
  
  TouchableHighlight,
  Text,
  View
} from 'react-native';

import { Icon } from '../Icon';
import { styles, colors } from '../../styles'


export class CheckBar extends Component {
  render() {
    return (
      <TouchableHighlight onPress={() => {this.props.setActiveElement(); this.props.callback()}}>
        <View style={[styles.listView, {height:this.props.barHeight}]}>
          <Text style={styles.listTextLarge}>{this.props.label}</Text>
          <View style={{flex:1}} />
          {
            this.props.value === true ?
              <View style={{paddingTop:3}}>
                <Icon name="ios-checkmark" size={30} color={colors.iosBlue.hex} />
              </View>
              : undefined
          }
        </View>
      </TouchableHighlight>
    );
  }
}
