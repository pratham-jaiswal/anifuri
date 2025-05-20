import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VideoWebView from "@/videoWebView";
import { encode as btoa } from "base-64";
import { encode as utf8Encode } from "utf8";

interface AnimeInfo {
  id: string;
  name: string;
  poster: string;
  description: string;
  stats: {
    rating: string;
    type: string;
  };
}

interface Episode {
  episodeId: string;
  number: string;
  title: string;
  isFiller: boolean;
}

interface ServerData {
  sources: Array<{ url: string; type: string }> | null;
  sub: string[];
  dub: string[];
  captions: Array<{ file: string; label: string; kind: string }> | null;
}

export default function videoPlayer() {
  const webviewRef = useRef(null);
  const params = useLocalSearchParams<{
    serverData: string;
    animeInfo: string;
    selectedEpisode: string;
  }>();

  const serverData: ServerData | null = JSON.parse(params.serverData);
  const animeInfo: AnimeInfo = JSON.parse(params.animeInfo);
  const selectedEpisode: Episode = JSON.parse(params.selectedEpisode);

  const [selectedVideoSource, setSelectedVideoSource] = useState(
    serverData?.sources?.[0]?.url || null
  );
  const [lastWatchedEpisode, setLastWatchedEpisode] = useState<string | null>(
    null
  );
  const [subtitles, setSubtitles] = useState<Record<string, string>>({});
  useState<string>("");

  useEffect(() => {
    if (serverData && serverData.captions && serverData.captions.length > 0) {
      const fetchAndEncodeCaptions = async () => {
        const subtitleMap: Record<string, string> = {};

        for (const caption of serverData.captions!) {
          try {
            const res = await fetch(caption.file);
            const text = await res.text();

            if (text) {
              const encoded = btoa(utf8Encode(text));
              let key = caption.label.toLowerCase();
              let uniqueKey = key;
              let counter = 1;

              while (subtitleMap.hasOwnProperty(uniqueKey)) {
                uniqueKey = `${key}${counter}`;
                counter++;
              }

              subtitleMap[uniqueKey] = encoded;
            }
          } catch (err) {
            console.error(
              `Error fetching or encoding caption "${caption.label}":`,
              err
            );
          }
        }

        setSubtitles(subtitleMap);
      };

      fetchAndEncodeCaptions();
    } else {
      setSubtitles({});
    }
  }, [serverData?.captions]);

  useEffect(() => {
    if (selectedEpisode?.number && animeInfo.id) {
      const message = `Episode ${selectedEpisode?.number}`;
      AsyncStorage.setItem(`anime:${animeInfo.id}`, message)
        .then(() => {
          setLastWatchedEpisode(message);
        })
        .catch((err) => console.error(err));
    }
  }, [selectedEpisode?.number, animeInfo.id]);

  const fetchSourcesFromServer = async (serverName: string, type: string) => {
    return axios
      .get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/episode-sources-from-server?animeId=${animeInfo.id}&episodeId=${selectedEpisode?.episodeId}&serverName=${serverName}&type=${type}`
      )
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.error(err);
        return null;
      });
  };

  return (
    <View style={styles.container}>
      {selectedVideoSource && (
        <VideoWebView
          ref={webviewRef}
          sourceUrl={selectedVideoSource}
          subtitles={subtitles}
        />
      )}
      <ScrollView style={styles.serverContainer}>
        <Text style={styles.animeTitle}>{animeInfo.name}</Text>
        <Text style={styles.episodeDetails}>
          Ep. {selectedEpisode.number}: {selectedEpisode.title}
        </Text>

        <Text style={styles.serverSubHeading}>Sub Servers</Text>

        <View style={styles.serverRow}>
          {serverData?.sub.map((subServer, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (
                  index === 0 &&
                  serverData.sources &&
                  serverData.sources.length > 0
                ) {
                  setSelectedVideoSource(serverData.sources[0]?.url);
                } else {
                  ToastAndroid.show(
                    "Fetching video. Please wait...",
                    ToastAndroid.SHORT
                  );
                  fetchSourcesFromServer(subServer, "sub")
                    .then((data) => {
                      const sources = data?.data.sources;

                      if (sources && sources.length > 0) {
                        setSelectedVideoSource(sources[0]?.url);
                      }
                    })
                    .catch((err) => console.error(err));
                }
              }}
              style={styles.smallBtn}
            >
              <Text style={styles.serverName}>{subServer.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.serverSubHeading}>Dub Servers</Text>

        <View style={styles.serverRow}>
          {serverData?.dub.map((dubServer, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                ToastAndroid.show(
                  "Fetching video. Please wait...",
                  ToastAndroid.SHORT
                );
                fetchSourcesFromServer(dubServer, "dub")
                  .then((data) => {
                    const sources = data?.data.sources;

                    if (sources && sources.length > 0) {
                      setSelectedVideoSource(sources[0]?.url);
                    }
                  })
                  .catch((err) => console.error(err));
              }}
              style={styles.smallBtn}
            >
              <Text style={styles.serverName}>{dubServer.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#201f31",
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  serverContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  picker: {
    width: "100%",
    backgroundColor: "#383653",
    color: "#ffbade",
    marginBottom: 10,
    borderRadius: 5,
  },
  animeTitle: {
    fontSize: 20,
    color: "#ffbade",
    marginBottom: 10,
    fontFamily: "monospace",
  },
  episodeDetails: {
    fontSize: 16,
    color: "#ffbade",
    marginBottom: 10,
    fontFamily: "monospace",
  },
  serverSubHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
    color: "#ffbade",
    fontFamily: "monospace",
  },
  serverRow: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 10,
  },
  serverName: {
    color: "#201f31",
    fontSize: 14,
    fontFamily: "monospace",
  },
  smallBtn: {
    marginTop: 5,
    padding: 10,
    backgroundColor: "#ffbade",
    borderRadius: 5,
    alignItems: "center",
    fontFamily: "monospace",
  },
});
