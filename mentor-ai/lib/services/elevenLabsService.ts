import { Agent, AgentResponse, AgentMessage } from '../types/agents';

export class ElevenLabsService {
    private apiKey: string;
    private baseUrl: string = 'https://api.elevenlabs.io/v1';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateVoice(text: string, voiceId: string): Promise<ArrayBuffer> {
        const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': this.apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate voice');
        }

        return await response.arrayBuffer();
    }

    async createVoiceMessage(agent: Agent, text: string): Promise<AgentMessage> {
        const audioData = await this.generateVoice(text, agent.voice_id);
        const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        return {
            agent_id: agent.id,
            content: text,
            timestamp: new Date(),
            type: 'voice',
            voice_url: audioUrl
        };
    }

    async processAgentResponse(agent: Agent, response: AgentResponse): Promise<AgentMessage> {
        // If audio data is not provided, generate it
        if (!response.audio_data) {
            response.audio_data = await this.generateVoice(response.text, agent.voice_id);
        }

        const audioBlob = new Blob([response.audio_data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        return {
            agent_id: agent.id,
            content: response.text,
            timestamp: new Date(),
            type: 'voice',
            voice_url: audioUrl,
            response_to: response.responding_to
        };
    }

    // Clean up resources
    cleanupVoiceUrl(message: AgentMessage) {
        if (message.voice_url) {
            URL.revokeObjectURL(message.voice_url);
        }
    }
}