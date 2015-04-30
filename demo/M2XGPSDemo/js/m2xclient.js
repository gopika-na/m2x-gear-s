/*    
 * Copyright (c) 2014 Samsung Electronics Co., Ltd.   
 * All rights reserved.   
 *   
 * Redistribution and use in source and binary forms, with or without   
 * modification, are permitted provided that the following conditions are   
 * met:   
 *   
 *     * Redistributions of source code must retain the above copyright   
 *        notice, this list of conditions and the following disclaimer.  
 *     * Redistributions in binary form must reproduce the above  
 *       copyright notice, this list of conditions and the following disclaimer  
 *       in the documentation and/or other materials provided with the  
 *       distribution.  
 *     * Neither the name of Samsung Electronics Co., Ltd. nor the names of its  
 *       contributors may be used to endorse or promote products derived from  
 *       this software without specific prior written permission.  
 *  
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS  
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT  
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR  
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT  
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,  
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT  
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,  
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY  
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT  
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE  
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define(['m2x', 'jquery'], function(M2X) {
    //requires AT&T M2X API v2
    var m2xclient,
        deviceID,
        duid;
    $(document).on("newlocationdata", function(event) {
        var m2xDeviceID = localStorage.getItem("m2x-device-id");
        if (m2xDeviceID !== null) {
            //console.log("Updating streams..." + JSON.stringify(event.message));
            if (true) { //update all 3 streams in one call
                m2xclient.device.postMultipleValues(m2xDeviceID, {
                    "latitude": [{
                            "timestamp": M2X.getISO8601Timestamp(event.time),
                            "value": event.message.coords.latitude
                        }
                    ],
                    "longitude": [{
                            "timestamp": M2X.getISO8601Timestamp(event.time),
                            "value": event.message.coords.longitude
                        }
                    ]
                }, function() {
                    console.log("postMultipleValues - Streams successfully updated.");
                }, function(error) {
                    console.log("postMultipleValues - error - " + JSON.stringify(error));
                });
            } else { //update the streams individually
                m2xclient.device.updateDataStreamValue(m2xDeviceID, "longitude", {
                    value: event.message.coords.longitude,
                    timestamp: M2X.getISO8601Timestamp(event.time)
                }, function() {
                    console.log("Longitude Stream updated");
                }, function(error) {
                    console.log("An error occurred while trying to update the Longitude stream. " + JSON.stringify(error));
                });
                m2xclient.device.updateDataStreamValue(m2xDeviceID, "latitude", {
                    value: event.message.coords.latitude,
                    timestamp: M2X.getISO8601Timestamp(event.time)
                }, function() {
                    console.log("Latitude Stream updated");
                }, function(error) {
                    console.log("An error occurred while trying to update the Latitude stream. " + JSON.stringify(error));
                });
            }
            //update the location tab
            m2xclient.device.updateLocation(m2xDeviceID, {
                "latitude": event.message.coords.latitude,
                "longitude": event.message.coords.longitude,
            }, function() {
                console.log("UpdateLocation succeeded - data can be viewed on the location tab / map");
            }, function(error) {
                console.log("UpdateLocation - error - " + JSON.stringify(error));
            });
        }
    });
    //Connect to M2X when the module is loaded
    console.log("WARNING - Make sure you enter your AT&T M2X Master Key in the m2xclient.js module.");
    m2xclient = new M2X({key:'EnterYourOwnMasterKeyhere'});
    //Use the device ID to identify the device
    duid = tizen.systeminfo.getCapabilities().duid;
    console.log("duid is " + duid);
    if (duid == '') {
        duid = 'duidtizenemulator';
        console.log("duid is blank; this is an emulator and we need to make up the duid: " + duid);
    }
    //Check if device has a Data Source ID stored locally
    var id = localStorage.getItem("m2x-device-id");
    console.log("Device ID is " + id);
    if (id === null) {
        console.log("Registering device...")
        //We haven't registered this device, let's do it...
        m2xclient.device.create({
            name: duid,
            visibility: "private"
        }, function(msg) {
            deviceID = msg.response.id;
            //Create the desired streams for the device
            m2xclient.device.updateStream(deviceID, "Longitude", {
                "unit": {
                    "label": "Longitude",
                    symbol: "Degrees"
                },
                "type": "numeric"
            }, function() {
                console.log("Longitude Stream successfully created");
                localStorage.setItem("m2x-device-id", deviceID);
            }, function(error) {
                console.log("An error occurred while trying to create the Longitude stream " + JSON.stringify(error));
            });
            m2xclient.device.updateStream(deviceID, "Latitude", {
                "unit": {
                    "label": "Latitude",
                    symbol: "Degrees"
                },
                "type": "numeric"
            }, function() {
                console.log("Latitude Stream successfully created");
            }, function(error) {
                console.log("An error occurred while trying to create the Latitude stream " + JSON.stringify(error));
            });
        }, function(error) {
            console.log("An error occurred while trying to create deviceID: " + JSON.stringify(error));
        });
    }
    return function() {}
});