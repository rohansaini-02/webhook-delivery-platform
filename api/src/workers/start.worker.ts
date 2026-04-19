import { startDispatcher } from './dispatcher.worker';
import logger from '../config/logger';

// Standard worker entry point for production
logger.info('🚀 Initializing Delivery Worker Process...');

startDispatcher().catch(err => {
    logger.error('CRITICAL: Worker process failed to initiate:', err);
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received: closing worker process...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received: closing worker process...');
    process.exit(0);
});
