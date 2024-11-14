import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Alert,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import axios from "axios";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

interface MoreInfo {
  status: string;
  studios: string;
  malscore: string;
  japanese: string;
  synonyms: string;
  genres: string[];
}

interface Episode {
  episodeId: string;
  number: string;
  title: string;
  isFiller: boolean;
}

interface Anime {
  info: AnimeInfo;
  moreInfo: MoreInfo;
}

interface AnimeResponse {
  anime: Anime;
  seasons: Season[];
}

interface Season {
  id: string;
  name: string;
  title: string;
  poster: string;
  isCurrent: boolean;
}

interface ServerData {
  sources: Array<{ url: string; type: string }> | null;
  sub: string[];
  dub: string[];
  captions: Array<{ file: string; label: string; kind: string }>;
}

export default function AnimeDetails() {
  const { anime_id } = useLocalSearchParams<{ anime_id: string }>();
  const [loading, setLoading] = useState(true);
  const [animeInfo, setAnimeInfo] = useState<AnimeResponse | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState("");
  const [isWatched, setIsWatched] = useState(false);
  const [lastWatchedEpisode, setLastWatchedEpisode] = useState<string | null>(
    null
  );
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [loadingSources, setLoadingSources] = useState(false);

  const toggleWatched = () => {
    const newStatus = isWatched ? null : "watched";
    setIsWatched(!isWatched);
    if (newStatus === "watched") {
      AsyncStorage.setItem(`anime:${anime_id}`, newStatus)
        .then(() => {})
        .catch((err) => console.error(err));
    } else {
      AsyncStorage.removeItem(`anime:${anime_id}`)
        .then(() => {})
        .catch((err) => console.error(err));
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      AsyncStorage.getItem(`anime:${anime_id}`)
        .then((status) => {
          setIsWatched(status === "watched");
          setLastWatchedEpisode(status === "watched" ? null : status);

          axios
            .get(
              `${process.env.EXPO_PUBLIC_BASE_URL}/anime-info?animeId=${anime_id}`
            )
            .then((res) => {
              const data: AnimeResponse = res.data;
              setAnimeInfo(data);
            })
            .catch((err) => console.error(err))
            .finally(() => {
              axios
                .get(
                  `${process.env.EXPO_PUBLIC_BASE_URL}/episodes-list?animeId=${anime_id}`
                )
                .then((res) => {
                  const data = res.data;
                  setEpisodes(data.episodes);
                })
                .catch((err) => console.error(err))
                .finally(() => {
                  setLoadingSources(false);
                  setLoading(false);
                });
            });
        })
        .catch((err) => console.error(err));
    }, [anime_id])
  );

  useEffect(() => {
    if (selectedEpisode) {
      fetchServers(selectedEpisode.episodeId);
    }
  }, [selectedEpisode]);

  if (loading) {
    return (
      <View style={styles.loadingIndicator}>
        <ActivityIndicator size="large" color="#ffbade" />
      </View>
    );
  }

  if (!animeInfo) {
    return (
      <View style={styles.container}>
        <Text>Anime not found.</Text>
      </View>
    );
  }

  const { anime, seasons } = animeInfo;
  const { info, moreInfo } = anime;

  const truncatedDescription =
    info.description.length > 100
      ? info.description.slice(0, 100) + "..."
      : info.description;

  const fetchServers = async (episodeId: string) => {
    setServerModalVisible(true);
    axios
      .get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/episode-servers?animeId=${anime_id}&episodeId=${episodeId}`
      )
      .then((res) => {
        fetchSourcesFromServer(res.data.sub[0], "sub")
          .then((data) => {
            res.data.sources = data?.data.sources;
            res.data.captions = data?.data.captions;
            if (res.data.captions.length > 0) {
              const englishCaption = res.data.captions.find(
                (
                  caption: { label: string },
                  index: number,
                  arr: { label: string }[]
                ) =>
                  caption.label.toLowerCase() === "english" &&
                  index ===
                    arr.findIndex((c) => c.label.toLowerCase() === "english")
              );
              setSelectedSubtitle(
                englishCaption ? englishCaption.file : res.data.captions[0].file
              );
            } else {
              setSelectedSubtitle("");
            }
            setServerData(res.data);
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => {
        console.error(err);
        setServerData(null);
        setServerModalVisible(false);
      });
  };

  const fetchSourcesFromServer = async (serverName: string, type: string) => {
    setLoadingSources(true);

    return axios
      .get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/episode-sources-from-server?animeId=${anime_id}&episodeId=${selectedEpisode?.episodeId}&serverName=${serverName}&type=${type}`
      )
      .then((res) => {
        setLoadingSources(false);
        return res;
      })
      .catch((err) => {
        console.error(err);
        setLoadingSources(false);
        return null;
      });
  };

  const renderSeasonsScroll = (seasons: Season[]) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>Seasons</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContainer}
      >
        {seasons.map((season) => (
          <TouchableOpacity
            activeOpacity={0.3}
            key={season.id}
            style={styles.seasonCard}
            onPress={() => {
              if (!season.isCurrent) {
                router.push({
                  pathname: "/(screens)/[anime_id]",
                  params: { anime_id: season.id.toString() },
                });
              }
            }}
          >
            <View style={styles.seasonImageContainer}>
              <Image
                source={{ uri: season.poster }}
                style={styles.seasonImage}
              />
              {season.isCurrent && (
                <Text style={styles.currentLabel}>Current</Text>
              )}
            </View>
            <Text style={styles.seasonName}>{season.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const openVideoInVLC = async (url: string) => {
    const vlcUrl = `vlc://${url}`;

    const status = await AsyncStorage.getItem(`anime:${anime_id}`);
    if (status !== "watched") {
      const message = `Episode ${selectedEpisode?.number}`;
      AsyncStorage.setItem(`anime:${anime_id}`, message)
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
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  const renderServerData = () => {
    if (!serverData) return null;
    return (
      <View style={styles.serverContainer}>
        <Text style={styles.categoryTitle}>Servers</Text>
        <Text style={styles.serverSubHeading}>Select Subtitle</Text>
        <Picker
          selectedValue={selectedSubtitle}
          onValueChange={(itemValue) => setSelectedSubtitle(itemValue)}
          style={styles.picker}
          dropdownIconColor={"#ffbade"}
        >
          {serverData?.captions.map((caption, capIndex) => (
            <Picker.Item
              style={styles.pickerItem}
              label={caption.label}
              value={caption.file}
              key={capIndex}
            />
          ))}
        </Picker>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => Linking.openURL(selectedSubtitle)}
          disabled={!selectedSubtitle}
        >
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>

        <Text style={styles.serverSubHeading}>Sub Servers</Text>
        {serverData.sub.map((subServer, index) => (
          <View key={index} style={styles.serverRow}>
            <TouchableOpacity
              onPress={() => {
                if (
                  index === 0 &&
                  serverData.sources &&
                  serverData.sources.length > 0
                ) {
                  openVideoInVLC(serverData.sources[0].url);
                } else {
                  fetchSourcesFromServer(subServer, "sub")
                    .then((data) => {
                      const sources = data?.data.sources;

                      if (sources && sources.length > 0) {
                        openVideoInVLC(sources[0].url);
                      }
                    })
                    .catch((err) => console.error(err));
                }
              }}
              style={styles.serverButton}
            >
              <Text style={styles.serverName}>{subServer.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        ))}
        <Text style={styles.serverSubHeading}>Dub Servers</Text>
        {serverData.dub.map((dubServer, index) => (
          <View key={index} style={styles.serverRow}>
            <TouchableOpacity
              onPress={() => {
                fetchSourcesFromServer(dubServer, "dub")
                  .then((data) => {
                    const sources = data?.data.sources;

                    if (sources && sources.length > 0) {
                      openVideoInVLC(sources[0].url);
                    }
                  })
                  .catch((err) => console.error(err));
              }}
              style={styles.serverButton}
            >
              <Text style={styles.serverName}>{dubServer.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderEpisode = ({ item }: { item: Episode }) => (
    <TouchableOpacity
      style={styles.episodeItem}
      onPress={() => {
        setSelectedEpisode(item);
      }}
    >
      {item.isFiller && <Text style={styles.episodeFiller}>Filler</Text>}
      <Text style={styles.episodeTitle}>
        Ep.{item.number} - {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.posterContainer}>
        <Image source={{ uri: info.poster }} style={styles.poster} />
        <View style={styles.detailsContainer}>
          <Text style={styles.animeName}>{info.name}</Text>
          <Text style={styles.animeStudio}>Studio: {moreInfo.studios}</Text>
          <Text style={styles.animeStatus}>{moreInfo.status}</Text>
          <View style={styles.ratingsContainer}>
            <Text style={styles.animeRating}>{info.stats.rating}</Text>
            <Text style={styles.animeMALScore}>
              MAL:{" "}
              {isNaN(Number(moreInfo.malscore)) ? "N/A" : moreInfo.malscore}
            </Text>
            <Text style={styles.animeMALScore}>{info.stats.type}</Text>
          </View>
        </View>
      </View>

      {lastWatchedEpisode && !isWatched && (
        <View style={styles.lastWatchedContainer}>
          <Text style={styles.lastWatchedText}>
            Last Watched:{" "}
            <Text style={styles.lastWatchedEpisode}>{lastWatchedEpisode}</Text>
          </Text>
        </View>
      )}

      {moreInfo.status === "Finished Airing" && (
        <View style={styles.markAsWatchedContainer}>
          <TouchableOpacity
            style={styles.markAsWatchedButton}
            onPress={toggleWatched}
          >
            <Text style={styles.markAsWatchedText}>
              {isWatched ? "Unmark as Watched" : "Mark as Watched"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "details" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("details")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "details" ? "#201f31" : "#ffbade",
              },
            ]}
          >
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "episodes" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("episodes")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "episodes" ? "#201f31" : "#ffbade",
              },
            ]}
          >
            Episodes
          </Text>
        </TouchableOpacity>
      </View>
      {activeTab === "details" && (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.moreDetailsContainer}>
            {moreInfo.genres && (
              <Text style={styles.moreDetails}>
                Genre:{" "}
                <Text style={styles.moreDetails}>
                  {moreInfo.genres.join(", ")}
                </Text>
              </Text>
            )}
            {moreInfo.japanese && (
              <Text style={styles.moreDetails}>
                Japanese: {moreInfo.japanese}
              </Text>
            )}
            {moreInfo.synonyms && (
              <Text style={styles.moreDetails}>
                Synonyms: {moreInfo.synonyms}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.descriptionContainer}
            onPress={() => setDescriptionVisible(true)}
          >
            <Text style={styles.animeDescription}>
              About: {truncatedDescription}{" "}
              <Ionicons name="open-outline" size={16} color="#ffbade" />
            </Text>
          </TouchableOpacity>

          <Modal
            visible={descriptionVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setDescriptionVisible(false)}
                >
                  <FontAwesome name="close" size={18} color="#ffbade" />
                </TouchableOpacity>
                <ScrollView>
                  <Text style={styles.fullDescription}>{info.description}</Text>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {seasons.length > 0 && renderSeasonsScroll(seasons)}
        </ScrollView>
      )}

      {activeTab === "episodes" && episodes.length > 0 && (
        <View style={styles.episodesContainer}>
          <FlashList
            data={episodes}
            renderItem={renderEpisode}
            estimatedItemSize={200}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyExtractor={(item: Episode) => item.number}
          />
        </View>
      )}

      <Modal
        visible={serverModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          {serverData ? (
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setServerModalVisible(false);
                  setServerData(null);
                }}
              >
                <FontAwesome name="close" size={18} color="#ffbade" />
              </TouchableOpacity>
              {renderServerData()}
            </View>
          ) : (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="large" color="#ffbade" />
            </View>
          )}
        </View>
        {serverData && loadingSources && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffbade" />
          </View>
        )}
      </Modal>

      {loading && <ActivityIndicator size="large" color="#ffbade" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#201f31",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  posterContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 10,
    marginRight: 20,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  animeName: {
    fontSize: 18,
    color: "#ffbade",
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "monospace",
  },
  animeStudio: {
    fontSize: 14,
    color: "#ffbade",
    marginBottom: 5,
    fontFamily: "monospace",
  },
  animeStatus: {
    fontSize: 12,
    color: "#ffbade",
    marginBottom: 5,
    fontStyle: "italic",
    fontFamily: "monospace",
  },
  ratingsContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 10,
    alignItems: "center",
    fontFamily: "monospace",
  },
  animeRating: {
    fontSize: 12,
    backgroundColor: "#ffbade",
    paddingVertical: 5,
    paddingHorizontal: 7,
    color: "#201f31",
    fontFamily: "monospace",
  },
  animeMALScore: {
    fontSize: 12,
    color: "#ffbade",
    fontFamily: "monospace",
  },
  descriptionContainer: {
    width: "100%",
    padding: 0,
    marginTop: 10,
  },
  animeDescription: {
    fontSize: 14,
    color: "#ffbade",
    lineHeight: 20,
    fontFamily: "monospace",
  },
  scrollContainer: {
    width: "100%",
    flex: 1,
    paddingTop: 10,
  },
  scrollContentContainer: {
    flexGrow: 1,
    alignSelf: "center",
    width: "100%",
    gap: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    backgroundColor: "#ffbade",
    color: "#201f31",
    padding: 5,
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    fontFamily: "monospace",
  },
  episodesContainer: {
    height: "100%",
    flex: 1,
    marginTop: 10,
  },
  episodeItem: {
    width: "100%",
    height: 70,
    flexDirection: "row",
    alignItems: "center",
  },
  episodeFiller: {
    backgroundColor: "#ffbade",
    color: "#201f31",
    padding: 2,
    borderRadius: 3,
    marginRight: 5,
    fontFamily: "monospace",
  },
  episodeTitle: {
    fontSize: 14,
    color: "#ffbade",
    fontFamily: "monospace",
  },
  separator: {
    height: 1,
    backgroundColor: "#ffbade",
    opacity: 0.3,
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "80%",
    backgroundColor: "#201f31",
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  fullDescription: {
    fontSize: 16,
    color: "#ffbade",
    lineHeight: 24,
    fontFamily: "monospace",
  },
  moreDetailsContainer: {
    gap: 5,
  },
  moreDetails: {
    color: "#ffbade",
    fontSize: 14,
    fontFamily: "monospace",
  },
  seasonCard: {
    width: 140,
    alignItems: "center",
    marginRight: 15,
  },
  seasonImageContainer: {
    position: "relative",
    alignItems: "center",
  },
  currentLabel: {
    position: "absolute",
    top: 10,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: "#ffbade",
    color: "#201f31",
    paddingHorizontal: 5,
    borderRadius: 5,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  seasonImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
  },
  seasonName: {
    color: "#ffbade",
    textAlign: "center",
    marginTop: 5,
    fontSize: 14,
    flexWrap: "wrap",
    width: "100%",
    fontFamily: "monospace",
  },
  horizontalScrollContainer: {
    paddingHorizontal: 10,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomColor: "#ffbade",
    borderBottomWidth: 1,
    width: "100%",
  },
  tabButton: {
    color: "#ffbade",
    fontSize: 16,
    width: "50%",
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: "#ffbade",
  },
  tabText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "monospace",
  },
  serverContainer: {
    marginTop: 20,
  },
  serverSubHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
    color: "#ffbade",
    fontFamily: "monospace",
  },
  serverRow: {
    marginBottom: 10,
  },
  serverName: {
    color: "#201f31",
    fontSize: 14,
    fontFamily: "monospace",
  },
  serverButton: {
    marginTop: 5,
    padding: 10,
    backgroundColor: "#ffbade",
    borderRadius: 5,
    alignItems: "center",
    fontFamily: "monospace",
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
  downloadButton: {
    backgroundColor: "#ffbade",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  downloadButtonText: {
    color: "#201f31",
    fontFamily: "monospace",
    fontSize: 14,
  },
  markAsWatchedContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  markAsWatchedButton: {
    padding: 10,
    backgroundColor: "#ffbade",
    borderRadius: 5,
    alignItems: "center",
  },
  markAsWatchedText: {
    color: "#201f31",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  lastWatchedContainer: {
    alignItems: "flex-start",
    marginBottom: 10,
  },
  lastWatchedText: {
    fontFamily: "monospace",
    fontStyle: "italic",
    color: "#ffbade",
    marginBottom: 10,
  },
  lastWatchedEpisode: {
    fontWeight: "bold",
  },
});
