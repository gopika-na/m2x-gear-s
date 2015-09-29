####Samsung Gear S Demo Apps Readme####

These examples illustrate the following:

* How to access one of the many sensors available on Gear S
* How to leverage the Tizen M2X client to push data to M2X
* How to use local storage (to save M2X settings)
* How to use Open Source libraries such as RequireJS, jQuery and CharJS to build a Gear S application

Of course, make sure you've done the following first:

1. Signup for an [M2X Account](https://m2x.att.com/signup).
2. Obtain your _Master Key_ from the Master Keys tab of your [Account Settings](https://m2x.att.com/account) screen.
3. Create your first [Device](https://m2x.att.com/devices) and copy its _Device ID_.
4. Review the [M2X API Documentation](https://m2x.att.com/developer/documentation/overview).
5. Setup a [Samsung Gear Developer account](http://developer.samsung.com/gear/)
6. Setup a [Tizen Developer account](https://developer.tizen.org/)
7. Download the [Tizen SDK](http://developer.samsung.com/gear/samsung_gear_develop.html#sdk-download) (including the Tizen IDE)
8. Review the [Tizen getting started guide](https://developer.tizen.org/development/getting-started/web-application/creating-your-first-tizen-application#wearapp)

For these demos, you'll need to register for a Google Developer account in order to obtain your Google Maps API Key. You can do so here: https://developers.google.com/maps/?hl=en

####IMPORTANT####
Before building/running these demos, YOU MUST REPLACE the bogus M2X key in m2xclient.js with your own master key for both demo apps and the bogus Google Map key in locdata_map.js for the M2XGPSDemo app (https://developers.google.com/maps/documentation/javascript/tutorial#api_key)
