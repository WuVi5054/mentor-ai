const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testWebhook() {
    const makeWebhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL;
    if (!makeWebhookUrl) {
        throw new Error('Make.com webhook URL not configured');
    }

    // Create a sample transcript
    const sampleData = {
        timestamp: new Date().toISOString(),
        conversation_id: 'test-' + Date.now().toString(36),
        user_id: 'test-user-' + Math.random().toString(36).substr(2, 9),
        messages: [
            {
                text: "Hello, how can I help you today?",
                role: "ai",
                timestamp: new Date().toISOString(),
                agent_id: "test-agent"
            },
            {
                text: "I'd like to learn about machine learning.",
                role: "user",
                timestamp: new Date(Date.now() + 1000).toISOString(),
                agent_id: null
            },
            {
                text: "I'd be happy to explain machine learning concepts to you.",
                role: "ai",
                timestamp: new Date(Date.now() + 2000).toISOString(),
                agent_id: "test-agent"
            }
        ],
        agents_involved: ["test-agent"],
        metadata: {
            totalMessages: 3,
            duration: 2000,
            platform: "web",
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 2000).toISOString()
        }
    };

    try {
        const response = await fetch(makeWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sampleData)
        });

        if (!response.ok) {
            throw new Error(`Failed to send data to Make.com: ${response.statusText}`);
        }

        console.log('Successfully sent test data to Make.com');
        console.log('Response status:', response.status);
        const responseData = await response.text();
        console.log('Response body:', responseData);
    } catch (error) {
        console.error('Error sending data to Make.com:', error);
    }
}

testWebhook();