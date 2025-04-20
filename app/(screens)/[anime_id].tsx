import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
  Modal,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import axios from "axios";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
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
        .then(() => {
          ToastAndroid.show("Marked as watched", ToastAndroid.LONG);
        })
        .catch((err) => {
          ToastAndroid.show("Something went wrong", ToastAndroid.LONG);
          console.error(err);
        });
    } else {
      AsyncStorage.removeItem(`anime:${anime_id}`)
        .then(() => {
          ToastAndroid.show("Removed from watched", ToastAndroid.LONG);
        })
        .catch((err) => {
          ToastAndroid.show("Something went wrong", ToastAndroid.LONG);
          console.error(err);
        });
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
    axios
      .get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/episode-servers?animeId=${anime_id}&episodeId=${episodeId}`
      )
      .then((res) => {
        setLoadingSources(true);
        fetchSourcesFromServer(res.data.sub[0], "sub")
          .then((data) => {
            res.data.sources = data?.data.sources;
            res.data.captions = data?.data.captions;

            setServerData(res.data);
            router.push({
              pathname: "/videoPlayer",
              params: {
                serverData: JSON.stringify(res.data),
                selectedEpisode: JSON.stringify(selectedEpisode),
                animeInfo: JSON.stringify(info),
              },
            });
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => {
        console.error(err);
        setServerData(null);
      });
  };

  const fetchSourcesFromServer = async (serverName: string, type: string) => {
    return axios
      .get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/episode-sources-from-server?animeId=${anime_id}&episodeId=${selectedEpisode?.episodeId}&serverName=${serverName}&type=${type}`
      )
      .then((res) => {
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
            <Ionicons
              name={isWatched ? "checkmark-circle" : "checkmark-circle-outline"}
              size={24}
              color={isWatched ? "#90ee90" : "#ffbade"}
            />
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
      {(loading || loadingSources) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffbade" />
        </View>
      )}
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
  markAsWatchedContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  markAsWatchedButton: {
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
    backgroundColor: "#201f31",
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
