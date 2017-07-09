const ActionsSdkApp = require('actions-on-google').ActionsSdkApp
const express = require('express')
const bodyParser = require('body-parser')
const server = express()
const location = {}
server.use(bodyParser.json())

server.post('/', function (request, response) {
  let app = new ActionsSdkApp({request: request, response: response})
  let actionMap = new Map()
  actionMap.set(app.StandardIntents.MAIN, mainIntent)
  actionMap.set(app.StandardIntents.TEXT, rawInput)
  actionMap.set(app.StandardIntents.PERMISSION, mainIntent)
  app.handleRequest(actionMap)
})

server.listen(3000, function () {
  console.log('Google actions app listening on port 3000!')
})

function mainIntent (app) {
  if(!app.isPermissionGranted()){
      getLocationPermission(app)
  }
  location[app.getUser().userId] = app.getDeviceLocation()
  let inputPrompt = app.buildInputPrompt(true, '<speak>Hi <break time="1s"/> I\'m Mister pizza <break time="1s"/> What do you want to order?</speak>',
        ['I didn\'t hear a menu'])
  app.ask(inputPrompt)
}

function getLocationPermission(app) {
  if (!app.isPermissionGranted()) {
    app.askForPermission("To get a pizza", app.SupportedPermissions.DEVICE_PRECISE_LOCATION)
  }else{
    mainIntent(app)
  }
}

function rawInput (app) {
  if (app.getRawInput() === 'bye') {
    app.tell('Goodbye!')
  } else {
    let userLocation = location[app.getUser().userId]
    // let aiResponse = '<speak>' + app.getRawInput() + ' Will deliver to your location soon.</speak>'
    let aiResponse = app.buildRichResponse()
                    .addSimpleResponse({ speech: '<speak>' + app.getRawInput() + ' Will deliver to your location soon.</speak>' })
                    .addBasicCard(app.buildBasicCard()
                      .setImage('https://maps.googleapis.com/maps/api/staticmap?center=' + userLocation.coordinates.latitude + ',' + userLocation.coordinates.longitude + '&zoom=13&size=600x300&maptype=roadmap&markers=color:blue%7Clabel:S%7C' + userLocation.coordinates.latitude + ',' + userLocation.coordinates.longitude + '&key=AIzaSyDQStpt_kDCTSGLW6zCRq4ulNVfUOEKRSw', 'Location')
                    )
    app.tell(aiResponse)
    
    console.log('Send ' + app.getRawInput() + ' to ' + userLocation.coordinates.latitude + ', ' + userLocation.coordinates.longitude)
  }
}


