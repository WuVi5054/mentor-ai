// components/Agent.js
import { useEffect, useRef } from 'react';
import Script from 'next/script';

export default function Agent({ agentId }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.onload = () => {
      // Initialize the widget after the script has loaded
      const widget = document.createElement('elevenlabs-convai');
      widget.setAttribute('agent-id', agentId);
      containerRef.current.appendChild(widget);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [agentId]);

  return <div ref={containerRef}></div>;
}