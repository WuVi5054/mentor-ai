import {agents} from "@/config/agents";
import {cn} from "@/lib/utils";
import Image from "next/image";

export default function Home() {
    return (
        <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-12">Choose Your AI Mentor</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {agents.map((agent) => (
                        <a
                            key={agent.id}
                            href={`/chat/${agent.name.toLowerCase().replace(/ /g, '-')}`}
                            className={cn(
                                'cursor-pointer p-4 rounded-xl transition-all no-underline',
                                'hover:bg-primary/5 hover:scale-105',
                                'flex flex-col items-center'
                            )}
                        >
                            <Image 
                                src={agent.avatar} 
                                alt={agent.name}
                                width={100}
                                height={100}
                                className="w-[100px] h-[100px] rounded-full mb-4 border-4 border-gray-300 object-cover"
                            />
                            <h2 className="text-xl font-medium text-center mb-2">{agent.name}</h2>
                            <p className="text-sm text-center text-muted-foreground">{agent.description}</p>
                        </a>
                    ))}
                </div>
            </main>
        </div>
    );
}
