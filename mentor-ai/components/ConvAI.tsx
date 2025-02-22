"use client"

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Conversation } from "@11labs/client";
import { cn } from "@/lib/utils";

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

export function ConvAI() {
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [avatarImage, setAvatarImage] = useState<string>("/Mr-Beast.png");
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [conversationId, setConversationId] = useState<string>("");
    const [userId, setUserId] = useState<string>("");

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
        // Add initial greeting message
        addToTranscript("Hi", "ai");
        
        const signedUrl = await getSignedUrl();
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
                    <div className="flex flex-col gap-y-4 text-center">
                        <div className="relative">
                            <img 
                                src={avatarImage} 
                                alt="AI Avatar"
                                className={cn('w-32 h-32 rounded-full mx-auto my-16',
                                    isSpeaking ? 'animate-pulse' : '',
                                    isConnected ? 'border-4 border-green-500' : 'border-4 border-gray-300'
                                )}
                            />
                        </div>

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

async function getSignedUrl(): Promise<string> {
    const response = await fetch('/api/signed-url');
    if (!response.ok) {
        throw Error('Failed to get signed url');
    }
    const data = await response.json();
    return data.signedUrl;
}