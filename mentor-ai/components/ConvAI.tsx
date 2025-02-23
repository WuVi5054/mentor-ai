"use client"

import { Button } from "@/components/ui/button";
import * as React from "react";

import {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Conversation} from "@11labs/client";
import {cn} from "@/lib/utils";
import {agents, AgentConfig} from "@/config/agents";
import Image from "next/image";


// Enhanced transcript entry type
type TranscriptEntry = {
    text: string;
    role: 'ai' | 'user';
    timestamp: Date;
    agent_id?: string;
};

type ConversationData = {
    timestamp: string;
    conversation_id: string;
    user_id: string;
    messages: string;
    agents_involved: string;
    metadata: string;
};
export function ConvAI({ preselectedAgent }: { preselectedAgent?: AgentConfig }) {
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [avatarImage, setAvatarImage] = useState<string>("/Mr-Beast.png");
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [conversationId, setConversationId] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const selectedAgent = preselectedAgent || agents[0]
    
    useEffect(() => {
        // Generate a unique conversation ID on component mount
        setConversationId(generateUniqueId());
        // You might want to get this from your auth system
        setUserId("test-user-" + Math.random().toString(36).substr(2, 9));
    }, []);

    const generateUniqueId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const sendToMake = async () => {
        try {
            const makeWebhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL;
            if (!makeWebhookUrl) {
                throw new Error('Make.com webhook URL not configured');
            }

            // Prepare the conversation data
            const conversationData = {
                timestamp: new Date().toISOString(),
                conversation_id: conversationId,
                user_id: userId,
                messages: JSON.stringify(transcript.map(t => ({
                    text: t.text,
                    role: t.role,
                    timestamp: t.timestamp.toISOString(),
                    agent_id: t.agent_id || 'default-agent'
                }))),
                agents_involved: JSON.stringify([...new Set(transcript
                    .filter(t => t.role === 'ai')
                    .map(t => t.agent_id || 'default-agent'))]),
                metadata: JSON.stringify({
                    totalMessages: transcript.length,
                    duration: transcript.length > 0 
                        ? transcript[transcript.length - 1].timestamp.getTime() - transcript[0].timestamp.getTime()
                        : 0,
                    platform: 'web',
                    start_time: transcript.length > 0 ? transcript[0].timestamp.toISOString() : null,
                    end_time: transcript.length > 0 ? transcript[transcript.length - 1].timestamp.toISOString() : null
                })
            };

            // Send to Make.com webhook
            const response = await fetch(makeWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(conversationData)
            });
            console.log(conversationData)

            if (!response.ok) {
                throw new Error(`Failed to send data to Make.com: ${response.statusText}`);
            }

            console.log('Successfully sent conversation data to Make.com');
        } catch (error) {
            console.error('Error sending data to Make.com:', error);
            // You might want to implement retry logic here
        }
    };

    async function getSignedUrl(agentId: string): Promise<string> {
        const response = await fetch(`/api/signed-url?agentId=${agentId}`)
        if (!response.ok) {
            throw Error('Failed to get signed url')
        }
        const data = await response.json()
        return data.signedUrl
    }
    
    const addToTranscript = (text: string, role: 'ai' | 'user') => {
        setTranscript(prevTranscript => [...prevTranscript, {
            text,
            role,
            timestamp: new Date(),
        }]);
    };

    async function startConversation() {
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
            alert("No permission");
            return;
        }

        const signedUrl = await getSignedUrl(selectedAgent.id)
        const conversation = await Conversation.startSession({
            signedUrl: signedUrl,
            onConnect: () => {
                setIsConnected(true);
                setIsSpeaking(true);
                sendToMake();
            },
            onDisconnect: () => {
                setIsConnected(false);
                setIsSpeaking(false);
                // Send conversation data to Make.com when session ends
                sendToMake();
            },
            onError: (error) => {
                console.log(error);
                alert('An error occurred during the conversation');
            },
            onModeChange: ({mode}) => {
                setIsSpeaking(mode === 'speaking');
            },
            onMessage: (message) => {
                if (message.message) {
                    addToTranscript(message.message, message.source);
                }
            },
        });
        setConversation(conversation);
    }

    async function endConversation() {
        if (!conversation) {
            return;
        }
        await conversation.endSession();
        setConversation(null);
        // Send conversation data to Make.com when manually ending
        await sendToMake();
    }

    return (
        <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
            <Card className="rounded-3xl">
                <CardContent>
                    <CardHeader>
                        <CardTitle className="text-center">
                            {isConnected ? (
                                isSpeaking ? `Agent is speaking` : 'Agent is listening'
                            ) : (
                                'Disconnected'
                            )}
                        </CardTitle>
                    </CardHeader>

                    <div className={'flex flex-col gap-y-4 text-center'}>
                        {!preselectedAgent && (
                            <div className="grid grid-cols-5 gap-4 mb-8">
                                {agents.map((agent) => (
                                    <a
                                        key={agent.id}
                                        href={`/chat/${agent.name.toLowerCase().replace(/ /g, '-')}`}
                                        className={cn(
                                            'cursor-pointer p-2 rounded-lg transition-all no-underline',
                                            'hover:bg-primary/5'
                                        )}
                                    >
                                        <Image 
                                            src={agent.avatar} 
                                            alt={agent.name}
                                            width={80}
                                            height={80}
                                            className={cn('w-20 h-20 rounded-full mx-auto mb-2 object-cover',
                                                'border-4 border-gray-300'
                                            )}
                                        />
                                        <p className="text-sm text-center font-medium">{agent.name}</p>
                                        <p className="text-xs text-center text-muted-foreground">{agent.description}</p>
                                    </a>
                                ))}
                            </div>
                        )}
                        {preselectedAgent && (
                            <div className="mb-8">
                                <Image 
                                    src={selectedAgent.avatar} 
                                    alt={selectedAgent.name}
                                    width={128}
                                    height={128}
                                    className={cn('w-32 h-32 rounded-full mx-auto mb-4 object-cover',
                                        isSpeaking ? 'animate-pulse' : '',
                                        isConnected ? 'border-4 border-green-500' : 'border-4 border-gray-300'
                                    )}
                                />
                                <p className="text-xl text-center font-medium">{selectedAgent.name}</p>
                                <p className="text-sm text-center text-muted-foreground mt-2">{selectedAgent.description}</p>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <Button
                                variant="outline"
                                className="rounded-full"
                                size="lg"
                                disabled={conversation !== null && isConnected}
                                onClick={startConversation}
                            >
                                Start conversation
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-full"
                                size="lg"
                                disabled={conversation === null && !isConnected}
                                onClick={endConversation}
                            >
                                End conversation
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transcript Display */}
            <Card className="rounded-3xl">
                <CardHeader>
                    <CardTitle>Conversation Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        {transcript.map((entry, index) => (
                            <div 
                                key={index} 
                                className={cn(
                                    'p-4 rounded-lg',
                                    entry.role === 'ai' 
                                        ? 'bg-blue-100 ml-8' 
                                        : 'bg-gray-100 mr-8'
                                )}
                            >
                                <div className="font-semibold mb-1">
                                    {entry.role === 'ai' ? 'Agent' : 'You'}
                                </div>
                                <div>{entry.text}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {entry.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

async function requestMicrophonePermission() {
    try {
        await navigator.mediaDevices.getUserMedia({audio: true});
        return true;
    } catch {
        console.error('Microphone permission denied');
        return false;
    }
}

// async function getSignedUrl(): Promise<string> {
//     const response = await fetch('/api/signed-url');
//     if (!response.ok) {
//         throw Error('Failed to get signed url');
//     }
//     const data = await response.json();
//     return data.signedUrl;
// }