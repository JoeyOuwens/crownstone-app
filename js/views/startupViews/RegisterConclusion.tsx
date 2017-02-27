import { Component } from 'react'
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


export class RegisterConclusion extends Component<any, any> {
  constructor() {
    super();
  }

  render() {
    return (
      <Background hideInterface={true} image={this.props.backgrounds.mainDark}>
        <View style={{flex:1}} />
        <View style={style.viewContainer}>
          <Text style={style.text}>An email has been sent to:</Text>
        </View>
        <View style={[style.viewContainer]}>
          <Text style={[style.text, {fontSize:21, fontWeight:'500'}]}>{this.props.email}</Text>
        </View>
        <View style={[style.viewContainer]}>
          <Text style={style.text}>{
            this.props.passwordReset ?
              'Please click the link in the email and follow the instructions to reset your password.' :
              'After you click the validation link in the email, you can login to the app using your email address.'
          }
          </Text>
          <Text style={style.smallText}>{
            'It can take up to a minute for the email to be received. Make sure you check your spam folder as well.'
          }
          </Text>

        </View>
        <View style={{alignItems:'center', justifyContent:'center', paddingBottom: 30}}>
          <TouchableOpacity onPress={ () => { (Actions as any).login() }}>
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
  },
  smallText: {
    paddingTop:15,
    textAlign:'center',
    color: '#fff',
    fontSize: 13
  }
});