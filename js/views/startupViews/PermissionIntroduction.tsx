import { LiveComponent }          from "../LiveComponent";


function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("PermissionIntroduction", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component } from 'react';
import { Languages } from "../../Languages";
import { Interview } from "../components/Interview";
import { Alert, Platform, View } from "react-native";
import {
  availableModalHeight,
  colors,
  screenHeight,
  screenWidth,
  statusBarHeight,
  styles,
  tabBarMargin
} from "../styles";
import { core } from "../../core";
import { AnimatedBackground } from "../components/animated/AnimatedBackground";
import { NavigationUtil } from "../../util/NavigationUtil";
import { Stacks } from "../../router/Stacks";
import { LocationHandler } from "../../native/localization/LocationHandler";
import { LOG } from "../../logging/Log";
import { NotificationHandler } from "../../backgroundProcesses/NotificationHandler";
import { randomAiName } from "./AiStart";
import { ScaledImage } from "../components/ScaledImage";
import { Icon } from "../components/Icon";


export class PermissionIntroduction extends LiveComponent<any, any> {

  _interview : Interview;

  constructor(props) {
    super(props);
  }

  componentWillUnmount(): void {
  }


  getCards() : interviewCards {
    return {
      start: {
        header: "Let's talk Data!",
        subHeader: "Crownstone collects location data to enable indoor localization even when the app is closed or not in use.",
        explanation: "Localization can turn on your lights when you enter the room, even if your phone is in your pocket!\n\nWe use Crownstone's Bluetooth signals to determine where in the house you are.",
        optionsBottom: true,
        options: [
          {
            label: "I understand",
            onSelect: (result) => {
              return LocationHandler.initializeTracking().then(() => {
                if (Platform.OS === 'android') {
                  if (this.props.showAi) {
                    return 'ai'
                  }
                  core.eventBus.emit("userLoggedInFinished");
                  NavigationUtil.setRoot(Stacks.loggedIn());
                  return false;
                }
                return 'notifications';
              })
            }
          },
        ]
      },
      notifications: {
        header: "Can we ask you something?",
        backgroundImage: require("../../images/backgrounds/assistants.jpg"),
        subHeader: "We use notifications switch your Crownstones from the cloud, like for your voice assistants!",
        explanation: "We also use them to quickly update your app!",
        optionsBottom: true,
        options: [
          {
            label: "Sounds fair",
            onSelect: (result) => {
              LOG.info("Sync: Requesting notification permissions during Login.");
              NotificationHandler.request();
              if (this.props.showAi) {
                return 'ai'
              }
              core.eventBus.emit("userLoggedInFinished");
              NavigationUtil.setRoot(Stacks.loggedIn());
              return false;
            }
          },
        ]
      },
      ai: {
        header: "Let me introduce myself!",
        backgroundImage: require("../../images/backgrounds/lightBackground2_blur.jpg"),
        subHeader: "I'm your new smart home!\n\nWhat would you like to call me?",
        component: <View style={{...styles.centered, flex:1}}>
            <ScaledImage source={require("../../images/tutorial/Sphere_with_house.png")} sourceHeight={490} sourceWidth={490} targetHeight={0.3*availableModalHeight} />
          </View>,
        hasTextInputField: true,
        placeholder: randomAiName(),
        optionsBottom: true,
        options: [
          {
            label: "Nice to meet you!",
            nextCard: 'allSet',
            onSelect: (result) => {
              let name = result.textfieldState.trim();
              if (name.length === 0) {
                Alert.alert(
                  lang("I'd really like a name..."),
                  lang("Could you give me one?"),
                  [{text:lang("Sure!")}]
                );
                return false;
              }
              core.eventBus.emit("userLoggedInFinished");
              NavigationUtil.setRoot(Stacks.loggedIn())
            }
          },
        ]
      },
    }
  }


  render() {
    let backgroundImage = require("../../images/backgrounds/houseWithView.jpg")
    let textColor = colors.csBlueDark.hex;
    if (this._interview) {
      backgroundImage = this._interview.getBackgroundFromCard() || backgroundImage;
      textColor = this._interview.getTextColorFromCard() || textColor;
    }

    return (
      <AnimatedBackground fullScreen={true} image={backgroundImage} hideOrangeLine={true} hideNotifications={true} dimStatusBar={true}>
        <Interview
          height={screenHeight - 0.5*tabBarMargin - statusBarHeight}
          ref={     (i) => { this._interview = i; }}
          getCards={ () => { return this.getCards();}}
          update={   () => { this.forceUpdate() }}
        />
      </AnimatedBackground>
    );
  }
}
