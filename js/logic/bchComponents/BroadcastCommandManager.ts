import { Platform, AppState } from 'react-native'
import { BluenetPromiseWrapper } from "../../native/libInterface/BluenetPromise";
import { xUtil } from "../../util/StandAloneUtil";
import { core } from "../../core";
import { LOGd, LOGi } from "../../logging/Log";
import { BROADCAST_THROTTLE_TIME, MINIMUM_FIRMWARE_VERSION_BROADCAST } from "../../ExternalConfig";
import { Util } from "../../util/Util";
import { conditionMap } from "../../native/advertisements/StoneEntity";
import { Scheduler } from "../Scheduler";
import { Bluenet } from "../../native/libInterface/Bluenet";

export const BROADCAST_ERRORS = {
  CANNOT_BROADCAST:               { message: "CANNOT_BROADCAST",     fatal: false},
  BROADCAST_REMOVED_AS_DUPLICATE: { message: "BROADCAST_REMOVED_AS_DUPLICATE",     fatal: false},
  BROADCAST_INCOMPLETE:           { message: "BROADCAST_INCOMPLETE", fatal: false},
  BROADCAST_FAILED:               { message: "BROADCAST_FAILED",     fatal: false},
};

interface broadcastQueueItem {
  type: string,
  stoneId: string,
  command: commandSummary,
  resolver: any,
  rejecter: any,
}


class BroadcastCommandManagerClass {

  queue : broadcastQueueItem[] = [];
  timeLastBroadcast = 0;
  clearPendingCommandCallback = null;

  itemsWaitingForExecute = {};


  commandsToBroadcast = {
    multiSwitch: true,
    turnOn: true
  };

  broadcast(commandSummary : commandSummary, ignoreDuplicates = false) : Promise<bchReturnType> {
    if (!ignoreDuplicates) { this._checkforDuplicates(commandSummary); }

    // double check here, this api should be able to be used
    if (this.canBroadcast(commandSummary)) {
      switch (commandSummary.command.commandName) {
        case "multiSwitch":
          return this._broadCastMultiSwitch(commandSummary);
        case "turnOn":
          return this._broadcastTurnOn(commandSummary);
        default:
          return Promise.reject(BROADCAST_ERRORS.CANNOT_BROADCAST);
      }
    }
    else {
      return Promise.reject(BROADCAST_ERRORS.CANNOT_BROADCAST);
    }
  }

  _checkPendingCommands() {
    if (this.clearPendingCommandCallback !== null) {
      this.clearPendingCommandCallback();
      this.clearPendingCommandCallback = null;
    }

    // can we broadcast now? If not, then schedule another check.
    if (this.shouldWaitForBroadcast() && this.queue.length > 0) {
      return this._setPendingCommandCheck();
    }

    if (this.queue.length > 0) {
      let activeElement = this.queue[0];
      let wrapup = () => {
        this.queue.shift();
        if (this.queue.length > 0) {
          this._setPendingCommandCheck();
        }
      }

      this.broadcast(activeElement.command, true)
        .then((result) => {
          activeElement.resolver(result);
          wrapup();
        })
        .catch((err) => {
          activeElement.rejecter(err);
          wrapup();
        })
    }

  }

  _setPendingCommandCheck() {
    if (this.clearPendingCommandCallback === null) {
      this.clearPendingCommandCallback = Scheduler.scheduleCallback(
        () => { this.clearPendingCommandCallback = null; this._checkPendingCommands(); },
        BROADCAST_THROTTLE_TIME,
        "Loading Pending Command"
      );
    }
  }

  _broadcastTurnOn(commandSummary: commandSummary) : Promise<bchReturnType> {
    let {itemId, autoExecute} = this._handleAutoExecute(commandSummary);

    LOGi.broadcast("turnOn via broadcast");
    return new Promise((resolve, reject) => {
      let result : bchReturnType = {data:null};
      Scheduler.scheduleCallback(() => { resolve(result); }, 100, "auto resolve broadcast promise" );

      // ignore old states for a while
      core.eventBus.emit(Util.events.getIgnoreTopic(commandSummary.stoneId), {timeoutMs: 2000, conditions: [{type: conditionMap.SWITCH_STATE, expectedValue: 1}]});

      // broadcast
      BluenetPromiseWrapper.turnOnBroadcast(commandSummary.sphereId, commandSummary.stone.config.crownstoneId, autoExecute)
        .then(() => {
          delete this.itemsWaitingForExecute[itemId];
          LOGi.broadcast("Success broadcast turn On");
          return { data: null }
        })
        .catch((err) => {
          delete this.itemsWaitingForExecute[itemId];
          LOGi.broadcast("ERROR broadcast turn On");
        })
    })
  }

