// Native implementation: renders the map page inside react-native-webview.
// The web build uses MapCanvas.web.tsx (iframe) instead — Metro picks the
// .web file automatically when bundling for web.
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export interface MapCanvasHandle {
  sendCmd: (cmd: object) => void;
}

export interface MapCanvasProps {
  html: string;
  onMessage: (msg: any) => void;
}

const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(
  ({ html, onMessage }, ref) => {
    const webRef = useRef<WebView<object>>(null);

    useImperativeHandle(ref, () => ({
      sendCmd: (cmd: object) => {
        webRef.current?.injectJavaScript(
          `window.__walkCmd && window.__walkCmd(${JSON.stringify(cmd)}); true;`
        );
      },
    }));

    const handleMessage = (e: WebViewMessageEvent) => {
      try {
        onMessage(JSON.parse(e.nativeEvent.data));
      } catch {
        // ignore non-JSON messages
      }
    };

    return (
      <WebView<object>
        ref={webRef}
        source={{ html }}
        originWhitelist={['*']}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        style={styles.web}
      />
    );
  }
);

const styles = StyleSheet.create({
  web: { flex: 1 },
});

export default MapCanvas;
