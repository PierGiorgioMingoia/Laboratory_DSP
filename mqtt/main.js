'use strict'

var clientId = 'mqttjs-' + Math.random().toString(16).substr(2, 8);
var host = 'ws://127.0.0.1:8080';

var options = {
  keepalive: 30,
  clientId: clientId,
  clean: true,
  reconnectPeriod: 60000,
  connectTimeout: 30*1000,
  will: {
    topic: 'chat',
    payload: `${clientId} disconnected abruptly`,
    qos: 0,
    retain: false
  },
  rejectUnauthorized: false
}

console.log('connecting mqtt client');
var client = mqtt.connect(host, options);

client.on('error', function (err) {
  console.log(err);
  client.end();
})

client.on('connect', function () {
  console.log('client connected:' + clientId);
  client.subscribe('chat', { qos: 0 });
})

client.on('message', function (topic, message, packet) {
  console.log('Received Message:= ' + message.toString() + '\nOn topic:= ' + topic);
  showMessage(message.toString());
})

client.on('close', function () {
  console.log(clientId + ' disconnected');
})

const messages = document.querySelector('#messages');

document.querySelector('form').addEventListener('submit', event => {
  event.preventDefault();
  let message = document.querySelector('#message').value;
  client.publish('chat', message, { qos: 0, retain: false });
  document.querySelector('#message').value = '';
});

function showMessage(message) {
    messages.textContent += `\n\n${message}`;
    messages.scrollTop = messages.scrollHeight;
  }