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

define(['jquery', 'jquery-ui-map', 'async!http://maps.google.com/maps/api/js?sensor=true&key=EnterYourGoogleMapAPIKeyhere'], function($) {
    //This module fetches the appropriate map from google.com and plots the current location
	var map;
	var mapInitialized = false;
	var mapMarker;
    //IMPORTANT:
    // 1) Get your Google Map API key at https://developers.google.com/maps/documentation/javascript/tutorial#api_key 
    // 2) Enter it above instead of the keyword EnterYourGoogleMapAPIKeyhere
    console.log("WARNING - Make sure you enter your Google Map Key in the locdata_map.js module.");
    $(document).on("newlocationdata", function(event) {
        if (mapInitialized == true) {
            //move the marker to the new location
            mapMarker.setPosition({lat: event.message.coords.latitude,lng: event.message.coords.longitude});
            //center map on new location
            map.setCenter({lat: event.message.coords.latitude,lng: event.message.coords.longitude});
        } else {
            console.log("Initializing the map...");
            var mapOptions = {
                zoom: 16, // 7 = regional; higher value = more details
                //MapTypeId:
                //	ROADMAP   (default) road map view
                //	SATELLITE Google Earth satellite images
                //	HYBRID    Mixture of normal and satellite views
                //	TERRAIN   Physical map based on terrain information
                mapTypeId: google.maps.MapTypeId.SATELLITE,
                center: {
                    lat: event.message.coords.latitude,
                    lng: event.message.coords.longitude
                },
                disableDefaultUI: true
            };
            map = new google.maps.Map(document.getElementById("mapcanvas"), mapOptions);
            mapMarker = new google.maps.Marker({
                position: {
                    lat: event.message.coords.latitude,
                    lng: event.message.coords.longitude
                },
                map: map
            });
            mapInitialized = true;
        }
    });
});