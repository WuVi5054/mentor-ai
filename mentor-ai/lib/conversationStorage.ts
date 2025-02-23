// lib/conversationStorage.ts

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface ConversationData {
    conversationId: string;
    userId: string;
    startTime: string;
    endTime?: string;
    messages: Message[];
    metadata?: Record<string, any>;
}

export class ConversationStorage {
    private makeWebhookUrl: string;
    private makeRetrievalUrl: string;

    constructor(makeWebhookUrl: string, makeRetrievalUrl: string) {
        this.makeWebhookUrl = makeWebhookUrl;
        this.makeRetrievalUrl = makeRetrievalUrl;
    }

    async saveConversation(conversationData: ConversationData): Promise<boolean> {
        try {
            const response = await fetch(this.makeWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationId: conversationData.conversationId,
                    userId: conversationData.userId,
                    startTime: conversationData.startTime,
                    endTime: conversationData.endTime,
                    messages: JSON.stringify(conversationData.messages),
                    metadata: JSON.stringify(conversationData.metadata || {}),
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('Error saving conversation:', error);
            return false;
        }
    }

    async getUserHistory(userId: string): Promise<ConversationData[]> {
        try {
            const response = await fetch(this.makeRetrievalUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error('Failed to retrieve conversation history');
            }

            const data = await response.json();
            
            // Parse the stringified JSON fields
            return data.map((conv: any) => ({
                ...conv,
                messages: JSON.parse(conv.messages),
                metadata: conv.metadata ? JSON.parse(conv.metadata) : {},
            }));
        } catch (error) {
            console.error('Error retrieving conversation history:', error);
            return [];
        }
    }

    async updateConversation(conversationId: string, newData: Partial<ConversationData>): Promise<boolean> {
        try {
            const response = await fetch(this.makeWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'update',
                    conversationId,
                    ...newData,
                    messages: newData.messages ? JSON.stringify(newData.messages) : undefined,
                    metadata: newData.metadata ? JSON.stringify(newData.metadata) : undefined,
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('Error updating conversation:', error);
            return false;
        }
    }
}