import React, { Component } from 'react' 
import {
  Animated,
  Dimensions,
  Image,
  NativeModules,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  View
} from 'react-native';

import { styles, screenWidth, screenHeight, colors } from '../styles'
import { getCurrentPowerUsageFromState } from '../../util/dataUtil'
import { PresentUsers } from './PresentUsers'
import { Icon } from './Icon';
import { LOGDebug } from '../../logging/Log';
var Actions = require('react-native-router-flux').Actions;


import Svg,{ Circle } from 'react-native-svg';

export class RoomCircle extends Component {
  constructor(props) {
    super();

    let initialX = props.pos.x;
    let initialY = props.pos.y;

    let screenCenterX = 0.5*screenWidth;
    let screenCenterY = 0.5*screenHeight;
    if (initialX > screenCenterX)
      initialX += screenWidth;
    else
      initialX -= screenWidth;

    if (initialY > screenCenterY)
      initialY -= 0.25*screenHeight;
    else
      initialY += 0.25*screenHeight;


    this.state = {top: new Animated.Value(initialY), left: new Animated.Value(initialX), opacity: new Animated.Value(0)};

    this.levels = [
      {min: 0,    max:200,   color: colors.green.hex},
      {min: 200,  max:800,   color: colors.orange.hex},
      {min: 800,  max:1500,  color: colors.red.hex},
      {min: 1500, max:4000,  color: colors.darkRed.hex},
    ];

    this.usage = 0;
    this.props = props;
    // calculate the size of the circle based on the screen size
    this.borderWidth = props.radius / 15;
    this.innerDiameter = 2*props.radius - 4.5 * this.borderWidth;
    this.outerDiameter = 2*props.radius;
    this.iconSize = props.radius * 0.8;
    this.textSize = props.radius * 0.25;

    this.animationStarted = false;
    this.animating = false;
    this.animatedMoving = false;

    this.previousCircle = undefined;
    this.wiggleInterval = undefined;
    this.wiggleTimeout = undefined;
    this.fadeAnimationTimeout = undefined;
    this.moveAnimationTimeout = undefined;

    this.movementDuration = 400;
    this.jumpDuration = 400;
    this.fadeDuration = this.movementDuration;
  }

  componentDidMount() {
    const { store } = this.props;
    this.unsubscribe = store.subscribe(() => {
      if (this.renderState === undefined)
        return;

      const state = store.getState();
      if (state.spheres[this.props.sphereId] === undefined) {
        return;
      }
      // only redraw if the power usage changes or if the settings of the room change
      let usage = getCurrentPowerUsageFromState(state, this.props.sphereId, this.props.locationId);

      // in the case the room is deleted, do not redraw.
      if (this.props.locationId !== null && state.spheres[this.props.sphereId].locations[this.props.locationId] === undefined) {
        return;
      }

      if (this.props.locationId !== null) {
        if (usage !== this.usage || state.spheres[this.props.sphereId].locations[this.props.locationId].config != this.renderState.spheres[this.props.sphereId].locations[this.props.locationId].config) {
          this.usage = usage;
          this.forceUpdate();
        }
      }
      else if (usage !== this.usage) {
        this.usage = usage;
        this.forceUpdate();
      }
    });

    // wait to wiggle until after the initial movement.
    this.wiggleTimeout = setTimeout(() => {this.checkAlertStatus(this.props)},this.moveAnimationTimeout);
  }

  componentWillUpdate(nextProps) {
    this.checkAlertStatus(nextProps);
  }

  checkAlertStatus(props) {
    if (props.locationId === null && props.seeStoneInSetupMode) {
      this.setWiggleInterval()
    }
    else if (this.wiggleInterval !== undefined) {
      clearTimeout(this.wiggleInterval);
      this.wiggleInterval = undefined;
    }
  }

  setWiggleInterval() {
    if (this.wiggleInterval === undefined) {
      this.wiggle();
      this.wiggleInterval = setTimeout(() => {
        this.wiggleInterval = undefined;
        this.setWiggleInterval();
      }, this.jumpDuration + 700)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.wiggleInterval);
    clearTimeout(this.fadeAnimationTimeout);
    clearTimeout(this.moveAnimationTimeout);
    clearTimeout(this.wiggleTimeout);
    this.unsubscribe();
  }


  _getLevel(usage) {
    for (let i = 0; i < this.levels.length; i++) {
      if (usage < this.levels[i].max)
        return i
    }
    return this.levels.length-1;
  }

  _getColor(usage, prev = false) {
    if (this.props.remote === true) {
      return colors.notConnected.hex;
    }

    if (this.props.locationId === null && this.props.seeStoneInSetupMode === true) {
      return colors.blinkColor1.hex;
    }

    let level = this._getLevel(usage);
    if (prev) {
      if (level == 0) {
        return "#eee"
      }
      else {
        return this.levels[level-1].color;
      }
    }
    return this.levels[level].color;
  }

