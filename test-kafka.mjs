// Test Kafka connection using node-rdkafka (Aiven's recommended library)
import Kafka from "node-rdkafka";

const broker = "kafka-19548063-mosescsunday1-7ea3.a.aivencloud.com:22854";

const kafkaConfig = {
  "metadata.broker.list": broker,
  "security.protocol": "ssl",
  "ssl.key.location": "service.key",
  "ssl.certificate.location": "service.cert",
  "ssl.ca.location": "ca.pem",
  "dr_cb": true,
};

console.log("Testing Kafka connection with node-rdkafka...");
console.log("Broker:", broker);

const producer = new Kafka.Producer(kafkaConfig);

producer.on("ready", () => {
  console.log("✅ Kafka producer connected successfully!");

  // Try to produce a test message
  try {
    producer.produce(
      "test-topic",
      null,
      Buffer.from(JSON.stringify({ test: "hello", time: new Date().toISOString() })),
      null,
      Date.now(),
      (err, offset) => {
        if (err) {
          console.error("❌ Error sending message:", err);
        } else {
          console.log("✅ Test message sent! Offset:", offset);
        }

        producer.disconnect();
        console.log("✅ Kafka disconnected");
        process.exit(0);
      }
    );
  } catch (err) {
    console.error("❌ Error producing message:", err);
    producer.disconnect();
    process.exit(1);
  }
});

producer.on("event.error", (err) => {
  console.error("❌ Kafka connection error:", err);
  process.exit(1);
});

console.log("Connecting to Kafka...");
producer.connect();
