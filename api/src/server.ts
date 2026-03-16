import dotenv from 'dotenv';
import app from './app';

dotenv.config();

import { connectRabbitMQ } from './config/rabbitmq';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectRabbitMQ();
    app.listen(PORT, () => {
        console.log(`[Server]: Webhook Delivery API is running on port ${PORT}`);
    });
};

startServer();
