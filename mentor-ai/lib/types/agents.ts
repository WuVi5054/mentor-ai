// Types for multi-agent voice chat system

export interface Agent {
    id: string;
    name: string;
    voice_id: string; // ElevenLabs voice ID
    knowledge_domain: string;
    avatar_url?: string;
}

export interface AgentState {
    id: string;
    is_speaking: boolean;
    is_listening: boolean;
    is_thinking: boolean;
    last_response_time?: Date;
}

export interface AgentMessage {
    agent_id: string;
    content: string;
    timestamp: Date;
    type: 'text' | 'voice';
    response_to?: string; // ID of the message this is responding to
    voice_url?: string; // URL of the generated voice audio
}

export interface ConversationState {
    id: string;
    active_agents: Agent[];
    agent_states: Record<string, AgentState>;
    messages: AgentMessage[];
    current_speaker?: string; // ID of the currently speaking agent
    is_user_speaking: boolean;
}

export interface AgentResponse {
    text: string;
    audio_data?: ArrayBuffer;
    responding_to?: string;
    metadata?: {
        confidence?: number;
        processing_time?: number;
        knowledge_source?: string;
    };
}