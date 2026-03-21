/// <reference types="node" />
import axios from 'axios';

const API_URL = 'http://127.0.0.1:3000/api/v1';
const API_KEY = 'dev-secret-api-key-12345'; 
const headers = { Authorization: `Bearer ${API_KEY}` };

const runTests = async () => {
    try {
        console.log('📡 1. Checking API Health...');
        const health = await axios.get('http://127.0.0.1:3000/health');
        console.log('✅ Health:', health.data);

        console.log('\n🔔 2. Creating Webhook Subscription...');
        const sub = await axios.post(`${API_URL}/subscriptions`, {
            url: 'https://httpbin.org/post', // Public echo server to test HTTP POST
            events: ['developer.test']
        }, { headers });
        console.log('✅ Subscription ID:', sub.data.data.id);
        console.log('✅ Secret Key Generated:', sub.data.data.secret);

        console.log('\n📦 3. Ingesting Event (developer.test)...');
        const event = await axios.post(`${API_URL}/events`, {
            type: 'developer.test',
            payload: { message: 'This is an end-to-end webhook delivery test!' }
        }, { headers });
        console.log('✅ Event queued for RabbitMQ:', event.data.data);

        console.log('\n⏳ 4. Waiting for Worker to Process (5 seconds)...');
        await new Promise(r => setTimeout(r, 5000));

        console.log('\n📋 5. Fetching Delivery Logs...');
        const deliveries = await axios.get(`${API_URL}/deliveries`, { headers });
        const recentDelivery = deliveries.data.data[0];
        console.log(`✅ Delivery Status: ${recentDelivery.status}`);
        console.log(`✅ HTTP Response Code: ${recentDelivery.lastStatusCode}`);
        console.log(`✅ Attempts Taken: ${recentDelivery.attempts}`);

        console.log('\n📊 6. Fetching System Metrics...');
        const metrics = await axios.get(`${API_URL}/metrics`, { headers });
        console.log('✅ Metrics Snapshot:');
        console.log(JSON.stringify(metrics.data.data, null, 2));

        console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
        process.exit(0);
    } catch (e: any) {
        console.error('❌ Test failed:', e.response?.data || e.message);
        process.exit(1);
    }
}
runTests();
