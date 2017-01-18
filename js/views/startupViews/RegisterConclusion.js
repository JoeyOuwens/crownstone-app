import React, { Component } from 'react'
import {
  Alert,
  
  Dimensions,
  TouchableHighlight,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Background } from './../components/Background'
const Actions = require('react-native-router-flux').Actions;
import loginStyles from './LoginStyles'
import { styles, colors } from './../styles'


export class RegisterConclusion extends Component {
  constructor() {
    super();
  }

  render() {
    let width = Dimensions.get('window').width;

    return (
      <Background hideInterface={true} image={this.props.backgrounds.mainDark}>
        <View style={[style.viewContainer, {paddingTop:270}]}>
          <Text style={style.text}>An email has been sent to:</Text>
        </View>
        <View style={[style.viewContainer]}>
          <Text style={[style.text, {fontSize:21, fontWeight:'500'}]}>{this.props.email}</Text>
        </View>
        <View style={[style.viewContainer]}>
          <Text style={style.text}>{
            this.props.passwordReset ?
              'Please click the link in the email and follow the instructions to reset your password.' :
              'After you click the validation link in the email, you can login to the app using your email address. ' +
              'It can take up to a minute for the email to be received. Make sure you check your spam folder as well.'
            }
          </Text>
        </View>
        <View style={{
          flex:1,
          alignItems:'center',
          justifyContent:'center'}}>
          <TouchableOpacity onPress={ () => { Actions.login() }}>
            <View style={loginStyles.loginButton}><Text style={loginStyles.loginText}>OK</Text></View>
          </TouchableOpacity>
        </View>
      </Background>
    );
  }
}

let style = StyleSheet.create({
  viewContainer: {
    backgroundColor:'transparent',
    alignItems:'center',
    justifyContent:'center',
    paddingLeft:15,
    paddingRight:15,
    padding:10
  },
  text: {
    textAlign:'center',
    color: '#fff',
    fontSize: 18
  }
});
