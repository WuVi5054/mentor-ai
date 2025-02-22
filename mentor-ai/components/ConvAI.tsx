"use client"

import {Button} from "@/components/ui/button";
import * as React from "react";
import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Conversation} from "@11labs/client";
import {cn} from "@/lib/utils";

async function requestMicrophonePermission() {
    try {
        await navigator.mediaDevices.getUserMedia({audio: true})
        return true
    } catch {
        console.error('Microphone permission denied')
        return false
    }
}

async function getSignedUrl(): Promise<string> {
    const response = await fetch('/api/signed-url')
    if (!response.ok) {
        throw Error('Failed to get signed url')
    }
    const data = await response.json()
    return data.signedUrl
}

export function ConvAI() {
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [avatarImage, setAvatarImage] = useState<string>("/Mr-Beast.png")

    async function startConversation() {
        const hasPermission = await requestMicrophonePermission()
        if (!hasPermission) {
            alert("No permission")
            return;
        }
        const signedUrl = await getSignedUrl()
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
                        <div className="relative">
                            <img 
                                src={avatarImage} 
                                alt="AI Avatar"
                                className={cn('w-32 h-32 rounded-full mx-auto my-16',
                                    isSpeaking ? 'animate-pulse' : '',
                                    isConnected ? 'border-4 border-green-500' : 'border-4 border-gray-300'
                                )}
                            />
                            {/* <div className={cn('orb absolute top-0 left-1/2 -translate-x-1/2',
                                isSpeaking ? 'animate-orb' : (conversation && 'animate-orb-slow'),
                                isConnected ? 'orb-active' : 'orb-inactive')}
                            ></div> */}
                        </div>

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