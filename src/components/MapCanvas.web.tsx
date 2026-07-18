// Web implementation: react-native-webview does not run in browsers, so on
// web the map page is rendered in an iframe instead. The map page posts
// messages to window.parent; commands are invoked on the iframe's window.
//
// The page is loaded from a blob: URL rather than srcDoc on purpose. A srcDoc
// document has an opaque ("null") origin, so MapLibre's tile worker sends
// `Origin: null` and the tile server rejects it — tiles hang in "loading"
// forever and the map never fires `load`. A blob: URL inherits this document's
// origin, so worker fetches carry a real Origin and succeed.
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';

export interface MapCanvasHandle {
  sendCmd: (cmd: object) => void;
}

export interface MapCanvasProps {
  html: string;
  onMessage: (msg: any) => void;
}

const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(
  ({ html, onMessage }, ref) => {
    const frameRef = useRef<any>(null);
    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;

    const blobUrl = useMemo(
      () => URL.createObjectURL(new Blob([html], { type: 'text/html' })),
      [html]
    );
    useEffect(() => () => URL.revokeObjectURL(blobUrl), [blobUrl]);

    useImperativeHandle(ref, () => ({
      sendCmd: (cmd: object) => {
        const win = frameRef.current?.contentWindow as any;
        if (win?.__walkCmd) win.__walkCmd(cmd);
      },
    }));

    useEffect(() => {
      const handler = (e: MessageEvent) => {
        if (e.source !== frameRef.current?.contentWindow) return;
        if (typeof e.data !== 'string') return;
        try {
          onMessageRef.current(JSON.parse(e.data));
        } catch {
          // ignore non-JSON messages
        }
      };
      (window as any).addEventListener('message', handler);
      return () => (window as any).removeEventListener('message', handler);
    }, []);

    return React.createElement('iframe', {
      ref: frameRef,
      src: blobUrl,
      style: { flex: 1, border: 0, width: '100%', height: '100%' },
    });
  }
);

export default MapCanvas;
