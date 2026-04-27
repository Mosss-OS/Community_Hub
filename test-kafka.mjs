// Test Kafka connection using node-rdkafka
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
let pollInterval;

producer.on("ready", () => {
  console.log("✅ Kafka producer connected!");

  // Start polling
  pollInterval = setInterval(() => producer.poll(), 100);

  // Produce a test message
  try {
    producer.produce(
      "test-topic",
      null,
      Buffer.from(JSON.stringify({ test: "hello", time: new Date().toISOString() })),
      null,
      Date.now(),
      (err, offset) => {
        if (err) {
          console.error("❌ Error sending:", err.message);
          cleanup();
          process.exit(1);
        } else {
          console.log("✅ Message sent! Offset:", offset);
          // Wait a bit for delivery, then cleanup
          setTimeout(() => {
            console.log("✅ Test passed!");
            cleanup();
            process.exit(0);
          }, 2000);
        }
      }
    );
  } catch (err) {
    console.error("❌ Error:", err.message);
    cleanup();
    process.exit(1);
  }
});

producer.on("delivery-report", (err, report) => {
  if (err) {
    console.error("❌ Delivery failed:", err.message);
  } else {
    console.log("✅ Delivered:", report.topic, "offset:", report.offset);
  }
});

producer.on("event.error", (err) => {
  console.error("❌ Kafka error:", err.message);
  cleanup();
  process.exit(1);
});

function cleanup() {
  if (pollInterval) clearInterval(pollInterval);
  try { producer.disconnect(); } catch(e) {}
}

console.log("Connecting...");
producer.connect();

setTimeout(() => {
  console.error("❌ Timeout");
  cleanup();
  process.exit(1);
}, 15000);
