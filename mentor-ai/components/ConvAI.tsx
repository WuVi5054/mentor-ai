"use client"

import {Button} from "@/components/ui/button";
import * as React from "react";
import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Conversation} from "@11labs/client";
import {cn} from "@/lib/utils";
import {agents, AgentConfig} from "@/config/agents";

async function requestMicrophonePermission() {
    try {
        await navigator.mediaDevices.getUserMedia({audio: true})
        return true
    } catch {
        console.error('Microphone permission denied')
        return false
    }
}

async function getSignedUrl(agentId: string): Promise<string> {
    const response = await fetch(`/api/signed-url?agentId=${agentId}`)
    if (!response.ok) {
        throw Error('Failed to get signed url')
    }
    const data = await response.json()
    return data.signedUrl
}

export function ConvAI({ preselectedAgent }: { preselectedAgent?: AgentConfig }) {
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [selectedAgent, setSelectedAgent] = useState<AgentConfig>(preselectedAgent || agents[0])

    async function startConversation() {
        const hasPermission = await requestMicrophonePermission()
        if (!hasPermission) {
            alert("No permission")
            return;
        }
        const signedUrl = await getSignedUrl(selectedAgent.id)
        const conversation = await Conversation.startSession({
            signedUrl: signedUrl,
            onConnect: () => {
                setIsConnected(true)
                setIsSpeaking(true)
            },
            onDisconnect: () => {
                setIsConnected(false)
                setIsSpeaking(false)
            },
            onError: (error) => {
                console.log(error)
                alert('An error occurred during the conversation')
            },
            onModeChange: ({mode}) => {
                setIsSpeaking(mode === 'speaking')
            },
        })
        setConversation(conversation)
    }

    async function endConversation() {
        if (!conversation) {
            return
        }
        await conversation.endSession()
        setConversation(null)
    }

    return (
        <div className={"flex justify-center items-center gap-x-4"}>
            <Card className={'rounded-3xl'}>
                <CardContent>
                    <CardHeader>
                        <CardTitle className={'text-center'}>
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
                                        <img 
                                            src={agent.avatar} 
                                            alt={agent.name}
                                            className={cn('w-20 h-20 rounded-full mx-auto mb-2',
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
                                <img 
                                    src={selectedAgent.avatar} 
                                    alt={selectedAgent.name}
                                    className={cn('w-32 h-32 rounded-full mx-auto mb-4',
                                        isSpeaking ? 'animate-pulse' : '',
                                        isConnected ? 'border-4 border-green-500' : 'border-4 border-gray-300'
                                    )}
                                />
                                <p className="text-xl text-center font-medium">{selectedAgent.name}</p>
                                <p className="text-sm text-center text-muted-foreground mt-2">{selectedAgent.description}</p>
                            </div>
                        )}

                        <Button
                            variant={'outline'}
                            className={'rounded-full'}
                            size={"lg"}
                            disabled={conversation !== null && isConnected}
                            onClick={startConversation}
                        >
                            Start conversation
                        </Button>
                        <Button
                            variant={'outline'}
                            className={'rounded-full'}
                            size={"lg"}
                            disabled={conversation === null && !isConnected}
                            onClick={endConversation}
                        >
                            End conversation
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}