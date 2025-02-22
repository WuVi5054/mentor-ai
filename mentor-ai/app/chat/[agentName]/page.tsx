import {ConvAI} from "@/components/ConvAI";
import {agents} from "@/config/agents";
import {notFound} from "next/navigation";

interface ChatPageProps {
    params: {
        agentName: string
    }
}

export default function ChatPage({params}: ChatPageProps) {
    const agent = agents.find(a => a.name.toLowerCase() === params.agentName.toLowerCase());
    
    if (!agent) {
        notFound();
    }

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center">
                <ConvAI preselectedAgent={agent}/>
            </main>
        </div>
    );
}