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
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useFocusEffect } from "expo-router";
import axios from "axios";

interface Anime {
  id: string;
  name: string;
  poster: string;
}

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [spotlightAnimes, setSpotlightAnimes] = useState<Anime[]>([]);
  const [trendingAnimes, setTrendingAnimes] = useState<Anime[]>([]);
  const [latestEpisodeAnimes, setLatestEpisodeAnimes] = useState<Anime[]>([]);
  const [topAiringAnimes, setTopAiringAnimes] = useState<Anime[]>([]);
  const [mostPopularAnimes, setMostPopularAnimes] = useState<Anime[]>([]);
  const [mostFavoriteAnimes, setMostFavoriteAnimes] = useState<Anime[]>([]);
  const [latestCompletedAnimes, setLatestCompletedAnimes] = useState<Anime[]>(
    []
  );
  const [genres, setGenres] = useState<string[]>([]);
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
        })
        .catch((err) => console.error(err))
        .finally(() => {
          setLoading(false);
        });
      return () => {
        setSearchTerm("");
        setSearchTerm("");
        setSearchResults([]);
      };
    }, [])
  );

  const handleAnimeClick = (id: string) => {
    router.push({
      pathname: "/(screens)/[anime_id]",
      params: { anime_id: id },
    });
  };

  const searchAnimes = () => {
    if (searchTerm.trim() === "") {
      if (searchResults.length > 0) setSearchResults([]);
      return;
    }
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
      <Text style={styles.categoryTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContainer}
      >
        {animeList.map((anime, index) => (
          <TouchableOpacity
            activeOpacity={0.3}
            onPress={() => handleAnimeClick(anime.id)}
            key={title + anime.id}
            style={[
              styles.animeCard,
              index === 0 && styles.firstCard,
              index === animeList.length - 1 && styles.lastCard,
              title === "Spotlight Anime"
                ? styles.spotlightAnimeCard
                : styles.regularAnimeCard,
            ]}
          >
            <Image
              source={{ uri: anime.poster }}
              style={[
                styles.animeImage,
                title === "Spotlight Anime"
                  ? styles.spotlightImage
                  : styles.regularImage,
              ]}
            />
            <Text style={styles.animeName}>{anime.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchArea}>
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
            if (text.trim() === "" && searchResults.length > 0)
              setSearchResults([]);
          }}
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
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {searchResults.length > 0 &&
            renderAnimeScroll(
              "Search Results for '" + searchTerm + "'",
              searchResults
            )}
          {spotlightAnimes.length > 0 &&
            renderAnimeScroll("Spotlight Anime", spotlightAnimes)}
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

const styles = StyleSheet.create({
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
  },
  searchIcon: {
    width: "10%",
    justifyContent: "center",
    alignItems: "center",
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
  },
  firstCard: {
    marginLeft: 15,
  },
  lastCard: {
    marginRight: 15,
  },
  categoryTitle: {
    fontSize: 20,
    color: "#ffbade",
    marginLeft: 10,
    marginBottom: 15,
    fontWeight: "bold",
  },
  horizontalScrollContainer: {
    gap: 20,
  },
  animeCard: {
    alignItems: "center",
  },
  spotlightAnimeCard: {
    width: Dimensions.get("window").width - 30,
  },
  regularAnimeCard: {
    width: 140,
  },
  animeImage: {
    borderRadius: 10,
  },
  spotlightImage: {
    width: "90%",
    aspectRatio: 2.5,
  },
  regularImage: {
    width: 130,
    aspectRatio: 0.7,
  },
  animeName: {
    color: "#ffbade",
    textAlign: "center",
    marginTop: 5,
    fontSize: 14,
    flexWrap: "wrap",
    width: "100%",
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  gridContainer: {
    flex: 1,
    height: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
