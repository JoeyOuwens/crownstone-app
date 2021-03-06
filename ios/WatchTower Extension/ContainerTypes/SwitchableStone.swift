//
//  SwitchableStone.swift
//  WatchTower Extension
//
//  Created by Alex de Mulder on 22/11/2018.
//  Copyright © 2018 Alex de Mulder. All rights reserved.
//

import WatchKit
import BluenetWatch

class SwitchableStone {
    
    public var handle: String!
    public var name : String = "Unknown.."
    public var switchState : Float = 1.0
    public var rssi : Int8 = -67
    public var verified = false
    public var referenceId = "unknown"
    public var crownstoneId : UInt8 = 0
    
    public var mode = CrownstoneMode.unknown
    
    public var pendingAction = false
    
    public init(advertisement: Advertisement, verified: Bool) {
        self.fillValues(advertisement: advertisement, verified: verified)
    }
    
    public func update(advertisement: Advertisement, verified: Bool) {
        self.fillValues(advertisement: advertisement, verified: verified)
    }
    
    func fillValues(advertisement: Advertisement, verified: Bool) {
        self.handle = advertisement.handle
        self.rssi = advertisement.rssi.int8Value
        self.mode = advertisement.getOperationMode()
        self.verified = verified
        
        var nameSet = false
        if self.verified {
            if let refId = advertisement.referenceId {
                self.referenceId = refId
                if advertisement.scanResponse!.stateOfExternalCrownstone == false {
                    
                    nameSet = true
                    let switchState = advertisement.scanResponse!.switchState
                    self.crownstoneId = advertisement.scanResponse!.crownstoneId
        
                    self.name = sessionDelegate.getName(crownstoneId: NSNumber(value: self.crownstoneId).stringValue, referenceId: advertisement.referenceId)
                    dataStore.storeNameForHandle(advertisement.handle, name: self.name)
                    if switchState == 128 {
                        self.switchState = 1
                    }
                    else {
                        self.switchState = NSNumber(value: switchState).floatValue / 100.0
                    }
                }
            }
            else {
                //print("verified does not have a referenceId!")
            }
        }
        
        if nameSet == false {
            if let storedName = dataStore.getNameFromHandle(advertisement.handle) {
                self.name = storedName
            }
            else {
                self.name = "Scanning..."
            }
        }
    }
    
    public func getState() -> Bool {
        return self.switchState > 0.0
    }
    
    public func getRssi() -> String {
        return String(self.rssi)
    }
}
