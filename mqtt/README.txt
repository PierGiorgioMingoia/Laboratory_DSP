MQTT example: simple chat

index.html      main page of the application
main.js         javascript code of the client side of the application
style.css       css style for the application
mosquitto.conf	configuration file for the mosquitto MQTT broker

How to run the MQTT broker (server)
Make sure you have installed Mosquitto 1.6.12 (not that the new versions 2.0.x have problems with websockets)
Use the configuration file included in this package to enable websockets on port 8080
(if you have installed mosquitto on ubuntu with snap, it is enough to copy the file into
/var/snap/mosquitto/common/mosquitto.conf and restart mosquitto)

How to run the client:
load the index.html in your browser
