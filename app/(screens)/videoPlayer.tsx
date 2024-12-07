import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ToastAndroid,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useVideoPlayer, VideoView } from "expo-video";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEvent, useEventListener } from "expo";
import Svg, { Path } from "react-native-svg";
import Slider from "@react-native-community/slider";

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
  const params = useLocalSearchParams<{
    serverData: string;
    animeInfo: string;
    selectedEpisode: string;
  }>();

  const serverData: ServerData | null = JSON.parse(params.serverData);
  const animeInfo: AnimeInfo = JSON.parse(params.animeInfo);
  const selectedEpisode: Episode = JSON.parse(params.selectedEpisode);

  const ref = useRef<VideoView>(null);
  const [selectedVideoSource, setSelectedVideoSource] = useState(
    serverData?.sources?.[0]?.url || null
  );
  const [lastWatchedEpisode, setLastWatchedEpisode] = useState<string | null>(
    null
  );
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>("");

  useEffect(() => {
    if (serverData?.captions && serverData.captions.length > 0) {
      const englishCaption = serverData.captions.find(
        (caption: { label: string }, index: number, arr: { label: string }[]) =>
          caption.label.toLowerCase() === "english" &&
          index === arr.findIndex((c) => c.label.toLowerCase() === "english")
      );
      setSelectedSubtitle(
        englishCaption ? englishCaption.file : serverData.captions[0].file
      );
    } else {
      setSelectedSubtitle("");
    }
  }, [serverData?.captions]);

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

  const openVideoInVLC = async (url: string) => {
    const vlcUrl = `vlc://${url}`;

    const status = await AsyncStorage.getItem(`anime:${animeInfo.id}`);
    if (status !== "watched") {
      const message = `Episode ${selectedEpisode?.number}`;
      AsyncStorage.setItem(`anime:${animeInfo.id}`, message)
        .then(() => {})
        .catch((err) => console.error(err));
      setLastWatchedEpisode(message);
    }

    const supported = await Linking.canOpenURL(vlcUrl);
    if (supported) {
      Linking.openURL(vlcUrl).catch((err) => {
        Alert.alert("Error", "Failed to open VLC");
      });
    } else {
      Alert.alert(
        "VLC Not Installed",
        "VLC is not installed. Opening in the default browser instead.",
        [
          {
            text: "Open in Browser",
            onPress: () => Linking.openURL(url),
          },
          {
            text: "Download & Install VLC",
            onPress: () =>
              Linking.openURL(
                "https://play.google.com/store/apps/details?id=org.videolan.vlc"
              ),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  const player = useVideoPlayer(
    {
      uri: selectedVideoSource || undefined,
      metadata: {
        title:
          animeInfo.name +
          " - Ep." +
          selectedEpisode.number +
          ": " +
          selectedEpisode.title,
        artwork: animeInfo.poster,
      },
    },
    (player) => {
      player.loop = false;
      player.showNowPlayingNotification = true;
      player.staysActiveInBackground = true;
    }
  );

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const { muted } = useEvent(player, "mutedChange", {
    muted: player.muted,
  });

  const { volume } = useEvent(player, "volumeChange", {
    volume: player.volume,
  });

  useEventListener(player, 'statusChange', ({ status, error }) => {
    if (status === 'error' && error) {
      ToastAndroid.show('Failed to load video. Try another server or try again later.', ToastAndroid.LONG);
    }
    if (status === 'loading') {
      ToastAndroid.show("Loading video...", ToastAndroid.SHORT);
    }
    else if (status === 'readyToPlay') {
      ToastAndroid.show("Video is ready to play!", ToastAndroid.SHORT);
    }
  });

  useEffect(() => {
    if (isPlaying) {
      const message = `Episode ${selectedEpisode?.number}`;
      AsyncStorage.setItem(`anime:${animeInfo.id}`, message)
        .then(() => {
          setLastWatchedEpisode(message);
        })
        .catch((err) => console.error(err));
    }
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      <VideoView
        ref={ref}
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        startsPictureInPictureAutomatically
      />
      <ScrollView style={styles.serverContainer}>
        <View style={styles.videoControlBtns}>
          <View style={{ flexDirection: "row", alignItems: "center", width: "70%" }}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => {
                player.muted = player.muted ? false : true;
              }}
            >
              <Svg height={24} width={24} viewBox="0 -960 960 960">
                <Path
                  fill="#ffbade"
                  d={
                    muted
                      ? "M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Zm-36-130Z"
                      : volume > 0.5
                      ? "M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z"
                      : volume > 0 ? "M200-360v-240h160l200-200v640L360-360H200Zm440 40v-322q45 21 72.5 65t27.5 97q0 53-27.5 96T640-320ZM480-606l-86 86H280v80h114l86 86v-252ZM380-480Z" : "M280-360v-240h160l200-200v640L440-360H280Zm80-80h114l86 86v-252l-86 86H360v80Zm100-40Z"
                  }
                />
              </Svg>
            </TouchableOpacity>
            <Slider
              style={{ width: "100%" }}
              value={volume}
              onValueChange={(value) => {
                player.volume = value;
              }}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#ffbade"
              maximumTrackTintColor="#ffbade"
              thumbTintColor="#ffbade"
            />
          </View>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => {
              ref.current?.startPictureInPicture();
            }}
          >
            <Svg height={24} width={24} viewBox="0 -960 960 960">
              <Path
                fill="#ffbade"
                d="M80-520v-80h144L52-772l56-56 172 172v-144h80v280H80Zm80 360q-33 0-56.5-23.5T80-240v-200h80v200h320v80H160Zm640-280v-280H440v-80h360q33 0 56.5 23.5T880-720v280h-80ZM560-160v-200h320v200H560Z"
              />
            </Svg>
          </TouchableOpacity>
        </View>
        <Text style={styles.animeTitle}>{animeInfo.name}</Text>
        <Text style={styles.episodeDetails}>
          Ep. {selectedEpisode.number}: {selectedEpisode.title}
        </Text>
        <Text style={styles.serverSubHeading}>
          Select Subtitle{" "}
          <Ionicons
            name="information-circle"
            size={20}
            color="#ffbade"
            onPress={() =>
              Alert.alert(
                "Note",
                "Right now, subtitles can only be downloaded and used in VLC. The app's inbuilt video player does not support them."
              )
            }
          />
        </Text>
        <Picker
          selectedValue={selectedSubtitle}
          onValueChange={(itemValue) => setSelectedSubtitle(itemValue)}
          style={styles.picker}
          dropdownIconColor={"#ffbade"}
        >
          {serverData?.captions?.map((caption, capIndex) => (
            <Picker.Item
              style={styles.pickerItem}
              label={caption.label}
              value={caption.file}
              key={capIndex}
            />
          ))}
        </Picker>
        <TouchableOpacity
          style={styles.wideBtn}
          onPress={() => Linking.openURL(selectedSubtitle)}
          disabled={!selectedSubtitle}
        >
          <Text style={styles.wideBtnText}>Download</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.wideBtn}
          onPress={() => {
            if (selectedVideoSource) {
              openVideoInVLC(selectedVideoSource);
            } else {
              ToastAndroid.show("No video source available", ToastAndroid.LONG);
            }
          }}
          disabled={!selectedSubtitle}
        >
          <Text style={styles.wideBtnText}>Open in VLC</Text>
        </TouchableOpacity>

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
                  player.pause();
                  ToastAndroid.show("Fetching video. Please wait...", ToastAndroid.SHORT);
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
                player.pause();
                ToastAndroid.show("Fetching video. Please wait...", ToastAndroid.SHORT);
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
  videoControlBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    height: 40,
    marginBottom: 10,
    gap: 15,
  },
  picker: {
    width: "100%",
    backgroundColor: "#383653",
    color: "#ffbade",
    marginBottom: 10,
    borderRadius: 5,
  },
  pickerItem: {
    fontFamily: "monospace",
  },
  wideBtn: {
    backgroundColor: "#ffbade",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  wideBtnText: {
    color: "#201f31",
    fontFamily: "monospace",
    fontSize: 14,
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
