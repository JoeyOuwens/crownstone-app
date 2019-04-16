import * as React from 'react'; import { Component } from 'react';
import {
  Platform,
} from 'react-native';
import { StoreManager }    from './store/storeManager'
import { BackgroundProcessHandler } from '../backgroundProcesses/BackgroundProcessHandler'
import SplashScreen        from 'react-native-splash-screen'
import { Splash }          from "../views/startupViews/Splash";
import { core } from "../core";
import { NavigationUtil } from "../util/NavigationUtil";


export class Initializer extends Component<any, any> {
  unsubscribe = [];

  constructor(props) {
    super(props);

    let startUp = () => {
      if (Platform.OS === "android") {
        SplashScreen.hide();
      }

      // This is a last chance fallback if a user is new but has for some reason never been marked as "not New"
      let store = StoreManager.getStore();
      let state = store.getState();
      core.store = store;
      core.storeInitialized = true;
      // this should have been covered by the naming of the AI. This is a fallback.
      if (state.user.accessToken !== null && state.user.isNew !== false) {
        store.dispatch({type:'USER_UPDATE', data: {isNew: false}});
        core.eventBus.emit("userLoggedInFinished");
      }

      if (BackgroundProcessHandler.userLoggedIn) {
        NavigationUtil.navigate("AppBase");
      }
      else {
        NavigationUtil.navigate("NewUser");
      }
    };

    if (BackgroundProcessHandler.storePrepared === true) {
      startUp();
    }
    else {
      this.unsubscribe.push(
        core.eventBus.on('storePrepared', () => {
          startUp();
        })
      );
    }
  }


  componentWillUnmount() { // cleanup
    this.cleanUp();
  }



  cleanUp() {
    this.unsubscribe.forEach((callback) => {callback()});
    this.unsubscribe = [];
  }

  render() {
    return <Splash />;
  }
}

