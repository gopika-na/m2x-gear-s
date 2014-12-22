#Tizen JavaScript library for M2X#

####Easily develop IoT applications for the Samsung Gear S using the Tizen JS library for M2X####

This library will try to participate as a module if an AMD loader is available.

Example:

    define(['lib/m2x.min'],function(M2X) {
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

####Batch API####
* addDataSource
* create
* getDataSources
* getDetails
* remove
* search
* update

Example:

    define(['lib/m2x.min'],function(M2X) {
        ...
        var myM2X = new M2X({key:'M2X_KEY_GOES_HERE'});
        myM2X.batch.getDetails("BATCH_ID_GOES_HERE",
                  function(msg) {
                       //Batch details are stored in msg.result
                      ...
                  },
                  function(error) {
                       //Handle error
                  }
       );
        ...
    });

####Blueprint API####
* search
* create
* getDetails
* update
* remove

Example:

    define(['lib/m2x.min'],function(M2X) {
        ...
        var myM2X = new M2X({key:'M2X_KEY_GOES_HERE'});
        myM2X.blueprint.create({name:"blueprint_name",visibility:"private"},
                  function(msg) {
                       //Access your new blueprint object via msg.response
                       ...
                  },
                  function(error) {
                       //Handle error
                  }
       );
        ...
    });


####Data Source API####
* create
* getDetails
* remove
* search
* update

Example:

    define(['lib/m2x.min'],function(M2X) {
        ...
        var myM2X = new M2X({key:'M2X_KEY_GOES_HERE'});
        myM2X.datasource.update("DATA_SOURCE_ID",{name:"ds_name",description:"new description",visibility:"private"},
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

####Feed API####
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
* search
* testTrigger
* updateDataStreamValue
* updateLocation
* updateStream
* updateTrigger

Example

    define(['lib/m2x.min'],function(M2X) {
        ...
        var myM2X = new M2X({key:'M2X_KEY_GOES_HERE'}),
            timestamp = M2X.getISO8601Timestamp();
        myM2X.feed.postMultipleValues("FEED_ID",
                {
                    "stream1" : [{
                        "at" : timestamp,
                        "value" : 123
                    }],
                    "stream2" : [{
                        "at" : timestamp,
                        "value" : 456
                    }],
                    "stream3" : [{
                        "at" : timestamp,
                        "value" : 789
                    }]
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

####Key API#####
* create
* getDetails
* regenerate
* remove
* search
* update

Example:

    define(['lib/m2x.min'],function(M2X) {
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
This library was derived from the Javascript M2X API Client available at https://github.com/attm2x/m2x-javascript
