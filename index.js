import { connect } from 'mqtt'
import dotenv from 'dotenv'

dotenv.config()
console.log(process.env.MQTT_IP)

//MQTT-consumer instantiation
 var client = connect(process.env.MQTT_IP) 
  client.on('connect', function () {
   client.subscribe(['INIT','hb/setTarget', 'door/state', 'door/battery'], function (err) {
       client.publish('INIT', `ACK - ${process.env.MQTT_IP}`)
       client.publish('door/command', '1')
     if (!err) {
     }
 })
 })

 //MQTT-consumer parser to mongo documents
 client.on('message', function (topic, message) {
     var payload
     switch (topic) {
        case 'INIT':
             console.log(`${new Date().toUTCString()}: ${topic}| ${message.toString()}`)
             break;
        case 'hb/setTarget':
            if(message.toString() == "Unsecured") {
                client.publish('door/command', '4')
                client.publish('"hb/getTargetState"', 'Unsecured')
            } else if(message.toString() == "Secured") {
                client.publish('door/command', '3')
                client.publish('"hb/getTargetState"', 'Secured')
            }
             break;
        case 'door/state':
             if(message.toString()=="locked") {
                 client.publish('hb/getState', 'Secured')
             } else if(message.toString()=="unlocked" || message.toString()=="open") {
                client.publish('hb/getState', 'Unsecured')
            }
             break;
        case 'door/battery':
             if(message.toString()=="true") {
                 client.publish('hb/getBattery', '0')
             } else if(message.toString()=="false") {
                client.publish('hb/getBattery', '1')
            }
             break;
         default:
             break;
     }
 })

