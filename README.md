##Samsung Gear S (Tizen JavaScript) library for M2X##

[AT&T M2X](http://m2x.att.com) is a cloud-based fully managed time-series data storage service for network connected machine-to-machine (M2M) devices and the Internet of Things (IoT). 

The [AT&T M2X API](https://m2x.att.com/developer/documentation/overview) provides all the needed operations and methods to connect your devices to AT&T's M2X service. This library aims to provide a simple wrapper to interact with the AT&T M2X API. Refer to the [Glossary of Terms](https://m2x.att.com/developer/documentation/glossary) to understand the nomenclature used throughout this documentation.

###Getting Started###

1. Signup for an [M2X Account](https://m2x.att.com/signup).
2. Obtain your _Master Key_ from the Master Keys tab of your [Account Settings](https://m2x.att.com/account) screen.
2. Create your first [Device](https://m2x.att.com/devices) and copy its _Device ID_.
3. Review the [M2X API Documentation](https://m2x.att.com/developer/documentation/overview).

If you have questions about any M2X specific terms, please consult the [M2X glossary] (https://m2x.att.com/developer/documentation/glossary).

###Overview###

This library will try to participate as a module if an AMD loader is available.

Example:

    define(['lib/m2x-2.0.0.min'],function(M2X) {
        var myM2X = new M2X({key:'yourm2xkeygoeshere'});
        ...
    });

Unless stated otherwise, all functions in this library are asynchronous and a callback function should be provided.


Callback signature

    function onSuccess(result) {...}

where result is an object with following attributes

    result.status --> HTTP code returned by M2X API
    result.response --> JSON encoded response

All functions accept an optional ```onError``` callback. Errors can be forwarded to the onSuccess callback by setting the forward_errors attribute to true in the constructor

    var myM2X = new M2X({key:'yourm2xkeygoeshere', forward_errors: true});

Instead of creating a new instance whenever you need to use a new key, you can update the key by calling ```setKey``` in your instance

    myM2X.setKey("yournewkeygoeshere");

Now all subsequent calls will use the new key. Please note that ```setKey``` will not verify the provided key. M2X will return an error if your key is not valid or does not have the appropriate permission to execute a specific request

###List of available API###

####Device API####
* create
* createTrigger
* deleteDataStream
* deleteDataStreamValues
* deleteTrigger
* getDataStreamDetails
* getDatastreams
* getDataStreamStats
* getDataStreamValues
* getDetails
* getLocation
* getRequestsLog
* getTriggerDetails
* getTriggers
* postDataStreamValues
* postMultipleValues
* remove
* search
* searchDeviceGroups
* testTrigger
* update
* updateDataStreamValue
* updateLocation
* updateStream
* updateTrigger

Example:

    define(['lib/m2x-2.0.0.min'],function(M2X) {
        ...
        var myM2X = new M2X({key:'M2X_KEY_GOES_HERE'}),
            timestamp = M2X.getISO8601Timestamp();
        myM2X.device.postMultipleValues("DEVICE_ID_GOES_HERE",
                {
                    "stream1" : [
                        {"timestamp" : timestamp, "value" : 123}
                    ],
                    "stream2" : [
                        { "timestamp" : timestamp, "value" : 456}
                    ],
                    "stream3" : [
                        { "timestamp" : timestamp, "value" : 789}
                    ]
                },
                function(msg) {
                       //On success, M2X will return HTTP code 202 (accepted)
                       //You may confirm by looking at msg.status
                       ...
                },
                function(error) {
                       //Handle error
                }
       );
        ...
    });


####Distribution API####
* addDevice
* create
* createTrigger
* deleteDataStream
* deleteTrigger
* getDataStreamDetails
* getDataStreams
* getDetails
* getDevices
* getTriggerDetails
* getTriggers
* remove
* search
* testTrigger
* update
* updateStream

Example

    define(['lib/m2x.min'],function(M2X) {
        ...
        var myM2X = new M2X({key:'M2X_KEY_GOES_HERE'}),
            timestamp = M2X.getISO8601Timestamp();
        myM2X.distribution.getDevices("DISTRIBUTION_ID_GOES_HERE",
                function(msg) {
                       //The list of devices is available in msg.response.devices
                       ...
                },
                function(error) {
                       //Handle error
                }
        );
        ...
    });

####Key API#####
* create
* getDetails
* regenerate
* remove
* search
* update

Example:

    define(['lib/m2x-2.0.0.min'],function(M2X) {
        ...
        var myM2X = new M2X({key:'M2X_KEY_GOES_HERE'});
        myM2X.key.remove("A_M2X_KEY",
                  function(msg) {
                       //On success, M2X will return HTTP code 204 (no content)
                       //You may confirm by looking at msg.status
                       ...
                  },
                  function(error) {
                       //Handle error
                  }
        );
        ...
    });

###Sample###
Gear S demo apps are available in the ``demo`` folder

###Documentation###
A detailed documentation of all the available APIs supported by this library is available in the ``doc`` folder

###Acknowledgements###

The credit of creating this library goes to Samsung and AT&T Services, Inc.

This library was derived from the Javascript M2X API Client available at https://github.com/attm2x/m2x-javascript
