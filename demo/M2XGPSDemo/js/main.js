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

define(['m2xclient', 'plot'], function(m, p) {

    $(document).ready(function() {

        var intervalID;

        document.addEventListener('tizenhwkey', function(e) {
            if (e.keyName == "back") {
                tizen.application.getCurrentApplication().exit();
                if (typeof intervalID !== 'undefined') {
                    clearInterval(intervalID);
                }
            }
        });

        if (navigator.geolocation) {
            console.log("Requesting location...");
            intervalID = setInterval(function() {
                navigator.geolocation.getCurrentPosition(function(locationData) {
                    console.log("Got location data: " + JSON.stringify(locationData));
                    $.event.trigger({
                        type: "newlocationdata",
                        message: locationData,
                        time: new Date()
                    });
                }, function(error) {
                    console.log("error! " + JSON.stringify(error));
                });
            }, 30000);

        } else {
            console.log("Geolocation is not supported by this device (or emulator).  Generating fake data for development purposes...");
            //The following section contain code that generates fake location data
            //This is intended for development purposes only to generate interesting data when using the Tizen emulator 
            //(the Emulator does not support Location calls)
        	function randomBetween(min,max){return Math.random()*(max-min+1)+min;};
            intervalID = setInterval(function() {
                var fakeLocationData = {
                    coords: {
                        longitude: Number(-randomBetween(122.5, 123).toFixed(12)), //Puget Sound area
                        latitude: Number(randomBetween(47.5, 48).toFixed(12)),
                        altitude: Math.floor(randomBetween(-300, 30000)) // Death Valley at -282 feet (below sea level)
                    },
                };
                console.log("Faked location data: " + JSON.stringify(fakeLocationData));
                $.event.trigger({
                    type: "newlocationdata",
                    message: fakeLocationData,
                    time: new Date()
                });
            }, 30000);
        }
    });
});