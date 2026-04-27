import { Producer, Consumer, Kafka, LibrdKafkaError } from "node-rdkafka";

// Aiven Kafka configuration (matching Aiven's Node.js docs)
const broker = process.env.KAFKA_BROKERS || "kafka-19548063-mosescsunday1-7ea3.a.aivencloud.com:22854";

const kafkaConfig = {
  "metadata.broker.list": broker,
  "security.protocol": "ssl",
  "ssl.key.location": process.env.KAFKA_SSL_KEY_PATH || "service.key",
  "ssl.certificate.location": process.env.KAFKA_SSL_CERT_PATH || "service.cert",
  "ssl.ca.location": process.env.KAFKA_SSL_CA_PATH || "ca.pem",
  "dr_cb": true,
};

const producer = new Producer(kafkaConfig);
const consumer = new Consumer(kafkaConfig, {
  "group.id": "community-hub-group",
  "enable.auto.commit": false,
});

// Topic names
export const TOPICS = {
  SERMON_CREATED: "sermon-created",
  EVENT_CREATED: "event-created",
  DONATION_RECEIVED: "donation-received",
  PRAYER_REQUEST: "prayer-request",
  USER_ACTIVITY: "user-activity",
};

// Initialize Kafka producer
export function connectKafka(): Promise<void> {
  return new Promise((resolve, reject) => {
    producer.on("ready", () => {
      console.log("Kafka producer connected successfully");
      resolve();
    });

    producer.on("event.error", (err: LibrdKafkaError) => {
      console.error("Kafka producer error:", err);
      reject(err);
    });

    producer.connect();
  });
}

// Disconnect Kafka
export function disconnectKafka(): Promise<void> {
  return new Promise((resolve) => {
    producer.disconnect();
    console.log("Kafka producer disconnected");
    resolve();
  });
}

// Send message to topic
export function sendMessage(topic: string, message: any): Promise<void> {
  return new Promise((resolve, reject) => {
    producer.produce(
      topic,
      null, // partition (null = automatic)
      Buffer.from(JSON.stringify(message)),
      null, // key
      Date.now(),
      (err, offset) => {
        if (err) {
          console.error(`Error sending message to topic ${topic}:`, err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

export { producer, consumer };
