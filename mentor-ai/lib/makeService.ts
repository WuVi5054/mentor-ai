export async function saveToMake(transcript: { text: string, source: string }) {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL || '', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: transcript.text,
                source: transcript.source,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save to Make.com');
        }

        return true;
    } catch (error) {
        console.error('Error saving to Make.com:', error);
        return false;
    }
}

export async function getConversationHistory(userId: string) {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_MAKE_RETRIEVAL_URL || '', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error('Failed to retrieve from Make.com');
        }

        return await response.json();
    } catch (error) {
        console.error('Error retrieving from Make.com:', error);
        return [];
    }
}