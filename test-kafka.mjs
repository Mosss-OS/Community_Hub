import { Kafka } from "kafkajs";
import fs from "fs";
import path from "path";

const sslKeyPath = path.join(process.cwd(), "service.key");
const sslCertPath = path.join(process.cwd(), "service.cert");
const sslCAPath = path.join(process.cwd(), "ca.pem");

console.log("Checking certificate files...");
console.log("service.key exists:", fs.existsSync(sslKeyPath), "- Size:", fs.statSync(sslKeyPath).size + "bytes");
console.log("service.cert exists:", fs.existsSync(sslCertPath), "- Size:", fs.statSync(sslCertPath).size + "bytes");
console.log("ca.pem exists:", fs.existsSync(sslCAPath), "- Size:", fs.statSync(sslCAPath).size + "bytes");

try {
  const keyContent = fs.readFileSync(sslKeyPath, "utf8");
  const certContent = fs.readFileSync(sslCertPath, "utf8");
  const caContent = fs.readFileSync(sslCAPath, "utf8");

  console.log("\nKey starts with:", keyContent.substring(0, 30));
  console.log("Cert starts with:", certContent.substring(0, 30));
  console.log("CA starts with:", caContent.substring(0, 30));

  if (!keyContent.includes("BEGIN PRIVATE KEY") && !keyContent.includes("BEGIN RSA PRIVATE KEY")) {
    console.error("\n❌ ERROR: service.key does not contain a valid private key!");
    console.error("File content:", keyContent);
    console.error("\nPlease re-download it from Aiven Console → Kafka → Quick connect");
    process.exit(1);
  }

  console.log("\n✅ Certificate files look valid");
} catch (err) {
  console.error("Error reading cert files:", err.message);
  process.exit(1);
}

const kafka = new Kafka({
  clientId: "community-hub-test",
  brokers: ["kafka-19548063-mosescsunday1-7ea3.a.aivencloud.com:22854"],
  ssl: {
    rejectUnauthorized: false,
    ca: [fs.readFileSync(sslCAPath, "utf8")],
    cert: fs.readFileSync(sslCertPath, "utf8"),
    key: fs.readFileSync(sslKeyPath, "utf8"),
  },
  logLevel: 2,
});

const producer = kafka.producer();

async function testConnection() {
  try {
    console.log("\nConnecting to Kafka...");
    await producer.connect();
    console.log("✅ Kafka connected successfully!");

    console.log("Sending test message...");
    await producer.send({
      topic: "test-topic",
      messages: [{ value: JSON.stringify({ test: "hello", time: new Date().toISOString() }) }],
    });
    console.log("✅ Test message sent!");

    await producer.disconnect();
    console.log("✅ Kafka disconnected cleanly");
    process.exit(0);
  } catch (error) {
    console.error("❌ Kafka connection failed:", error.message);
    process.exit(1);
  }
}

testConnection();
