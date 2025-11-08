const amqp = require("amqplib");

class MessageBroker {
  constructor() {
    this.channel = null;
  }

  async connect() { // dùng để kết nối với RabbitMQ
    console.log("Connecting to RabbitMQ...");

    setTimeout(async () => {
      try {
        const connection = await amqp.connect("amqp://rabbitmq:5672");
        this.channel = await connection.createChannel();
        await this.channel.assertQueue("products");
        console.log("RabbitMQ connected");
      } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err.message);
      }
    }, 20000); // delay 10 seconds to wait for RabbitMQ to start
  }

  async publishMessage(queue, message) { //xuất bản tin nhắn đến hàng đợi được chỉ định
    if (!this.channel) { 
      console.error("No RabbitMQ channel available."); //nếu không có kênh RabbitMQ nào có sẵn, in ra lỗi và trả về
      return;
    }

    try {
      await this.channel.sendToQueue( //
        queue,//gửi tin nhắn đến hàng đợi được chỉ định
        Buffer.from(JSON.stringify(message)) //chuyển đổi tin nhắn thành chuỗi JSON và sau đó thành một buffer
      );
    } catch (err) {
      console.log(err);
    }
  }

  async consumeMessage(queue, callback) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available.");
      return;
    }

    try {
      await this.channel.consume(queue, (message) => {
        const content = message.content.toString();
        const parsedContent = JSON.parse(content);
        callback(parsedContent);
        this.channel.ack(message);
      });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = new MessageBroker();
