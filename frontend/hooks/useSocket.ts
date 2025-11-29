import { useEffect, useRef, useState, useCallback } from "react";

export function useSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");

  const send = useCallback((msg: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus("open");
    ws.onclose = () => setStatus("closed");
    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setData(parsed);
    };
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => ws.close();
  }, [url]);

  return { data, status, send };
}
