import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class IotService implements OnModuleInit {
  private client: mqtt.MqttClient;

  onModuleInit() {
    this.client = mqtt.connect('mqtt://test.mosquitto.org');

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.client.subscribe('lftg/+/+/data', (err) => {
        if (!err) {
          console.log('Subscribed to sensor data topics');
        }
      });
    });

    this.client.on('message', (topic, message) => {
      console.log(`Received message from ${topic}: ${message.toString()}`);
      // Here you would process the message, e.g., save to database, trigger alerts
    });
  }

  getActiveSensors() {
    // Mock data
    return [
      { id: 'sensor-temp-01', type: 'temperature', enclosure: 'Serre Reptiles', value: 37.8, unit: '°C', status: 'alert' },
      { id: 'sensor-hum-01', type: 'humidity', enclosure: 'Serre Reptiles', value: 82, unit: '%', status: 'ok' },
      { id: 'sensor-co2-01', type: 'co2', enclosure: 'Serre Reptiles', value: 450, unit: 'ppm', status: 'ok' },
      { id: 'sensor-temp-02', type: 'temperature', enclosure: 'Volière Psittacidés', value: 28.2, unit: '°C', status: 'ok' },
    ];
  }

  getSensorHistory(id: string) {
    // Mock data
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      value: 25 + Math.random() * 10,
    }));
  }

  publishMqttMessage(topic: string, payload: any) {
    this.client.publish(topic, JSON.stringify(payload));
    return { status: 'published', topic, payload };
  }
}
