import { Kafka, logLevel } from "kafkajs";
import fs from "fs";
import path from "path";

// Aiven Kafka configuration with SSL client certificates
const broker = process.env.KAFKA_BROKERS || "kafka-19548063-mosescsunday1-7ea3.a.aivencloud.com:22854";

// SSL certificate file paths (download from Aiven Console)
const sslKeyPath = process.env.KAFKA_SSL_KEY_PATH || path.join(process.cwd(), "service.key");
const sslCertPath = process.env.KAFKA_SSL_CERT_PATH || path.join(process.cwd(), "service.cert");
const sslCAPath = process.env.KAFKA_SSL_CA_PATH || path.join(process.cwd(), "ca.pem");

// Read SSL certificates if files exist
let sslConfig: any = true; // Default SSL

if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath) && fs.existsSync(sslCAPath)) {
  sslConfig = {
    rejectUnauthorized: false,
    ca: [fs.readFileSync(sslCAPath, "utf-8")],
    cert: fs.readFileSync(sslCertPath, "utf-8"),
    key: fs.readFileSync(sslKeyPath, "utf-8"),
  };
}

const kafka = new Kafka({
  clientId: "community-hub",
  brokers: [broker],
  ssl: sslConfig,
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
