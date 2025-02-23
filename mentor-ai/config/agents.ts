export interface AgentConfig {
    id: string;
    name: string;
    avatar: string;
    description: string;
}

export const agents: AgentConfig[] = [
    {
        id: process.env.AGENT_ID_BEAST || "mr-beast",
        name: "Mr-Beast",
        avatar: "/Mr-Beast.png",
        description: "Energetic and philanthropic content creator"
    },
    {
        id: process.env.AGENT_ID_MARC_ANDREESEN || "marc-andreesen",
        name: "Marc-Andreesen",
        avatar: "/Marc-Andreesen.png",
        description: "Visionary Technologist & Capitalist"
    },
    {
        id: process.env.AGENT_ID_MERYL_STREEP || "meryl-streep",
        name: "Meryl-Streep",
        avatar: "/Meryl-Streep.png",
        description: "Masterful Storyteller"
    },
    {
        id: process.env.AGENT_ID_MARK_ZUCKERBURG || "mark-zuckerburg",
        name: "Mark-Zuckerburg",
        avatar: "/Mark-Zuckerburg.png",
        description: "Visionary builder and engineer"
    },
    {
        id: process.env.AGENT_ID_BEYONCE || "beyonce",
        name: "Beyonce",
        avatar: "/Beyonce.png",
        description: "Iconic Visionary and Artist"
    },
    {
        id: process.env.AGENT_ID_RICHARD_BRANSON || "richard-branson",
        name: "Richard-Branson",
        avatar: "/Richard-Branson.png",
        description: "Adventurous Entrepreneur and Innovator"
    },
    {
        id: process.env.AGENT_ID_HOWARD_STERN || "howard-stern",
        name: "Howard-Stern",
        avatar: "/Howard-Stern.png",
        description: "Legendary Radio Personality and Interviewer"
    },
    {
        id: process.env.AGENT_ID_OPRAH_WINFREY || "oprah-winfrey",
        name: "Oprah-Winfrey",
        avatar: "/Oprah-Winfrey.png",
        description: "Influential Media Icon and Philanthropist"
    },
    {
        id: process.env.AGENT_ID_TAYLOR_SWIFT || "taylor-swift",
        name: "Taylor-Swift",
        avatar: "/Taylor-Swift.png",
        description: "Global Pop Icon and Masterful Songwriter"
    },
    {
        id: process.env.AGENT_ID_NAVAL_RAVIKANT || "naval-ravikant",
        name: "Naval-Ravikant",
        avatar: "/Naval-Ravikant.png",
        description: "Philosophical Entrepreneur and Tech Investor"
    }
];