  _animateFade() {
    let duration = this.animatedMoving === true ? this.movementDuration : this.fadeDuration;

    if (this.animationStarted === false) {
      this.animationStarted = true;
      Animated.timing(this.state.opacity, {toValue: 1, duration: duration}).start();
      this.fadeAnimationTimeout = setTimeout(() => {
        this.animationStarted = false;
        this.animating = false;
        this.setState({opacity: new Animated.Value(0)});
      }, duration)
    }
  }

  getIcon() {
    if (this.props.locationId === null && this.props.seeStoneInSetupMode === true) {
      let smallSize = this.iconSize*1.1*0.6;
      return (
        <View style={{width:this.iconSize*1.1, height: this.iconSize}}>
          <Icon name="ios-sunny" size={smallSize} color={colors.blinkColor2.hex} style={{position:'absolute', top:-smallSize*0.024, left:smallSize*0.46}} />
          <Icon name="c2-crownstone" size={this.iconSize*1.1} color='#ffffff' style={{position:'absolute', top:this.iconSize*0.15, left:0}} />
        </View>
      )
    }
    else if (this.props.locationId === null) {
      return <Icon name="c2-pluginFilled" size={this.iconSize} color='#ffffff'/>;
    }
    else {
      let icon = this.props.store.getState().spheres[this.props.sphereId].locations[this.props.locationId].config.icon;
      return <Icon name={icon} size={this.iconSize} color='#ffffff' />;
    }

  }

  getCircle() {
    let newColor = this._getColor(this.usage);
    if (newColor !== this.color && this.previousCircle !== undefined) {
      this.animating = true;
      this.fadeAnimationTimeout = setTimeout(() => {
        this.color = newColor;
        this.previousCircle = circle;
        this._animateFade()
      },10);
    }
    let circle = (
      <View>
        <View style={{
          borderRadius: this.outerDiameter,
          width: this.outerDiameter,
          height: this.outerDiameter,
          backgroundColor:'#ffffff',
          padding:0,
          margin:0
        }}>
          {this._getUsageCircle(this.usage, newColor)}
          <View style={{
            position:'relative',
            top:-this.outerDiameter + 2.25*this.borderWidth,
            left: 2.25*this.borderWidth,
            borderRadius:this.innerDiameter,
            width: this.innerDiameter,
            height: this.innerDiameter,
            backgroundColor: newColor,
            padding:0,
            margin:0,
            justifyContent:'center',
            alignItems:'center'
          }}><View style={[styles.centered,{height:0.5*this.innerDiameter}]}>
            {this.getIcon()}
            </View>
            {this.props.remote ? undefined : <Text style={{color:'#ffffff', fontWeight:'bold',fontSize:this.textSize}}>{this.usage + " W"}</Text>}
          </View>
        </View>
      </View>
    );

    if (this.animating === true) {
      return (
        <View>
          <View style={{position:'absolute', top:0, left:0}}>
            {this.previousCircle}
          </View>
          <Animated.View style={{position:'absolute', top:0, left:0, opacity: this.state.opacity}}>
            {circle}
          </Animated.View>
        </View>
      )
    }
    else {
      this.color = newColor;
      this.previousCircle = circle;
      return circle;
    }

  }


  _getUsageCircle(usage, newColor) {
    let colorOfLowerLayer = this._getColor(usage, true);
    let pathLength = Math.PI * 2 * this.props.radius;
    if (usage == 0)
      return (
        <Svg style={{
          width: this.outerDiameter,
          height: this.outerDiameter,
        }} >
          <Circle
            r={this.props.radius - this.borderWidth}
            stroke={colorOfLowerLayer}
            strokeWidth={this.borderWidth}
            strokeDasharray={[pathLength,pathLength]}
            rotate="-90"
            x={this.props.radius}
            y={this.props.radius}
            strokeLinecap="round"
            fill="white"
          />
        </Svg>
    );

    return (
      <Svg style={{
        width: this.outerDiameter,
        height: this.outerDiameter,
      }}>
        <Circle
          r={this.props.radius - this.borderWidth}
          stroke={colorOfLowerLayer}
          strokeWidth={this.borderWidth}
          strokeDasharray={[pathLength,pathLength]}
          rotate="-90"
          x={this.props.radius}
          y={this.props.radius}
          strokeLinecap="round"
          fill="white"
        />
        <Circle
          r={this.props.radius - this.borderWidth}
          stroke={newColor}
          strokeWidth={this.borderWidth}
          strokeDasharray={[pathLength*this._getFactor(usage),pathLength]}
          rotate="-90"
          x={this.props.radius}
          y={this.props.radius}
          strokeLinecap="round"
          fill="rgba(0,0,0,0)"
        />
      </Svg>
    )
  }


  _getFactor(usage) {
    let level = this._getLevel(usage);
    let minW = this.levels[level].min;
    let maxW = this.levels[level].max;
    let val = (usage-minW) / (maxW-minW);

    if (val < 0.5) {
      return val - (0.2*val*val);
    }
    else if (val < 0.84) {
      return 0.61 + (0.9*val-0.6)
    }
    return 0.8*val*val + 0.2;
  }


