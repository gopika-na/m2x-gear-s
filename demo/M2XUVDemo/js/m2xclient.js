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

define(['lib/m2x-2.0.0'],function(M2X) {

	var m2xclient,
		deviceID,
		duid;
	
	//Push data to M2X every time we get new data from the sensor 
	$(document).on("newuvsensordata", function(event) {
		var m2xDeviceID = localStorage.getItem("m2x-device-id");

		if (m2xDeviceID !== null) {
			console.log("Updating stream...");
			m2xclient.device.updateDataStreamValue(m2xDeviceID,"uv",{"value":event.message,"timestamp": M2X.getISO8601Timestamp(event.time)}, function() {
				console.log("Stream updated");
			}, function(error) {
				console.log("An error occurred while trying to update the stream. " + JSON.stringify(error));
			});
		}
	});
	
	//Connect to M2X when the module is loaded
	m2xclient = new M2X({key:'YOUR_M2X_KEY_GOES_HERE'});
	//Use the device ID to identify the device in M2X
	duid = tizen.systeminfo.getCapabilities().duid;
	
	//Check if device has a M2X Device ID stored locally
	var id = localStorage.getItem("m2x-device-id");
	console.log("Device ID " + id);

	if ( id === null ) {
		console.log("Registering device...")
		//We haven't registered this device...
		m2xclient.device.create({name:duid,visibility:"private"},function(msg) {
			deviceID = msg.response.id;
			//Creates a stream for the device
			m2xclient.device.updateStream(deviceID,"uv",{ "unit": { "label": "UV Index", symbol: "UV Index" }, "type": "numeric" }, 
			   function() {
				console.log("Stream successfully created");
				localStorage.setItem("m2x-device-id",deviceID);
			}, function(error) {
				console.log("An error occurred while trying to create the stream " + JSON.stringify(error));
			});
		}, function(error) {
			console.log("An error occurred while trying to register the device in M2X " + JSON.stringify(error));
		});
	}
	
	//There's really nothing `public` we want to expose. Remember, this is just a demo
	return {}
});