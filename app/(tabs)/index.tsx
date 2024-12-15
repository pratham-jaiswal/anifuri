import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import PagerView from "react-native-pager-view";
import { router, useFocusEffect } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";

export interface Anime {
  id: string;
  name: string;
  poster: string;
}

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hitSearchTerm, setHitSearchTerm] = useState("");
  const [spotlightAnimes, setSpotlightAnimes] = useState<Anime[]>([]);
  const [trendingAnimes, setTrendingAnimes] = useState<Anime[]>([]);
  const [latestEpisodeAnimes, setLatestEpisodeAnimes] = useState<Anime[]>([]);
  const [topAiringAnimes, setTopAiringAnimes] = useState<Anime[]>([]);
  const [mostPopularAnimes, setMostPopularAnimes] = useState<Anime[]>([]);
  const [mostFavoriteAnimes, setMostFavoriteAnimes] = useState<Anime[]>([]);
  const [latestCompletedAnimes, setLatestCompletedAnimes] = useState<Anime[]>(
    []
  );
  const [continueWatchingAnimes, setContinueWatchingAnimes] = useState<Anime[]>(
    []
  );
  // const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      axios
        .get(`${process.env.EXPO_PUBLIC_BASE_URL}/explore`)
        .then((res) => {
          const data = res.data;
          setSpotlightAnimes(data.spotlightAnimes);
          setTrendingAnimes(data.trendingAnimes);
          setLatestEpisodeAnimes(data.latestEpisodeAnimes);
          setTopAiringAnimes(data.topAiringAnimes);
          setMostPopularAnimes(data.mostPopularAnimes);
          setMostFavoriteAnimes(data.mostFavoriteAnimes);
          setLatestCompletedAnimes(data.latestCompletedAnimes);

          AsyncStorage.getAllKeys()
            .then((keys) => {
              const continueWatchingPromises = keys.map((key) => {
                return AsyncStorage.getItem(key).then((value) => {
                  if (value && value.startsWith("Episode ")) {
                    const animeId = key.split(":")[1];
                    return fetchAnimeDetails(animeId).then((anime) => ({
                      ...anime,
                    }));
                  }
                  return null;
                });
              });

              return Promise.all(continueWatchingPromises).then((results) => {
                const filteredResults = results.filter((item) => item !== null);
                setContinueWatchingAnimes(filteredResults);
              });
            })
            .catch((error) => {
              console.error("Failed to load continue watching animes:", error);
            });
        })
        .catch((err) => console.error(err))
        .finally(() => {
          setLoading(false);
        });
      return () => {
        setSearchTerm("");
        setHitSearchTerm("");
        setSearchResults([]);
      };
    }, [])
  );

  const fetchAnimeDetails = (animeId: string) => {
    return axios
      .get(`${process.env.EXPO_PUBLIC_BASE_URL}/basic-info?animeId=${animeId}`)
      .then((res) => res.data)
      .catch((error) => {
        console.error(`Failed to fetch details for anime ${animeId}`, error);
        return null;
      });
  };

  const handleAnimeClick = (id: string) => {
    router.push({
      pathname: "/(screens)/[anime_id]",
      params: { anime_id: id },
    });
  };

  const searchAnimes = () => {
    if (searchTerm.trim() === "") {
      setHitSearchTerm("");
      if (searchResults.length > 0) setSearchResults([]);
      return;
    }
    setHitSearchTerm(searchTerm);
    setSearchLoading(true);
    axios
      .get(`${process.env.EXPO_PUBLIC_BASE_URL}/search?query=${searchTerm}`)
      .then((res) => {
        setSearchResults(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setSearchLoading(false);
      });
  };

  const renderAnimeScroll = (title: string, animeList: Anime[]) => (
    <View>
      {title != "Spotlight Anime" && (
        <Text style={styles.categoryTitle}>{title}</Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContainer}
      >
        {renderAnimeCards(title, animeList)}
      </ScrollView>
    </View>
  );

  const renderAnimeCards = (title: string, animeList: Anime[]) => {
    return animeList.map((anime, index) => (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => handleAnimeClick(anime.id)}
        key={title + anime.id}
        style={[
          styles.animeCard,
          index === 0 && title !== "Spotlight Anime" && styles.firstCard,
          index === animeList.length - 1 &&
            title !== "Spotlight Anime" &&
            styles.lastCard,
          title === "Spotlight Anime"
            ? styles.spotlightAnimeCard
            : styles.regularAnimeCard,
        ]}
      >
        <Image
          source={{ uri: anime.poster }}
          style={
            title === "Spotlight Anime"
              ? styles.spotlightImage
              : styles.regularImage
          }
        />
        {title === "Spotlight Anime" ? (
          <LinearGradient
            colors={["transparent", "#201f31"]}
            style={styles.gradient}
          >
            <Text style={styles.spotlightAnimeName}>{anime.name}</Text>
          </LinearGradient>
        ) : (
          <Text style={styles.animeName}>{anime.name}</Text>
        )}
      </TouchableOpacity>
    ));
  };

  const renderAnimeGrid = (title: string, animeList: Anime[]) => {
    return (
      <View style={styles.gridContainer}>
        <FlatList
          data={animeList}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => handleAnimeClick(item.id)}
              style={styles.regularAnimeCard}
            >
              <Image
                source={{ uri: item.poster }}
                style={styles.regularImage}
              />
              <Text style={styles.animeName}>{item.name}</Text>
              {index >=
                animeList.length - (animeList.length % 2 === 0 ? 2 : 1) && (
                <View
                  style={{
                    height: 100,
                  }}
                />
              )}
            </TouchableOpacity>
          )}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContentContainer}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchArea}>
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
            if (text.trim() === "") {
              setHitSearchTerm("");
              setSearchResults([]);
            }
          }}
          onSubmitEditing={searchAnimes}
          placeholder="Search..."
          placeholderTextColor={"#ffbade4d"}
        />
        <TouchableOpacity
          onPress={searchAnimes}
          style={styles.searchIcon}
          activeOpacity={0.3}
        >
          <FontAwesome name="search" size={20} color="#ffbade" />
        </TouchableOpacity>
      </View>
      {loading || searchLoading ? (
        <ActivityIndicator
          size="large"
          color="#ffbade"
          style={styles.loadingIndicator}
        />
      ) : hitSearchTerm ? (
        searchResults.length > 0 ? (
          renderAnimeGrid(
            "Search Results for '" + searchTerm + "'",
            searchResults
          )
        ) : (
          <View style={styles.notFoundContainer}>
            <Text
              style={{
                color: "#ffbade",
                textAlign: "center",
                marginTop: 20,
                fontFamily: "monospace",
              }}
            >
              No results found for "{hitSearchTerm}"
            </Text>
          </View>
        )
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <PagerView style={styles.pagerContainer} initialPage={0}>
            {renderAnimeCards("Spotlight Anime", spotlightAnimes)}
          </PagerView>

          {continueWatchingAnimes.length > 0 &&
            renderAnimeScroll("Continue Watching", continueWatchingAnimes)}
          {trendingAnimes.length > 0 &&
            renderAnimeScroll("Trending Anime", trendingAnimes)}
          {latestEpisodeAnimes.length > 0 &&
            renderAnimeScroll("Latest Episodes", latestEpisodeAnimes)}
          {topAiringAnimes.length > 0 &&
            renderAnimeScroll("Top Airing Anime", topAiringAnimes)}
          {mostPopularAnimes.length > 0 &&
            renderAnimeScroll("Most Popular Anime", mostPopularAnimes)}
          {mostFavoriteAnimes.length > 0 &&
            renderAnimeScroll("Most Favorite Anime", mostFavoriteAnimes)}
          {latestCompletedAnimes.length > 0 &&
            renderAnimeScroll("Latest Completed Anime", latestCompletedAnimes)}
          <View
            style={{
              height: 100,
            }}
          />
        </ScrollView>
      )}
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    paddingTop: 5,
    height: "100%",
    flex: 1,
  },
  searchArea: {
    alignSelf: "center",
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  searchInput: {
    width: "85%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ffbade",
    fontSize: 16,
    color: "#ffbade",
    fontFamily: "monospace",
  },
  searchIcon: {
    width: "10%",
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gridContainer: {
    flex: 1,
    marginTop: 10,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gridContentContainer: {
    paddingHorizontal: 15,
    flexGrow: 1,
  },
  scrollContainer: {
    width: "100%",
    marginTop: 10,
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    alignSelf: "center",
    width: "100%",
    gap: 20,
  },
  pagerContainer: {
    width: Dimensions.get("window").width,
    aspectRatio: 1.8,
  },
  firstCard: {
    marginLeft: 15,
  },
  lastCard: {
    marginRight: 15,
  },
  categoryTitle: {
    fontSize: 18,
    color: "#ffbade",
    marginLeft: 15,
    marginBottom: 15,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  horizontalScrollContainer: {
    gap: 20,
  },
  animeCard: {
    alignItems: "center",
  },
  spotlightAnimeCard: {
    width: Dimensions.get("window").width,
  },
  regularAnimeCard: {
    width: 140,
  },
  spotlightImage: {
    width: "100%",
    aspectRatio: 2,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  spotlightAnimeName: {
    position: "absolute",
    bottom: -10,
    alignSelf: "center",
    color: "#ffbade",
    textAlign: "center",
    fontSize: 14,
    flexWrap: "wrap",
    width: "80%",
    fontFamily: "monospace",
  },
  regularImage: {
    width: 130,
    aspectRatio: 0.7,
    borderRadius: 10,
  },
  animeName: {
    color: "#ffbade",
    textAlign: "center",
    marginTop: 5,
    fontSize: 14,
    flexWrap: "wrap",
    width: "100%",
    fontFamily: "monospace",
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
});
