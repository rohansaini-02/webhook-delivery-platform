import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = () => {
    app.listen(PORT, () => {
        console.log(`[Server]: Webhook Delivery API is running on port ${PORT}`);
    });
};

startServer();
