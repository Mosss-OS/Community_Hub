// Kafka integration using node-rdkafka with dynamic import for ES modules
let Producer: any, Consumer: any, Kafka: any, LibrdKafkaError: any;
let producer: any, consumer: any;

// Dynamically import node-rdkafka (CommonJS)
const kafkaModule = await import("node-rdkafka");
const Producer = kafkaModule.default.Producer || kafkaModule.Producer;
const Consumer = kafkaModule.default.Consumer || kafkaModule.Consumer;
const KafkaObj = kafkaModule.default.Kafka || kafkaModule.Kafka;
const LibrdKafkaError = kafkaModule.default.LibrdKafkaError || kafkaModule.LibrdKafkaError;

// Aiven Kafka configuration
const broker = process.env.KAFKA_BROKERS || "kafka-19548063-mosescsunday1-7ea3.a.aivencloud.com:22854";

const kafkaConfig = {
  "metadata.broker.list": broker,
  "security.protocol": "ssl",
  "ssl.key.location": process.env.KAFKA_SSL_KEY_PATH || "service.key",
  "ssl.certificate.location": process.env.KAFKA_SSL_CERT_PATH || "service.cert",
  "ssl.ca.location": process.env.KAFKA_SSL_CA_PATH || "ca.pem",
  "dr_cb": true,
};

producer = new Producer(kafkaConfig);
consumer = new Consumer(kafkaConfig, {
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

// Poll interval reference
let pollInterval: NodeJS.Timeout | null = null;

// Initialize Kafka producer
export function connectKafka(): Promise<void> {
  return new Promise((resolve, reject) => {
    producer.on("ready", () => {
      console.log("Kafka producer connected successfully");

      // Start polling for delivery reports
      pollInterval = setInterval(() => {
        try {
          producer.poll();
        } catch (e) {
          // Ignore poll errors
        }
      }, 100);

      resolve();
    });

    producer.on("event.error", (err: typeof LibrdKafkaError) => {
      console.error("Kafka producer error:", err);
      reject(err);
    });

    producer.connect();
  });
}

// Disconnect Kafka
export function disconnectKafka(): Promise<void> {
  return new Promise((resolve) => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    producer.disconnect();
    console.log("Kafka producer disconnected");
    resolve();
  });
}

// Send message to topic
export function sendMessage(topic: string, message: any): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      producer.produce(
        topic,
        null, // partition
        Buffer.from(JSON.stringify(message)),
        null, // key
        Date.now(),
        (err: any, offset: any) => {
          if (err) {
            console.error(`Error sending message to topic ${topic}:`, err);
            reject(err);
          } else {
            console.log(`Message sent to ${topic}, offset: ${offset}`);
            resolve();
          }
        }
      );
      // Poll after producing
      producer.poll();
    } catch (err) {
      console.error(`Error producing message to ${topic}:`, err);
      reject(err);
    }
  });
}

export { producer, consumer };
