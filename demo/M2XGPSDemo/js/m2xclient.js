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

define(['lib/m2x'],function(M2X) {

	var m2xclient,
		blueprintID,
		duid;
	$(document).on("newlocationdata", function(event) {

		var blueprintID = localStorage.getItem("m2x-blueprint-id");

		if (blueprintID !== null) {
			console.log("Updating streams..." + JSON.stringify(event.message));
			m2xclient.feed.updateDataStreamValue(blueprintID,"longitude",{value:event.message.coords.longitude,at: M2X.getISO8601Timestamp(event.time)}, function() {
				console.log("Longitude Stream updated");
			}, function(error) {
				console.log("An error ocurred while trying to update the Longitude stream. " + error);
			});
			m2xclient.feed.updateDataStreamValue(blueprintID,"latitude",{value:event.message.coords.latitude,at: M2X.getISO8601Timestamp(event.time)}, function() {
				console.log("Latitude Stream updated");
			}, function(error) {
				console.log("An error ocurred while trying to update the Latitude stream. " + error);
			});
			m2xclient.feed.updateDataStreamValue(blueprintID,"altitude",{value:event.message.coords.altitude,at: M2X.getISO8601Timestamp(event.time)}, function() {
				console.log("Altitude Stream updated");
			}, function(error) {
				console.log("An error ocurred while trying to update the Altitude stream. " + error);
			});
		    m2xclient.feed.updateLocation(blueprintID, {"latitude": event.message.coords.latitude, "longitude": event.message.coords.longitude,"elevation": event.message.coords.altitude}, function(r) {
		        console.log("UpdateLocation succeeded - data can be viewed on the location tab / map");
		    }, function(error) {
		        console.log("UpdateLocation - error - " + JSON.stringify(error));
		    });
		}
	});
	
	//Connect to M2X when the module is loaded
	m2xclient = new M2X({key:'EnterYourOwnMasterKeyhere'});
	//Use the device ID to identify the blueprint
	duid = tizen.systeminfo.getCapabilities().duid;
	if (duid == ''){
		duid = 'duidtizenemulator';
		console.log("Device ID is blank; this is an emulator and we need to make up the duid: " + duid);
	}
	
	//Check if device has a Data Source ID stored locally
	var id = localStorage.getItem("m2x-blueprint-id");
	console.log("blueprint ID " + id);

	if ( id === null ) {
		console.log("Creating blueprint...");
		//We haven't registered this device, let's do it...
		m2xclient.blueprint.create({name:duid,visibility:"private"},function(blueprint) {
			blueprintID = blueprint.response.id;
			//Creates stream for the blueprint. We could add this 
			//data source to an existing batch to inherit the streams
			//but this is just for demo purposes
			m2xclient.feed.updateStream(blueprintID,"Longitude",{ "unit": { "label": "Longitude", symbol: "Degrees" }, "type": "numeric" },function() {
						console.log("Longitude Stream successfully created");
						localStorage.setItem("m2x-blueprint-id",blueprintID);
					}, function(error) {
						console.log("An error ocurred while trying to create the Longitude stream " + error);
					});
			m2xclient.feed.updateStream(blueprintID,"Latitude",{ "unit": { "label": "Latitude", symbol: "Degrees" }, "type": "numeric" },function() {
						console.log("Latitude Stream successfully created");
						localStorage.setItem("m2x-blueprint-id",blueprintID);
					}, function(error) {
						console.log("An error ocurred while trying to create the Latitude stream " + error);
					});
			m2xclient.feed.updateStream(blueprintID,"Altitude",{ "unit": { "label": "Altitude", symbol: "ft" }, "type": "numeric" },function() {
						console.log("Altitude Stream successfully created");
						localStorage.setItem("m2x-blueprint-id",blueprintID);
					}, function(error) {
						console.log("An error ocurred while trying to create the Altitude stream " + error);
					});
		}, function(error) {
			console.log("An error ocurred while trying to create the blueprint " + JSON.stringify(error));
		});
	}
	
	return function() {}
	
});