  // _getAlertIcon() {
  //   let alertSize = 30;
  //   if (this.props.locationId === null && this.props.seeStoneInSetupMode) {
  //     return (
  //       <View style={[styles.centered, {
  //         width:alertSize,
  //         height:alertSize, borderRadius:alertSize*0.5,
  //         borderWidth:3,
  //         borderColor:'#fff',
  //         position:'absolute',
  //         top:this.outerDiameter*0.06, left: this.outerDiameter*0.75, backgroundColor:colors.blue.hex}]} >
  //         <Icon name="md-star" color="#fff" size={20} style={{backgroundColor:'transparent'}} />
  //       </View>
  //     )
  //   }
  // }

  _animatePosition() {
    let animations = [];
    if (this.animatedMoving === false) {
      this.animatedMoving = true;
      animations.push(Animated.timing(this.state.top, {toValue: this.props.pos.y, duration: this.movementDuration}));
      animations.push(Animated.timing(this.state.left, {toValue: this.props.pos.x, duration: this.movementDuration}));
      this.moveAnimationTimeout = setTimeout(() => {
        this.animatedMoving = false;
      }, this.movementDuration);
      Animated.parallel(animations).start();
    }
  }

  wiggle() {
    let animations = [];
    let tension = 120;
    let friction = 3;
    let offset = 0.08*screenWidth;
    let randX = offset*(Math.random()-0.5);
    let randY = offset*(Math.random()-0.5);
    if (this.animatedMoving === false) {
      this.animatedMoving = true;
      animations.push(Animated.spring(this.state.top, {toValue: this.props.pos.y - randY, friction: friction, tension: tension}));
      animations.push(Animated.spring(this.state.left, {toValue: this.props.pos.x - randX, friction: friction, tension: tension}));
      this.moveAnimationTimeout = setTimeout(() => {
        this.animatedMoving = false;
        animations.push(Animated.spring(this.state.top, {toValue: this.props.pos.y, friction: friction, tension: tension}));
        animations.push(Animated.spring(this.state.left, {toValue: this.props.pos.x, friction: friction, tension: tension}));
        Animated.parallel(animations).start();
      }, this.jumpDuration);
      Animated.parallel(animations).start();
    }
  }

  render() {
    if (this.state.top !== this.props.pos.y || this.state.left !== this.props.pos.x) {
      this.moveAnimationTimeout = setTimeout(() => this._animatePosition(),0)
    }

    const store = this.props.store;
    const state = store.getState();
    this.renderState = store.getState();

    return (
      <Animated.View style={{position:'absolute',  top: this.state.top, left: this.state.left}}>
        <TouchableOpacity onPress={() => Actions.roomOverview(this.props.actionParams)}>
          <View>
            {this.getCircle()}
            {this.props.locationId === null ? undefined : <PresentUsers locationId={this.props.locationId} store={store} roomRadius={this.props.radius} />}
            {/*{this._getAlertIcon()}*/}
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }
}
// ------------------------------------------------------------ //
// code for when there was an image behind the icon
// ------------------------------------------------------------ //
// if (this.props.backgroundImage) {
//   return (
//     <View style={{
//         width: outerDiameter,
//         height: outerDiameter,
//         backgroundColor:'transparent'
//       }}>
//       <View style={{
//         borderWidth:borderWidth,
//         borderColor:this.props.borderColor || '#ffffff',
//         borderRadius:outerDiameter,
//         width: outerDiameter,
//         height: outerDiameter,
//         backgroundColor:`rgb(${this.props.color.r},${this.props.color.g},${this.props.color.b})`
//       }}>
//         <Surface
//           width={innerDiameter}
//           height={innerDiameter}
//           backgroundColor='transparent'>
//           <CircleCrop>
//             <ImageHueBlend
//               r={this.props.color.r/255}
//               g={this.props.color.g/255}
//               b={this.props.color.b/255}
//               blendFactor={0.7}
//               image={this.props.backgroundImage}
//             />
//           </CircleCrop>
//         </Surface>
//       </View>
//       <View style={{
//         position:'relative',
//         top:-(1+offset)* outerDiameter,
//         left:0,
//         backgroundColor:'transparent',
//         width:outerDiameter,
//         height:outerDiameter,
//         alignItems:'center',
//         justifyContent:'center'
//         }}>
//         <Ionicon name={this.props.icon} size={iconSize} color='#ffffff' />
//       </View>
//       <View style={{
//         position:'relative',
//         top:-(1.4 + offset)*outerDiameter,
//         backgroundColor:'transparent',
//         width:outerDiameter,
//         height:(0.4+offset)*outerDiameter,
//         alignItems:'center',
//         justifyContent:'center'
//         }}>
//         <Text style={{color:'#ffffff', fontWeight:'bold',fontSize:iconSize/4}}>{this.props.content.value + ' ' + this.props.content.unit}</Text>
//       </View>
//     </View>
//   );
// }