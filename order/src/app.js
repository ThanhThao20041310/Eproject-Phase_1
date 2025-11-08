const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const config = require("./config");
const Order = require("./models/order");

class App {
  constructor() {
    this.app = express();
    this.connectDB();
    this.setMiddlewares();
    this.setRoutes();
    this.setupOrderConsumer();
  }

  async connectDB() {
    try {
      await mongoose.connect(config.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ MongoDB connected");
    } catch (err) {
      console.error("❌ MongoDB connection error:", err.message);
    }
  }

  setMiddlewares() {
    this.app.use(express.json());
  }

  setRoutes() {
    // Kiểm tra service hoạt động
    this.app.get("/", (req, res) => {
      res.send("✅ Order service is running!");
    });

    /**
     * ✅ API: Tạo đơn hàng thủ công qua Postman
     * Chấp nhận dữ liệu theo 2 cách:
     * - Cách 1: Mảng ObjectId của Product
     * - Cách 2: Mảng object { name, price } (để test nhanh)
     */
    this.app.post("/api/orders", async (req, res) => {
      try {
        const { products, username } = req.body;

        if (!products || !username) {
          return res.status(400).json({ message: "Missing products or username" });
        }

        let totalPrice = 0;
        let formattedProducts = [];

        // 🔹 Trường hợp: Người dùng gửi mảng ObjectId (dạng chuỗi)
        if (typeof products[0] === "string") {
          totalPrice = 0; // chưa biết giá, có thể lấy sau từ Product DB
          formattedProducts = products; // giữ nguyên ID
        }
        // 🔹 Trường hợp: Gửi mảng object { name, price }
        else if (typeof products[0] === "object") {
          totalPrice = products.reduce((sum, p) => sum + (p.price || 0), 0);
          // Lưu tạm vào DB dưới dạng plain object (schema sẽ được điều chỉnh)
          formattedProducts = products;
        }

        const newOrder = new Order({
          products: formattedProducts,
          user: username,
          totalPrice,
        });

        await newOrder.save();
        res.status(201).json({
          message: "✅ Order created successfully",
          order: newOrder,
        });
      } catch (err) {
        console.error("❌ Error creating order:", err);
        res.status(500).json({
          message: "Error creating order",
          error: err.message,
        });
      }
    });
  }

  async setupOrderConsumer() {
    console.log("⏳ Connecting to RabbitMQ...");

    setTimeout(async () => {
      try {
        const amqpServer = config.rabbitMQURI || "amqp://rabbitmq:5672";
        const connection = await amqp.connect(amqpServer);
        console.log("✅ Connected to RabbitMQ");

        const channel = await connection.createChannel();
        await channel.assertQueue(config.rabbitMQQueue || "orders");

        channel.consume(config.rabbitMQQueue || "orders", async (data) => {
          console.log("📦 Consuming ORDER service message...");
          const { products, username, orderId } = JSON.parse(data.content);

          const totalPrice = products.reduce((sum, p) => sum + (p.price || 0), 0);

          const newOrder = new Order({
            products,
            user: username,
            totalPrice,
          });

          await newOrder.save();
          channel.ack(data);
          console.log("✅ Order saved to DB and ACK sent.");

          // Gửi lại cho hàng đợi "products"
          channel.sendToQueue(
            "products",
            Buffer.from(
              JSON.stringify({
                orderId,
                user: username,
                products,
                totalPrice,
              })
            )
          );
        });
      } catch (err) {
        console.error("❌ Failed to connect to RabbitMQ:", err.message);
      }
    }, 10000);
  }

  start() {
    this.server = this.app.listen(config.port, () =>
      console.log(`🚀 Order service started on port ${config.port}`)
    );
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("🛑 Order service stopped");
  }
}

module.exports = App;