  _broadCastMultiSwitch(commandSummary) : Promise<bchReturnType> {
    let throttling = this.handleThrottling(commandSummary);
    if (throttling !== false) {
      return throttling;
    }

    let {itemId, autoExecute} = this._handleAutoExecute(commandSummary);

    LOGi.broadcast("Switching via broadcast");
    return new Promise((resolve, reject) => {
      let result : bchReturnType = {data:null};
      Scheduler.scheduleCallback(() => { resolve(result); }, 100, "auto resolve broadcast promise" );

      // ignore old states for a while
      core.eventBus.emit(Util.events.getIgnoreTopic(commandSummary.stoneId), {timeoutMs: 2000, conditions: [{type: conditionMap.SWITCH_STATE, expectedValue: commandSummary.command.state}]});

      // broadcast
      BluenetPromiseWrapper.broadcastSwitch(commandSummary.sphereId, commandSummary.stone.config.crownstoneId, commandSummary.command.state, autoExecute)
        .then(() => {
          delete this.itemsWaitingForExecute[itemId];
          LOGi.broadcast("Success broadcast", commandSummary.command.state);
          return { data: null }
        })
        .catch((err) => {
          delete this.itemsWaitingForExecute[itemId];
          LOGi.broadcast("ERROR broadcast", commandSummary.command.state);
          // reject(err);
        })
    })
  }

  _handleAutoExecute(commandSummary: commandSummary) {
    let itemId = xUtil.getShortUUID();

    let autoExecute = commandSummary.options?.autoExecute !== undefined ? commandSummary.options.autoExecute : true;
    if (autoExecute === false) {
      this.itemsWaitingForExecute[itemId] = true;
    }
    else {
      this.timeLastBroadcast = Date.now();
    }

    return {itemId, autoExecute};
  }

  shouldWaitForBroadcast() {
    return Date.now() - this.timeLastBroadcast < BROADCAST_THROTTLE_TIME;
  }

  handleThrottling(commandSummary : commandSummary) : Promise<bchReturnType> | false {
    // throttling
    // we do not throttle items that do not automatically execute
    if (commandSummary.options?.autoExecute === false) { return false; }

    if (this.shouldWaitForBroadcast()) {
      LOGd.broadcast("Scheduling broadcast for later");
      // if already a pending command check scheduled, we do not need to schedule another.
      this._setPendingCommandCheck();

      return new Promise((resolve, reject) => {
        this.queue.push({type: commandSummary.command.commandName, stoneId: commandSummary.stoneId, command: commandSummary, resolver: resolve, rejecter: reject})
      });
    }
    return false;
  }

  _checkforDuplicates(commandSummary : commandSummary) {
    for (let i = this.queue.length-1; i >= 0; i--) {
      // only most recent command of any type will be broadcast
      if (this.queue[i].type === commandSummary.command.commandName && commandSummary.stoneId === this.queue[i].stoneId) {
        LOGd.broadcast("Remove item from duplicate queue",i, this.queue[i].type)
        // fail the pending item
        this.queue[i].rejecter(BROADCAST_ERRORS.BROADCAST_REMOVED_AS_DUPLICATE);
        // remove from queue
        this.queue.pop();
      }
    }
  }

  execute() {
    if (Object.keys(this.itemsWaitingForExecute).length > 0) {
      Bluenet.broadcastExecute();
    }
  }

  canBroadcast(commandSummary : commandSummary) {
    let state = core.store.getState();
    if (!commandSummary.stone.config.firmwareVersion) {
      return false;
    }

    if (xUtil.versions.isLower(commandSummary.stone.config.firmwareVersion, MINIMUM_FIRMWARE_VERSION_BROADCAST)) {
      if (state.development.broadcasting_enabled === true) {
        // bypass
      }
      else {
        return false
      }
    }

    // check if this is a valid command
    if (!(commandSummary && commandSummary.command && commandSummary.command.commandName)) {
      return false;
    }


    if ((Platform.OS === 'ios' && AppState.currentState === 'active') || Platform.OS === 'android') {
      // allow broadcast attempt for whitelisted commands
      if (this.commandsToBroadcast[commandSummary.command.commandName] === true) {
        return true
      }
    }
    return false;
  }
}


export const BroadcastCommandManager = new BroadcastCommandManagerClass();