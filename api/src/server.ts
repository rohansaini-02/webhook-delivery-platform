import dotenv from 'dotenv';
import app from './app';
import prisma from './config/db';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import logger from './config/logger';
import { connectRabbitMQ, closeRabbitMQ } from './config/rabbitmq';
import { startDispatcher } from './workers/dispatcher.worker';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    // Environment Check
    console.log('--- Backend Health Check ---');
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ LOADED' : '❌ MISSING');
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ LOADED' : '❌ MISSING');
    console.log('BACKEND_URL:', process.env.BACKEND_URL || '❌ NOT SET');
    console.log('---------------------------');

    // 1. Database Connection Retry Logic
    let connected = false;
    let retries = 5;
    while (retries > 0 && !connected) {
        try {
            await prisma.$connect();
            logger.info('[Database] ✅ Connected successfully');
            connected = true;
        } catch (err: any) {
            retries -= 1;
            logger.warn(`[Database] ⚠️ Connection failed. ${retries} retries left... Error: ${err.message}`);
            if (retries === 0) {
                logger.error('[Database] ❌ Critical: Could not establish database connection after 5 attempts.');
                // We keep going but log the error, or you can process.exit(1)
            } else {
                await new Promise(res => setTimeout(res, 5000)); // Wait 5s before retry
            }
        }
    }

    // 2. Admin Seeder
    if (connected) {
        try {
            const adminCount = await prisma.admin.count();
            if (adminCount === 0) {
                logger.info('No admin found. Seeding default admin...');
                const defaultPasswordHash = await bcrypt.hash('password123', 10);
                const defaultApiKey = 'sk_live_' + crypto.randomBytes(32).toString('hex');
                
                await prisma.admin.create({
                    data: {
                        username: 'admin',
                        passwordHash: defaultPasswordHash,
                        apiKey: defaultApiKey
                    }
                });
                logger.info('Default admin seeded. Username: admin, Password: password123');
            }
        } catch (e) {
            logger.error('Failed to seed admin:', e);
        }
    }

    // 3. Services Startup
    await connectRabbitMQ();
    startDispatcher();
    
    app.listen(PORT, () => {
        logger.info(`Webhook Delivery API is running on port ${PORT}`);
    });
};

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    try {
        await closeRabbitMQ();
        await prisma.$disconnect();
        logger.info('All connections closed. Goodbye.');
        process.exit(0);
    } catch (err) {
        logger.error('Error during shutdown:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
