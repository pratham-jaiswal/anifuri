import React, { forwardRef } from "react";
import { Dimensions, StyleSheet, View, ToastAndroid, Platform } from "react-native";
import { WebView } from "react-native-webview";

interface VideoWebViewProps {
  sourceUrl: string;
  subtitles: Record<string, string>;
}

const VideoWebView = forwardRef<any, VideoWebViewProps>(
  ({ sourceUrl, subtitles }, ref) => {
    const entries = Object.entries(subtitles);

    const hasEnglish = entries.find(
      ([label]) => label.toLowerCase() === "english"
    );
    const defaultLabel = hasEnglish ? "english" : entries[0]?.[0];

    const trackTags = entries
      .map(([label, base64]) => {
        const srclang = label.slice(0, 2).toLowerCase();
        const isDefault =
          label.toLowerCase() === defaultLabel?.toLowerCase() ? " default" : "";
        return `<track label="${label}" kind="subtitles" srclang="${srclang}" src="data:text/vtt;base64,${base64}"${isDefault}>`;
      })
      .join("\n");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: black;
              height: 100%;
              overflow: hidden;
            }
            video {
              width: 100%;
              height: 100%;
              background: black;
            }
            ::cue {
              font-size: 20px;
              color: white;
              background: rgba(0, 0, 0, 0.5);
            }
          </style>
        </head>
        <body>
          <video id="video" controls autoplay playsinline>
            <source src="${sourceUrl}" type="application/x-mpegURL" onerror="window.ReactNativeWebView.postMessage('error_source')">
            ${trackTags}
          </video>

          <script>
            const video = document.getElementById('video');

            window.ReactNativeWebView.postMessage("loading");

            video.addEventListener("loadeddata", () => {
              window.ReactNativeWebView.postMessage("loaded");
            });

            video.addEventListener("error", () => {
              window.ReactNativeWebView.postMessage("error");
            });
          </script>
        </body>
      </html>
    `;

    const handleWebViewMessage = (event: any) => {
      const message = event.nativeEvent.data;
      if (Platform.OS === "android") {
        if (message === "loading") {
          ToastAndroid.show("Loading video...", ToastAndroid.SHORT);
        } else if (message === "loaded") {
          ToastAndroid.show("Video is ready to play!", ToastAndroid.SHORT);
        } else if (message === "error" || message === "error_source") {
          ToastAndroid.show(
            "Failed to load video. Try another server or try again later.",
            ToastAndroid.LONG
          );
        }
      }
    };

    return (
      <View style={styles.container}>
        <WebView
          ref={ref}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          javaScriptEnabled
          scrollEnabled={false}
          bounces={false}
          onMessage={handleWebViewMessage}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("window").width * (10 / 16),
    backgroundColor: "black",
  },
});

export default VideoWebView;
