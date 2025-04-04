import { connect } from "https://deno.land/x/redis@v0.29.4/mod.ts";

const redis = await connect({
    hostname: "redis-19724.c262.us-east-1-3.ec2.redns.redis-cloud.com",  // Example: "redis-12345.c250.us-east-1-3.ec2.cloud.redislabs.com"
    port: 19724,                 // Replace with your actual port
    password: "cu4Eg3dkCSgCTeTosurCWbGAkpVMXBpU", // If authentication is required
});

// Test connection
const pong = await redis.ping();
console.log("Redis Connected:", pong);

// Set and Get a Key
await redis.set("message", "Hello from Deno!");
const value = await redis.get("message");
console.log("Stored value:", value);

Deno.exit();