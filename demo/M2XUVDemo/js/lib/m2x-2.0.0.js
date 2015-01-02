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

//Using almond's way (https://github.com/jrburke/almond) to detect if 
//we can participate as a module if an AMD module is available
(function(root,factory) {
    if (typeof define === 'function') {
        if (define.amd) {
            //AMD loader
            define(factory);
        } else {
            //Are we dealing with Tizen core.js AMD loader?
            //Tizen core.js does not identifies itself as an AMD loader
            try {
                define({
                    name:'m2x',
                    def: factory
                });
            } catch(e) {
                //Last resort, polluting global
                root.M2X = factory();
            }
        }
    } else {
        root.M2X = factory();
    }
}(this, function() {

    /**
     * Tizen JavaScript library for AT&T M2X platform. This library will try to participate as a module if an AMD loader is available
     * @class M2X
     * @constructor
     * @param {Object} options A object containing the following properties</br>
     * <b>key</b>: M2X API key (String,required). Error will be thrown if key is not provided</br>
     * <b>forward_errors</b>: (Boolean).If true, errors will be forwarded to the successful callback (if provided)</br>
     * 
     * Example:
     * 
     * 	var myM2X = new M2X({key:'yourm2xkeygoeshere'});
     * 
     * Unless stated otherwise, all functions in this library are asynchronous and a callback function should be provided. 
     * Callback signature
     * 
     * 	onSuccess(result) where result is an object with following attributes
     * 		result.status = HTTP code returned by M2X API
     * 		result.response = JSON encoded response.        
     * All functions accept an optional onError callback. Errors can be forwarded to the onSuccess callback by setting the 'forward_errors' attribute to true in the constructor
     */
    var M2XAPI = function (options) {
        var 
        cfg = {
                base_end_point : "https://api-m2x.att.com/v2",
                key : undefined,
                forward_errors : false
        }, 
        Utils = {
            /*
             * Checks if the argument is an object
             */
            isObj : function (obj) {
                return (Object.prototype.toString.call(obj) === '[object Object]');
            },
            
            /*
             * Checks if argument is a function
             */
            isFunc : function (f) {
                return (typeof f === 'function');
            },
            
            /*
             * Checks if argument is an array
             */
            isArray : function (a) {
                return (Object.prototype.toString.call(a) === '[object Array]');    	
            },
            
           /*
            * Checks if argument is a string
            */
            isString : function (s) {
                return (typeof s === 'string');
            },
            
            /*
             * Checks if argument is a Date object
             */
            isDate : function(d) {
                return (Object.prototype.toString.call(obj) === '[object Date]');
            },
            
            /*
             * Checks if argument is an object and has the properties 
             * defined in arguments `props`
             */
            checkObjectHasProperties : function (obj,props) {
                if (!Utils.isObj(obj)) {
                    throw new Error("Parameter mismatch. " + obj + " is not an object");
                }
                props.forEach(function(prop) {
                    if (!obj.hasOwnProperty(prop) || typeof obj[prop] === 'undefined' || Object.prototype.toString.call(obj[prop]) === '[object Null]') {
                        throw new Error("Object must have a property " + prop + " and contain a valid value");
                    }
                });
            },

            /*
             * Formats a string. From SO (http://stackoverflow.com/a/4673436) 
             * with a tweak to encode URL params
             */		    
            formatURL : function() {
                var args = arguments;
                return args[0].replace(/\{(\d+)\}/g, function(match, number) { 
                  return typeof args[number] !== 'undefined'
                    ? encodeURIComponent(args[number])
                    : match
                  ;
                });		    	
            }
        },
        api = {};
        
        if (typeof options === 'undefined' || typeof options['key'] === 'undefined' || !Utils.isString(options['key'])) {
            throw new Error("A valid M2X Key must be provided");
        }

        cfg.key = options.key;

        /*
         * HTTP requests handler
         */
        function request(args) {
            var xhr = new XMLHttpRequest(),
                url,
                param;

            if (typeof args.body !== 'undefined') {
                if (!Utils.isObj(args.body)) {
                    throw new Error("Request body should be an object");
                }
            }
                            
            url = cfg.base_end_point + args.path;

            if (Utils.isObj(args.urlparams)) {
                url +=  "?";
                //Note: M2X will ignore invalid arguments
                for (param in args.urlparams) {
                    url += encodeURIComponent(param) + "=" + encodeURIComponent(args.urlparams[param]) + "&";
                }
                url = url.slice(0,-1);
            }
            
            xhr.open(args.verb,url,true);
            xhr.setRequestHeader("X-M2X-KEY",cfg.key);
            
            if (typeof args.body !== 'undefined') {
                //If body will be added to the request, content type should be set to JSON
                xhr.setRequestHeader("Content-Type","application/json");
            } else {
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            }
            
            xhr.onreadystatechange = function() {
                var response;
                if (xhr.readyState === 4) {
                    if (!cfg.forward_errors) {
                        if (xhr.status === 200 || xhr.status === 201 || xhr.status === 202 || xhr.status === 204) {
                            if (Utils.isFunc(args.onSuccess)) {
                                response = {
                                    status : xhr.status,
                                    response : xhr.responseText ? JSON.parse(xhr.responseText) : {}
                                };
                                args.onSuccess.apply({}, [response]);
                            }					
                        } else {
                            if (Utils.isFunc(args.onError)) {
                                response = {
                                    status : xhr.status,
                                    response : xhr.responseText ? JSON.parse(xhr.responseText) : {}
                                };
                                args.onError.apply({},[response]);
                            }
                        }
                    } else {
                        if (Utils.isFunc(args.onSuccess)) {
                            response = {
                                status : xhr.status,
                                response : xhr.responseText ? JSON.parse(xhr.responseText) : {}
                            };
                            args.onSuccess.apply({}, [response]);
                        }
                    }
                }
            };
            
            xhr.send(JSON.stringify(args.body) || '');
        }


        /**
         * M2X Device API facade
         * @class M2X.device
         *
         */
        api.device = {
            /**
             * Retrieve the list of devices accessible by the authenticated API key that meet the search criteria.
             * @method search
             * @async
             * @param {Object} [options] Search options. See https://m2x.att.com/developer/documentation/v2/device#List-Search-Devices for details.
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            search : function (options,cbS,cbE) {
                var onSuccess = cbS,
                    onError = cbE;
                
                if (Utils.isFunc(options)) {
                    onSuccess = options;
                    if (Utils.isFunc(cbS)) {
                        onError = cbS;
                    }
                }
                request({verb:"GET", path: "/devices", urlparams : options, onSuccess : onSuccess, onError: onError});
            },
            /**
             * Retrieve the list of device groups for the authenticated user.
             * @method searchDeviceGroups
             * @async
             * @param {Object} [options] Search options. See https://m2x.att.com/developer/documentation/v2/device#List-Device-Groups for details.
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            searchDeviceGroups : function (options,cbS,cbE) {
                var onSuccess = cbS,
                    onError = cbE;
                
                if (Utils.isFunc(options)) {
                    onSuccess = options;
                    if (Utils.isFunc(cbS)) {
                        onError = cbS;
                    }
                }
                request({verb:"GET", path: "/devices/groups", urlparams : options, onSuccess : onSuccess, onError: onError});
            },
            /**
             * Creates a new device
             * @method create
             * @async
             * @param {Object} device Device object. An error will be thrown if name(String) or visibility(either 'public' or 'private') are not provided
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            create : function (device,cbS,cbE) {
                Utils.checkObjectHasProperties(device,['name','visibility']);
                
                request({verb:"POST", path: "/devices", body: device, onSuccess: cbS, onError: cbE}); 
            },
            /**
             * Updates an existing Device's information. 
             * @method update
             * @async
             * @param {String} id Device ID
             * @param {Object} device Device object. An error will be thrown if name(String) or visibility(either 'public' or 'private') are not provided
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            update : function (id,device,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }

                Utils.checkObjectHasProperties(device,['name','visibility']);
                
                request({verb:"PUT", path: Utils.formatURL("/devices/{1}",id), body: device, onSuccess: cbS, onError: cbE}); 
            },
            /**
             * Gets details of an existing Device
             * @method getDetails
             * @async
             * @param {String} id Device ID
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getDetails : function (id,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                request({verb:"GET", path: Utils.formatURL("/devices/{1}",id), onSuccess : cbS, onError: cbE});
            },
            /**
             * Gets location details of an existing Device
             * @method getLocation
             * @async
             * @param {String} id Device ID
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             * @
             */
            getLocation : function(id,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                request({verb:"GET", path: Utils.formatURL("/devices/{1}/location",id), onSuccess : cbS, onError: cbE});
            },
            /**
             * Updates the current location of the specified device
             * @method updateLocation
             * @async
             * @param {String} id Device ID
             * @param {Object} location Location object. An error will be thrown if latitude(number) or longitude(number) are not provided. See https://m2x.att.com/developer/documentation/v2/device#Update-Device-Location for details
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            updateLocation : function(id,location,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                Utils.checkObjectHasProperties(location,['latitude','longitude']);
                
                request({verb:"PUT", path: Utils.formatURL("/devices/{1}/location",id), body : location, onSuccess : cbS, onError: cbE});
            },
            /**
             * Retrieves a list of data streams associated with the specified device
             * @method getDatastreams
             * @async
             * @param {String} id Device ID
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getDataStreams : function(id,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                request({verb:"GET", path: Utils.formatURL("/devices/{1}/streams",id), onSuccess : cbS, onError: cbE});	        	
            },
            /**
             * Updates a data stream associated with the specified device (if a stream with this name does not exist it gets created).
             * @method updateStream
             * @async
             * @param {String} id Device ID
             * @param {String} name Data stream name. No spaces or special characters allowed.
             * @param {Object} [stream] Create/Update parameters: unit and type. If no parameters are provided, stream type will be numeric by default and no unit will be associated to this stream. See https://m2x.att.com/developer/documentation/v2/device#Create-Update-Data-Stream for details.
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            updateStream : function(id,name,stream,cbS,cbE) {
                
                var body = stream, 
                    onSuccess = cbS, 
                    onError = cbE;

                if (Utils.isFunc(stream)) {
                    body = {};
                    onSuccess = stream;
                    onError = cbS;
                }
                
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(name) || name.indexOf(' ') >= 0) {
                    throw new Error("Stream name should be a string and not include spaces");
                }
                
                request({verb:"PUT", path: Utils.formatURL("/devices/{1}/streams/{2}",id,name), body : body, onSuccess : onSuccess, onError: onError});
            },
            /**
             * Updates the current stream value of the specified stream
             * @method updateDataStreamValue
             * @async
             * @param {String} id Device ID
             * @param {String} name Data stream name
             * @param {Object} streamValue Should contain the 'value' property with the new stream value. A timestamp can be optionally provided by adding the 'timestamp' property in the object.
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            updateDataStreamValue : function(id,name,streamValue,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(name) || name.indexOf(' ') >= 0) {
                    throw new Error("Stream name should be a string and not include spaces");
                }

                Utils.checkObjectHasProperties(streamValue,['value']);
                request({verb:"PUT", path: Utils.formatURL("/devices/{1}/streams/{2}/value",id,name), body : streamValue, onSuccess : cbS, onError: cbE});
            },
            /**
             * Gets details of a specific data stream associated with an existing device.
             * @method getDataStreamDetails
             * @async
             * @param {String} id Device ID
             * @param {String} name Data stream name
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getDataStreamDetails : function (id,name,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(name) || name.indexOf(' ') >= 0) {
                    throw new Error("Stream name should be a string and not include spaces");
                }
                
                request({verb:"GET", path: Utils.formatURL("/devices/{1}/streams/{2}",id,name), onSuccess : cbS, onError: cbE});
            },
            /**
             * List values from an existing data stream associated with a specific device, sorted in reverse chronological order (most recent values first).
             * @method getDataStreamValues
             * @async
             * @param {String} id Device ID
             * @param {String} name Data stream name
             * @param {Object} [options] Filter options. See https://m2x.att.com/developer/documentation/v2/device#List-Data-Stream-Values for details
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getDataStreamValues :  function(id,name,options,cbS,cbE) {
                var urlparams = options,
                    onSuccess = cbS,
                    onError = cbE;
                
                if (Utils.isFunc(urlparams)) {
                    urlparams = {};
                    onSuccess = options;
                    onError = cbS;
                }
                
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(name) || name.indexOf(' ') >= 0) {
                    throw new Error("Stream name should be a string and not include spaces");
                }
                request({verb:"GET", path: Utils.formatURL("/devices/{1}/streams/{2}/values.json",id,name), urlparams: urlparams, onSuccess : onSuccess, onError: onError});
            },
            /**
             * Return count, min, max, average and standard deviation stats for the values on an existing data stream. <br>Note: This endpoint <b>only</b> works for numeric streams.
             * @method getDataStreamStats
             * @async
             * @param {String} id Device ID
             * @param {String} name Data stream name
             * @param {Object} [options] Filter options. See https://m2x.att.com/developer/documentation/v2/device#Data-Stream-Stats for details
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getDataStreamStats : function(id,name,options,cbS,cbE) {
                var urlparams = options,
                    onSuccess = cbS,
                    onError = cbE;
                
                if (Utils.isFunc(urlparams)) {
                    urlparams = {};
                    onSuccess = options;
                    onError = cbS;
                }
                
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(name) || name.indexOf(' ') >= 0) {
                    throw new Error("Stream name should be a string and not include spaces");
                }
                request({verb:"GET", path: Utils.formatURL("/devices/{1}/streams/{2}/stats",id,name), urlparams: urlparams, onSuccess : onSuccess, onError: onError});
            },
            /**
             * Posts timestamped values to an existing data stream associated with a specific device.
             * @method postDataStreamValues
             * @async
             * @param {String} id Device ID
             * @param {String} name Data stream name
             * @param {Array} values An array of objects. Each object should contain the attributes 'timestamp' (in ISO8601 format) and 'value'.
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            postDataStreamValues : function(id,name,values,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(name) || name.indexOf(' ') >= 0) {
                    throw new Error("Stream name should be a string and not include spaces");
                }
                if (Utils.isArray(values)) {
                    values.forEach(function(v) {
                        Utils.checkObjectHasProperties(v,['timestamp','value']);
                    });
                } else {
                    throw new Error("Values should be an array of objects");
                }
                request({verb:"POST", path: Utils.formatURL("/devices/{1}/streams/{2}/values",id,name), body : {values: values}, onSuccess : cbS, onError: cbE});
            },
            /**
             * Deletes values in a stream by a date range.
             * @method deleteDataStreamValues
             * @async
             * @param {String} id Device ID
             * @param {String} name Data stream name
             * @param {Object} range An object containing the date range. An error will be thrown if 'from' (timestamp in ISO 8601 format) or 'end' (timestamp in ISO 8601 format) are not provided.
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            deleteDataStreamValues :  function(id,name,parameters,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(name) || name.indexOf(' ') >= 0) {
                    throw new Error("Stream name should be a string and not include spaces");
                }
                Utils.checkObjectHasProperties(parameters,['from','end']);
                request({verb:"DELETE", path: Utils.formatURL("/devices/{1}/streams/{2}/values",id,name), body : parameters, onSuccess : cbS, onError: cbE});
            },
            /**
             * Deletes an existing data stream associated with a specific device.
             * @method deleteDataStream
             * @async
             * @param {String} id Device ID
             * @param {String} name Data stream name
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            deleteDataStream : function(id,name,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(name) || name.indexOf(' ') >= 0) {
                    throw new Error("Stream name should be a string and not include spaces");
                }
                request({verb:"DELETE", path: Utils.formatURL("/devices/{1}/streams/{2}",id,name), onSuccess : cbS, onError: cbE});
            },
            /**
             * Posts values to multiple streams at once.
             * @method postMultipleValues 
             * @async
             * @method postMultipleValues
             * @param {String} id Device ID 
             * @param {Object} values  An object with one attribute per each stream to be updated. The value of each one of these attributes is an array of timestamped values. See https://m2x.att.com/developer/documentation/v2/device#Post-Device-Updates--Multiple-Values-to-Multiple-Streams- for details
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            postMultipleValues : function(id,values,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                request({verb:"POST", path: Utils.formatURL("/devices/{1}/updates",id), body : {values: values}, onSuccess : cbS, onError: cbE});
            },
            /**
             * Retrieves a list of triggers associated with the specified device.
             * @method getTriggers
             * @async
             * @param {String} id Device ID 
             * @param {Object} [options]  Search options. See https://m2x.att.com/developer/documentation/v2/device#List-Triggers for details
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getTriggers : function(id,options,cbS,cbE) {
                var urlparams = options,
                    onSuccess = cbS,
                    onError = cbE;
            
                if (Utils.isFunc(urlparams)) {
                    urlparams = {};
                    onSuccess = options;
                    onError = cbS;
                }

                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                request({verb:"GET", path: Utils.formatURL("/devices/{1}/triggers",id), urlparams: urlparams, onSuccess : onSuccess, onError: onError});	        	
            },
            /**
             * Creates a new trigger associated with the specified device.
             * @method createTrigger
             * @async
             * @param {String} id Device ID 
             * @param {Object} trigger Trigger object. An error will be thrown if stream(String), condition(String), value(Number), name(String) or callback_url(String) are not provided.
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            createTrigger : function(id,trigger,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }

                Utils.checkObjectHasProperties(trigger,['stream','condition','value','name','callback_url']);
                request({verb:"POST", path: Utils.formatURL("/devices/{1}/triggers",id), body : trigger, onSuccess : cbS, onError: cbE});
            },
            /**
             * Gets details of a specific trigger associated with an existing device.
             * @method getTriggerDetails
             * @async
             * @param {String} id Device ID 
             * @param {String} trigger_id Trigger ID. 
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getTriggerDetails : function(id,triggerId,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                request({verb:"GET", path: Utils.formatURL("/devices/{1}/triggers/{2}",id,triggerId),onSuccess : cbS, onError: cbE});
            },
            /**
             * Updates an existing trigger associated with the specified device.
             * @method updateTrigger
             * @async
             * @param {String} id Device ID 
             * @param {String} trigger_id Trigger ID. 
             * @param {Object} trigger Trigger object. An error will be thrown if stream(String), condition(String), value(Number), name(String) or callback_url(String) are not provided.
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            updateTrigger : function(id,triggerId,trigger,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                Utils.checkObjectHasProperties(trigger,['stream','condition','value','name','callback_url']);
                request({verb:"PUT", path: Utils.formatURL("/devices/{1}/triggers/{2}",id,triggerId), body : trigger, onSuccess : cbS, onError: cbE});
            },
            /**
             * Tests the specified trigger by firing it with a fake value. See https://m2x.att.com/developer/documentation/v2/device#Test-Trigger for details
             * @method testTrigger
             * @async
             * @param {String} id Device ID 
             * @param {String} trigger_id Trigger ID. 
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            testTrigger : function(id,triggerId,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(triggerId)) {
                    throw new Error("Trigger ID should be an string");
                }

                request({verb:"POST", path: Utils.formatURL("/devices/{1}/triggers/{2}/test",id,triggerId), onSuccess : cbS, onError: cbE});        	
            },
            /**
             * Deletes an existing trigger associated with a specific device.
             * @method deleteTrigger
             * @async
             * @param {String} id Device ID 
             * @param {String} trigger_id Trigger ID. 
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            deleteTrigger : function(id,triggerId,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(triggerId)) {
                    throw new Error("Trigger ID should be an string");
                }
                request({verb:"DELETE", path: Utils.formatURL("/devices/{1}/triggers/{2}",id,triggerId), onSuccess: cbS, onError: cbE});
            },
            /**
             * Retrieves a list of HTTP requests received lately by the specified device (up to 100 entries).
             * @method getRequestsLog
             * @async
             * @param {String} id Device ID 
             * @param {Object} [options] Search options. 
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getRequestsLog :  function(id,options,cbS,cbE) {
                var urlparams = options,
                    onSuccess = cbS,
                    onError = cbE;
        
                if (Utils.isFunc(urlparams)) {
                    urlparams = {};
                    onSuccess = options;
                    onError = cbS;
                }

                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                request({verb:"GET", path: Utils.formatURL("/devices/{1}/log",id), urlparams : urlparams, onSuccess: onSuccess, onError: onError});	        	
            },
            /**
             * Deletes an existing device
             * @method remove
             * @async
             * @param {String} id Device ID
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            remove : function(id,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("Device ID should be an string");
                }
                request({verb:"DELETE", path: Utils.formatURL("/devices/{1}",id), onSuccess: cbS, onError: cbE});
            }
        }

        /**
         * M2X Distribution API facade
         * @class M2X.distribution
         *
         */
        api.distribution = {
            /**
             * Retrieves list of device distributions accessible by the authenticated API key.
             * @method search
             * @async
             * @param {Object} [options] Search options.
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            search : function (options,cbS,cbE) {
                var urlparams = options,
                    onSuccess = cbS,
                    onError = cbE;
        
                if (Utils.isFunc(urlparams)) {
                    urlparams = {};
                    onSuccess = options;
                    onError = cbS;
                }

                request({verb:"GET", path: "/distributions", urlparams : urlparams, onSuccess : onSuccess, onError: onError});
            },
            /**
             * Creates a new device distribution
             * @method create
             * @async
             * @param {Object} distribution Distribution object. An error will be thrown if name(String) or visibility(either 'public' or 'private') are not provided
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            create : function (distribution,cbS,cbE) {
                Utils.checkObjectHasProperties(distribution,['name','visibility']);
                
                request({verb:"POST", path: "/distributions", body: distribution, onSuccess: cbS, onError: cbE}); 
            },
            /**
             * Retrieves information about an existing device distribution.
             * @method getDetails
             * @async
             * @param {String} id Distribution ID
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */            
            getDetails : function(id,cbS,cbE) {
                if (!Utils.isString(id)){
                    throw new Error("ID should be a string");
                }
                request({verb:"GET", path: Utils.formatURL("/distributions/{1}",id), onSuccess : cbS, onError: cbE});
            },
            /**
             * Updates an existing device distribution's information
             * @method update
             * @async
             * @param {String} id Distribution ID
             * @param {Object} distribution Distribution object. An error will be thrown if name(String) or visibility(either 'public' or 'private') are not provided
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            update : function (id,distribution,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }

                Utils.checkObjectHasProperties(distribution,['name','visibility']);
                
                request({verb:"PUT", path: Utils.formatURL("/distributions/{1}",id), body: distribution, onSuccess: cbS, onError: cbE}); 
            },
            /**
             * Retrieves list of devices added to the specified distribution.
             * @method getDevices
             * @async
             * @param {String} id Distribution ID
             * @param [Object] options Search parameters. 
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getDevices : function(id,options,cbS,cbE) {
                var urlparams = options,
                    onSuccess = cbS,
                    onError = cbE;

                if (Utils.isFunc(urlparams)) {
                    urlparams = {};
                    onSuccess = options;
                    onError = cbS;
                }

                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                request({verb:"GET", path: Utils.formatURL("/distributions/{1}/devices",id), urlparams : urlparams, onSuccess : onSuccess, onError: onError});
            },
            /**
             * Adds a new device to an existing distribution.
             * @method addDevice
             * @async
             * @param {String} id Distribution ID
             * @param {String} serial Device serial number.
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            addDevice : function(id,serial,cbS,cbE) {

                if (!Utils.isString(id)) {
                    throw new Error("Distribution ID should be an string");
                }

                if (!Utils.isString(serial)) {
                    //Maybe a number was provided instead
                    if (Object.prototype.toString.call(serial) !== "[object Number]") {
                        throw new Error("Device serial number not present or type mismatch");
                    } else if (isNaN(serial)) {
                        throw new Error("Device serial number type mismatch");
                    }
                }

                request({verb:"POST", path: Utils.formatURL("/distributions/{1}/devices",id), body : {serial : serial}, onSuccess : cbS, onError: cbE});
            },            
            /**
             * Deletes an existing device distribution.
             * @method remove
             * @async
             * @param {String} id Distribution ID
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            remove : function(id,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("Distribution ID should be an string");
                }

                request({verb:"DELETE", path: Utils.formatURL("/distributions/{1}",id), onSuccess: cbS, onError: cbE});
            },
            /**
             * Retrieves a list of data streams associated with the specified distribution.
             * @method getDataStreams
             * @async
             * @param {String} id Distribution ID
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getDataStreams : function(id,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                request({verb:"GET", path: Utils.formatURL("/distributions/{1}/streams",id), onSuccess : cbS, onError: cbE});	        	
            },
            /**
             * Updates a data stream associated with the specified distribution (if a stream with this name does not exist it gets created).
             * @method updateStream
             * @async
             * @param {String} id distribution ID
             * @param {String} name Data stream name. No spaces or special characters allowed.
             * @param {Object} [stream] Create/Update parameters: unit and type. If no parameters are provided, stream type will be numeric by default and no unit will be associated to this stream. See https://m2x.att.com/developer/documentation/v2/distribution#Create-Update-Data-Stream for details.
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            updateStream : function(id,name,stream,cbS,cbE) {
                
                var body = stream, 
                    onSuccess = cbS, 
                    onError = cbE;

                if (Utils.isFunc(stream)) {
                    body = {};
                    onSuccess = stream;
                    onError = cbS;
                }
                
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(name) || name.indexOf(' ') >= 0) {
                    throw new Error("Stream name should be a string and not include spaces");
                }
                
                request({verb:"PUT", path: Utils.formatURL("/distributions/{1}/streams/{2}",id,name), body : body, onSuccess : onSuccess, onError: onError});
            },
            /**
             * Gets details of a specific data stream associated with an existing distribution.
             * @method getDataStreamDetails
             * @async
             * @param {String} id Distribution ID
             * @param {String} name Data stream name
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getDataStreamDetails : function (id,name,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(name) || name.indexOf(' ') >= 0) {
                    throw new Error("Stream name should be a string and not include spaces");
                }
                
                request({verb:"GET", path: Utils.formatURL("/distributions/{1}/streams/{2}",id,name), onSuccess : cbS, onError: cbE});
            },
            /**
             * Deletes an existing data stream associated with a specific distribution.
             * @method deleteDataStream
             * @async
             * @param {String} id Distribution ID
             * @param {String} name Data stream name
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            deleteDataStream : function(id,name,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(name) || name.indexOf(' ') >= 0) {
                    throw new Error("Stream name should be a string and not include spaces");
                }
                request({verb:"DELETE", path: Utils.formatURL("/distributions/{1}/streams/{2}",id,name), onSuccess : cbS, onError: cbE});
            },
            /**
             * Retrieves a list of triggers associated with the specified distribution.
             * @method getTriggers
             * @async
             * @param {String} id Distribution ID 
             * @param {Object} [options]  Search options. See https://m2x.att.com/developer/documentation/v2/distribution#List-Triggers for details
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getTriggers : function(id,options,cbS,cbE) {
                var urlparams = options,
                    onSuccess = cbS,
                    onError = cbE;
            
                if (Utils.isFunc(urlparams)) {
                    urlparams = {};
                    onSuccess = options;
                    onError = cbS;
                }

                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                request({verb:"GET", path: Utils.formatURL("/distributions/{1}/triggers",id), urlparams: urlparams, onSuccess : onSuccess, onError: onError});	        	
            },
            /**
             * Creates a new trigger associated with the specified distribution.
             * @method createTrigger
             * @async
             * @param {String} id Distribution ID 
             * @param {Object} trigger Trigger object. An error will be thrown if stream(String), condition(String), value(Number), name(String) or callback_url(String) are not provided.
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            createTrigger : function(id,trigger,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }

                Utils.checkObjectHasProperties(trigger,['stream','condition','value','name','callback_url']);
                request({verb:"POST", path: Utils.formatURL("/distributions/{1}/triggers",id), body : trigger, onSuccess : cbS, onError: cbE});
            },
            /**
             * Gets details of a specific trigger associated with an existing distribution.
             * @method getTriggerDetails
             * @async
             * @param {String} id Distribution ID 
             * @param {String} trigger_id Trigger ID. 
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getTriggerDetails : function(id,triggerId,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                request({verb:"GET", path: Utils.formatURL("/distributions/{1}/triggers/{2}",id,triggerId),onSuccess : cbS, onError: cbE});
            },
            /**
             * Updates an existing trigger associated with the specified distribution.
             * @method updateTrigger
             * @async
             * @param {String} id Distribution ID 
             * @param {String} trigger_id Trigger ID. 
             * @param {Object} trigger Trigger object. An error will be thrown if stream(String), condition(String), value(Number), name(String) or callback_url(String) are not provided.
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            updateTrigger : function(id,triggerId,trigger,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                Utils.checkObjectHasProperties(trigger,['stream','condition','value','name','callback_url']);
                request({verb:"PUT", path: Utils.formatURL("/distributions/{1}/triggers/{2}",id,triggerId), body : trigger, onSuccess : cbS, onError: cbE});
            },
            /**
             * Tests the specified trigger by firing it with a fake value. See https://m2x.att.com/developer/documentation/v2/distribution#Test-Trigger for details
             * @method testTrigger
             * @async
             * @param {String} id Distribution ID 
             * @param {String} trigger_id Trigger ID. 
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            testTrigger : function(id,triggerId,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(triggerId)) {
                    throw new Error("Trigger ID should be an string");
                }

                request({verb:"POST", path: Utils.formatURL("/distributions/{1}/triggers/{2}/test",id,triggerId), onSuccess : cbS, onError: cbE});        	
            },
            /**
             * Deletes an existing trigger associated with a specific distribution.
             * @method deleteTrigger
             * @async
             * @param {String} id Distribution ID 
             * @param {String} trigger_id Trigger ID. 
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            deleteTrigger : function(id,triggerId,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("ID should be an string");
                }
                if (!Utils.isString(triggerId)) {
                    throw new Error("Trigger ID should be an string");
                }
                request({verb:"DELETE", path: Utils.formatURL("/distributions/{1}/triggers/{2}",id,triggerId), onSuccess: cbS, onError: cbE});
            }
        }

        /**
         * M2X Key API facade
         * @class M2X.key
         *
         */
        api.key = {
            /**
             * Retrieves list of keys associated with the specified account.
             * @method search
             * @async
             * @param {String} [deviceID]  If provided, it will list all the keys that are associated with that specific device or its streams
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            search : function(device,cbS,cbE) {
                var urlparams = {device : device},
                    onSuccess = cbS,
                    onError = cbE;
        
                if (Utils.isFunc(device)) {
                    urlparams = {};
                    onSuccess = device;
                    onError = cbS;
                }
        
                request({verb:"GET", path: "/keys", urlparams : urlparams, onSuccess: onSuccess, onError: onError});
            },
            /**
             * Creates a new key associated with the specified account.
             * @method create
             * @async
             * @param {Object} key Key object. An error will be thrown if name(String) or permissions(Array) are not provided. See https://m2x.att.com/developer/documentation/v2/keys#Create-Key for details
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            create : function (key,cbS,cbE) {
                if (!Utils.isObj(key)) {
                    throw new Error("Key should be an object");
                }
        
                Utils.checkObjectHasProperties(key,['name','permissions']);
                
                request({verb:"POST", path: "/keys", body: key, onSuccess: cbS, onError: cbE}); 
            },
            /**
             * Gets details of a specific key associated with a developer account.
             * @method getDetails
             * @async
             * @param {String} key Key ID
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             */
            getDetails : function(key,cbS,cbE) {
                if (!Utils.isString(key)) {
                    throw new Error("Key should be a String");
                }
        
                request({verb:"GET", path: Utils.formatURL("/keys/{1}",key), onSuccess: cbS, onError: cbE});
            },
            /**
             * Update name, stream, permissions, expiration date, origin or device access of an existing key associated with the specified account
             * @method update
             * @async
             * @param {String} key Key ID
             * @param {Object} key Key object. An error will be thrown if name(String) or permissions(Array) are not provided
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails
             *  
             * Note: Do not include `key` in the Key object. Otherwise, M2X will return
             * 		a 422(Unprocessable Entity) error with message "Validation Failed","errors":{"key":["unknown"]}
             */
            update : function(id,key,cbS,cbE) {
                if (!Utils.isString(id)) {
                    throw new Error("Key should be a String");
                }
        
                Utils.checkObjectHasProperties(key,['name','permissions']);
                request({verb:"PUT", path: Utils.formatURL("/keys/{1}",id), body : key, onSuccess: cbS, onError: cbE});
            },
            /**
             * Regenerates the specified key.
             * @method regenerate
             * @async
             * @param {String} key Key ID
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails 
             */
            regenerate : function(id,cbS,cbE){
                if (!Utils.isString(id)) {
                    throw new Error("Key should be a String");
                }
        
                request({verb:"POST", path: Utils.formatURL("/keys/{1}/regenerate",id), onSuccess: cbS, onError: cbE});    		
            },
            /**
             * Deletes an existing key.
             * @method remove
             * @async
             * @param {String} key Key ID
             * @param {Function} onSuccess Function to call back if operation is successful
             * @param {Function} [onError] Function to call back if operation fails 
             */
            remove : function(id,cbS,cbE){
                if (!Utils.isString(id)) {
                    throw new Error("Key should be a String");
                }
        
                request({verb:"DELETE", path: Utils.formatURL("/keys/{1}",id), onSuccess: cbS, onError: cbE});
            }
        }

        /**
         * Updates the M2X API key currently used by this instance
         * @method setKey
         * @for M2X
         * @param {String} key Key ID. An error will be thrown if key is not a string
         */
        api.setKey = function(key) {
            if (!Utils.isString(key)) {
                throw new Error("Key ID should be a String");
            }
                
            cfg.key = key;
        }
        
        return api;
   };
        
   /**
    * Creates a Date instance from a ISO8601 date
    * @method fromISO8601toDate 
    * @static
    * @for M2X
    * @param {String} timestamp A date in ISO8601 format
    * @return {Date} Date object if parameter is valid, undefined otherwise
    */
    M2XAPI.fromISO8601toDate = function(timestamp) {
        var ISO8601Format = /\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
        if (ISO8601Format.test(timestamp)) {
            return new Date(timestamp);
        }
    };

    /**
     * Returns a date in ISO8601 format
     * @method getISO8601Timestamp 
     * @static
     * @for M2X
     * @param {Mixed} [timestamp] Either a Date instance or a number(integer)
     * @return {String} ISO8601 date. If no timestamp is provided, current time/date will be returned
     */    
    M2XAPI.getISO8601Timestamp = function(timestamp) {
        var t;
        if (Object.prototype.toString.call(timestamp) === '[object Date]' 
            || (typeof timestamp === 'number' && timestamp === (timestamp | 0))) {
            t = timestamp;
        } else {
            t = new Date.now();
        }
        return t.toISOString();
    };

    return M2XAPI;

}));