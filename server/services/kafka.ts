import { Kafka, logLevel } from "kafkajs";

// Aiven Kafka configuration
const kafka = new Kafka({
  clientId: "community-hub",
  brokers: ["kafka-19548063-mosescsunday1-7ea3.a.aivencloud.com:22854"],
  ssl: true,
  sasl: {
    mechanism: "scram-sha-256", // or "plain" depending on Aiven config
    username: process.env.KAFKA_USERNAME || "",
    password: process.env.KAFKA_PASSWORD || "",
  },
  logLevel: logLevel.INFO,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "community-hub-group" });

// Topic names
export const TOPICS = {
  SERMON_CREATED: "sermon-created",
  EVENT_CREATED: "event-created",
  DONATION_RECEIVED: "donation-received",
  PRAYER_REQUEST: "prayer-request",
  USER_ACTIVITY: "user-activity",
};

// Initialize Kafka connection
export async function connectKafka() {
  try {
    await producer.connect();
    console.log("Kafka producer connected successfully");
  } catch (error) {
    console.error("Failed to connect Kafka producer:", error);
  }
}

// Disconnect Kafka
export async function disconnectKafka() {
  try {
    await producer.disconnect();
    console.log("Kafka producer disconnected");
  } catch (error) {
    console.error("Error disconnecting Kafka:", error);
  }
}

// Send message to topic
export async function sendMessage(topic: string, message: any) {
  try {
    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
  } catch (error) {
    console.error(`Error sending message to topic ${topic}:`, error);
  }
}

export default kafka;
