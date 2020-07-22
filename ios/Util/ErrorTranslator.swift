//
//  ErrorTranslator.swift
//  Crownstone
//
//  Created by Alex de Mulder on 21/11/2017.
//  Copyright © 2017 Crownstone. All rights reserved.
//

import Foundation
import BluenetLib

func getBluenetErrorString(_ err: BluenetError) -> String {
  switch err {
  case .DISCONNECTED:
    return "DISCONNECTED"
  case .CONNECTION_CANCELLED:
    return "CONNECTION_CANCELLED"
  case .CONNECTION_FAILED:
    return "CONNECTION_FAILED"
  case .NOT_CONNECTED:
    return "NOT_CONNECTED"
  case .NO_SERVICES:
    return "NO_SERVICES"
  case .NO_CHARACTERISTICS:
    return "NO_CHARACTERISTICS"
  case .SERVICE_DOES_NOT_EXIST:
    return "SERVICE_DOES_NOT_EXIST"
  case .CHARACTERISTIC_DOES_NOT_EXIST:
    return "CHARACTERISTIC_DOES_NOT_EXIST"
  case .WRONG_TYPE_OF_PROMISE:
    return "WRONG_TYPE_OF_PROMISE"
  case .INVALID_UUID:
    return "INVALID_UUID"
  case .NOT_INITIALIZED:
    return "NOT_INITIALIZED"
  case .CANNOT_SET_TIMEOUT_WITH_THIS_TYPE_OF_PROMISE:
    return "CANNOT_SET_TIMEOUT_WITH_THIS_TYPE_OF_PROMISE"
  case .TIMEOUT:
    return "TIMEOUT"
  case .DISCONNECT_TIMEOUT:
    return "DISCONNECT_TIMEOUT"
  case .CANCEL_PENDING_CONNECTION_TIMEOUT:
    return "CANCEL_PENDING_CONNECTION_TIMEOUT"
  case .CONNECT_TIMEOUT:
    return "CONNECT_TIMEOUT"
  case .GET_SERVICES_TIMEOUT:
    return "GET_SERVICES_TIMEOUT"
  case .GET_CHARACTERISTICS_TIMEOUT:
    return "GET_CHARACTERISTICS_TIMEOUT"
  case .READ_CHARACTERISTIC_TIMEOUT:
    return "READ_CHARACTERISTIC_TIMEOUT"
  case .WRITE_CHARACTERISTIC_TIMEOUT:
    return "WRITE_CHARACTERISTIC_TIMEOUT"
  case .ENABLE_NOTIFICATIONS_TIMEOUT:
    return "ENABLE_NOTIFICATIONS_TIMEOUT"
  case .DISABLE_NOTIFICATIONS_TIMEOUT:
    return "DISABLE_NOTIFICATIONS_TIMEOUT"
  case .CANNOT_WRITE_AND_VERIFY:
    return "CANNOT_WRITE_AND_VERIFY"
  case .CAN_NOT_CONNECT_TO_UUID:
    return "CAN_NOT_CONNECT_TO_UUID"
  case .COULD_NOT_FACTORY_RESET:
    return "COULD_NOT_FACTORY_RESET"
  case .INVALID_SESSION_DATA:
    return "INVALID_SESSION_DATA"
  case .NO_SESSION_NONCE_SET:
    return "NO_SESSION_NONCE_SET"
  case .COULD_NOT_VALIDATE_SESSION_NONCE:
    return "COULD_NOT_VALIDATE_SESSION_NONCE"
  case .INVALID_SIZE_FOR_ENCRYPTED_PAYLOAD:
    return "INVALID_SIZE_FOR_ENCRYPTED_PAYLOAD"
  case .INVALID_SIZE_FOR_SESSION_NONCE_PACKET:
    return "INVALID_SIZE_FOR_SESSION_NONCE_PACKET"
  case .INVALID_PACKAGE_FOR_ENCRYPTION_TOO_SHORT:
    return "INVALID_PACKAGE_FOR_ENCRYPTION_TOO_SHORT"
  case .INVALID_KEY_FOR_ENCRYPTION:
    return "INVALID_KEY_FOR_ENCRYPTION"
  case .DO_NOT_HAVE_ENCRYPTION_KEY:
    return "DO_NOT_HAVE_ENCRYPTION_KEY"
  case .COULD_NOT_ENCRYPT:
    return "COULD_NOT_ENCRYPT"
  case .COULD_NOT_ENCRYPT_KEYS_NOT_SET:
    return "COULD_NOT_ENCRYPT_KEYS_NOT_SET"
  case .COULD_NOT_DECRYPT_KEYS_NOT_SET:
    return "COULD_NOT_DECRYPT_KEYS_NOT_SET"
  case .COULD_NOT_DECRYPT:
    return "COULD_NOT_DECRYPT"
  case .CAN_NOT_GET_PAYLOAD:
    return "CAN_NOT_GET_PAYLOAD"
  case .USERLEVEL_IN_READ_PACKET_INVALID:
    return "USERLEVEL_IN_READ_PACKET_INVALID"
  case .READ_SESSION_NONCE_ZERO_MAYBE_ENCRYPTION_DISABLED:
    return "READ_SESSION_NONCE_ZERO_MAYBE_ENCRYPTION_DISABLED"
  case .NOT_IN_RECOVERY_MODE:
    return "NOT_IN_RECOVERY_MODE"
  case .CANNOT_READ_FACTORY_RESET_CHARACTERISTIC:
    return "CANNOT_READ_FACTORY_RESET_CHARACTERISTIC"
  case .RECOVER_MODE_DISABLED:
    return "RECOVER_MODE_DISABLED"
  case .INVALID_TX_POWER_VALUE:
    return "INVALID_TX_POWER_VALUE"
  case .NO_KEEPALIVE_STATE_ITEMS:
    return "NO_KEEPALIVE_STATE_ITEMS"
  case .NO_SWITCH_STATE_ITEMS:
    return "NO_SWITCH_STATE_ITEMS"
  case .DFU_OVERRULED:
    return "DFU_OVERRULED"
  case .DFU_ABORTED:
    return "DFU_ABORTED"
  case .DFU_ERROR:
    return "DFU_ERROR"
  case .COULD_NOT_FIND_PERIPHERAL:
    return "COULD_NOT_FIND_PERIPHERAL"
  case .PACKETS_DO_NOT_MATCH:
    return "PACKETS_DO_NOT_MATCH"
  case .NOT_IN_DFU_MODE:
    return "NOT_IN_DFU_MODE"
  case .REPLACED_WITH_OTHER_PROMISE:
    return "REPLACED_WITH_OTHER_PROMISE"
  case .INCORRECT_RESPONSE_LENGTH:
    return "INCORRECT_RESPONSE_LENGTH"
  case .UNKNOWN_TYPE:
    return "UNKNOWN_TYPE"
  case .INCORRECT_SCHEDULE_ENTRY_INDEX:
    return "INCORRECT_SCHEDULE_ENTRY_INDEX"
  case .INCORRECT_DATA_COUNT_FOR_ALL_TIMERS:
    return "INCORRECT_DATA_COUNT_FOR_ALL_TIMERS"
  case .NO_SCHEDULE_ENTRIES_AVAILABLE:
    return "NO_SCHEDULE_ENTRIES_AVAILABLE"
  case .NO_TIMER_FOUND:
    return "NO_TIMER_FOUND"
  case .ERROR_DISCONNECT_TIMEOUT:
    return "ERROR_DISCONNECT_TIMEOUT"
  case .AWAIT_DISCONNECT_TIMEOUT:
    return "AWAIT_DISCONNECT_TIMEOUT"
  case .NOTIFICATION_STREAM_TIMEOUT:
    return "NOTIFICATION_STREAM_TIMEOUT"
  case .PROCESS_ABORTED_WITH_ERROR:
    return "PROCESS_ABORTED_WITH_ERROR"
  case .UNKNOWN_PROCESS_TYPE:
    return "UNKNOWN_PROCESS_TYPE"
  case .INVALID_INPUT:
    return "INVALID_INPUT"
  case .INVALID_SESSION_REFERENCE_ID:
    return "INVALID_SESSION_REFERENCE_ID"
  case .SETUP_FAILED:
    return "SETUP_FAILED"
  case .INVALID_BROADCAST_ACCESS_LEVEL:
    return "INVALID_BROADCAST_ACCESS_LEVEL"
  case .INVALID_BROADCAST_LOCATION_ID:
    return "INVALID_BROADCAST_LOCATION_ID"
  case .INVALID_BROADCAST_PROFILE_INDEX:
    return "INVALID_BROADCAST_PROFILE_INDEX"
  case .INVALID_BROADCAST_PAYLOAD_SIZE:
    return "INVALID_BROADCAST_PAYLOAD_SIZE"
  case .BROADCAST_ERROR:
    return "BROADCAST_ERROR"
  case .BROADCAST_ABORTED:
    return "BROADCAST_ABORTED"
  case .BLE_RESET:
    return "BLE_RESET"
    

    case .BEHAVIOUR_INDEX_OUT_OF_RANGE:
      return "BEHAVIOUR_INDEX_OUT_OF_RANGE"
    case .BEHAVIOUR_INVALID:
      return "BEHAVIOUR_INVALID"
    case .BEHAVIOUR_INVALID_RESPONSE:
      return "BEHAVIOUR_INVALID_RESPONSE"
    case .BEHAVIOUR_NOT_FOUND_AT_INDEX:
      return "BEHAVIOUR_NOT_FOUND_AT_INDEX"
    case .PROFILE_INDEX_MISSING:
      return "PROFILE_INDEX_MISSING"
    case .TYPE_MISSING:
      return "TYPE_MISSING"
    case .DATA_MISSING:
      return "DATA_MISSING"
    case .ACTIVE_DAYS_MISSING:
      return "ACTIVE_DAYS_MISSING"
    case .ACTIVE_DAYS_INVALID:
      return "ACTIVE_DAYS_INVALID"
    case .NO_ACTIVE_DAYS:
      return "NO_ACTIVE_DAYS"
    case .BEHAVIOUR_ACTION_MISSING:
      return "BEHAVIOUR_ACTION_MISSING"
    case .BEHAVIOUR_TIME_MISSING:
      return "BEHAVIOUR_TIME_MISSING"
    case .BEHAVIOUR_INTENSITY_MISSING:
      return "BEHAVIOUR_INTENSITY_MISSING"
    case .TWILIGHT_CANT_HAVE_PRESENCE:
      return "TWILIGHT_CANT_HAVE_PRESENCE"
    case .TWILIGHT_CANT_HAVE_END_CONDITION:
      return "TWILIGHT_CANT_HAVE_END_CONDITION"
    case .NO_TIME_TYPE:
      return "NO_TIME_TYPE"
    case .INVALID_TIME_TYPE:
      return "INVALID_TIME_TYPE"
    case .MISSING_TO_TIME:
      return "MISSING_TO_TIME"
    case .MISSING_FROM_TIME:
      return "MISSING_FROM_TIME"
    case .MISSING_TO_TIME_TYPE:
      return "MISSING_TO_TIME_TYPE"
    case .MISSING_FROM_TIME_DATA:
      return "MISSING_FROM_TIME_DATA"
    case .MISSING_TO_TIME_DATA:
      return "MISSING_TO_TIME_DATA"
    case .MISSING_FROM_TIME_TYPE:
      return "MISSING_FROM_TIME_TYPE"
    case .INVALID_TIME_FROM_TYPE:
      return "INVALID_TIME_FROM_TYPE"
    case .INVALID_TIME_TO_TYPE:
      return "INVALID_TIME_TO_TYPE"
    case .INVALID_FROM_DATA:
      return "INVALID_FROM_DATA"
    case .INVALID_TO_DATA:
      return "INVALID_TO_DATA"
    case .INVALID_PRESENCE_TYPE:
      return "INVALID_PRESENCE_TYPE"
    case .NO_PRESENCE_TYPE:
      return "NO_PRESENCE_TYPE"
    case .NO_PRESENCE_DATA:
      return "NO_PRESENCE_DATA"
    case .NO_PRESENCE_DELAY:
      return "NO_PRESENCE_DELAY"
    case .NO_PRESENCE_LOCATION_IDS:
      return "NO_PRESENCE_LOCATION_IDS"
    case .NO_END_CONDITION_TYPE:
      return "NO_END_CONDITION_TYPE"
    case .NO_END_CONDITION_PRESENCE:
      return "NO_END_CONDITION_PRESENCE"
    case .NO_END_CONDITION_DURATION:
      return "NO_END_CONDITION_DURATION"
    case .COULD_NOT_GET_LOCATION:
      return "COULD_NOT_GET_LOCATION"
    case .INVALID_DATA_LENGTH:
      return "INVALID_DATA_LENGTH"
    case .FIRMWARE_TOO_OLD:
      return "FIRMWARE_TOO_OLD"
    case .ERR_ALREADY_EXISTS:
      return "ERR_ALREADY_EXISTS"
    case .INVALID_DATA:
      return "INVALID_DATA"
    case .INVALID_STARTING_POSITION:
      return "INVALID_STARTING_POSITION"
    case .CANNOT_DO_THIS_IN_DFU_MODE:
      return "CANNOT_DO_THIS_IN_DFU_MODE"
    case .INVALID_SOFT_ON_SPEED_VALUE:
      return "INVALID_SOFT_ON_SPEED_VALUE"
    
      case .UNKNOWN_ERROR:
        return "UNKNOWN_ERROR"
      case .ERR_TIMEOUT:
        return "ERR_TIMEOUT"
      case .ERR_CANCELLED:
        return "ERR_CANCELLED"
      case .ERR_PROTOCOL_UNSUPPORTED:
        return "ERR_PROTOCOL_UNSUPPORTED"
      case .ERR_NO_ACCESS:
        return "ERR_NO_ACCESS"
    }
}
