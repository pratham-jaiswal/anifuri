import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableHighlight,
  Alert,
  Linking
} from "react-native";
import React, { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Anime, styles } from "./index";
import Constants from "expo-constants";

const appVersion = Constants.expoConfig?.version;
const appName = Constants.expoConfig?.name;

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [watchedAnime, setWatchedAnime] = useState<Anime[]>([]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      AsyncStorage.getAllKeys()
        .then((keys) => {
          const continueWatchingPromises = keys.map((key) => {
            return AsyncStorage.getItem(key).then((value) => {
              if (value === "watched") {
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
            setWatchedAnime(filteredResults);
          });
        })
        .catch((error) => {
          console.error("Failed to load watched animes:", error);
        })
        .finally(() => {
          setLoading(false);
        });
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

  const clearCurrentWatching = () => {
    AsyncStorage.getAllKeys()
      .then((keys) => {
        const currentWatchingPromises = keys.map((key) =>
          AsyncStorage.getItem(key).then((value) => {
            return value && value.startsWith("Episode") ? key : null;
          })
        );

        return Promise.all(currentWatchingPromises).then((keysToRemove) => {
          const keysToRemoveFiltered = keysToRemove.filter((key) => key !== null);
          return AsyncStorage.multiRemove(keysToRemoveFiltered);
        });
      })
      .then(() => {
        Alert.alert("Success", "Cleared all current watching anime.");
      })
      .catch((error) => {
        console.error("Failed to clear current watching:", error);
      });
  };

  const clearWatched = () => {
    AsyncStorage.getAllKeys()
      .then((keys) => {
        const watchedPromises = keys.map((key) =>
          AsyncStorage.getItem(key).then((value) => {
            return value === "watched" ? key : null;
          })
        );

        return Promise.all(watchedPromises).then((keysToRemove) => {
          const keysToRemoveFiltered = keysToRemove.filter((key) => key !== null);
          return AsyncStorage.multiRemove(keysToRemoveFiltered);
        });
      })
      .then(() => {
        setWatchedAnime([]);
        Alert.alert("Success", "Cleared all watched anime.");
      })
      .catch((error) => {
        console.error("Failed to clear watched:", error);
      });
  };

  const confirmClearCurrentWatching = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to clear all current watching anime?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: clearCurrentWatching },
      ]
    );
  };

  const confirmClearWatched = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to clear all watched anime?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: clearWatched },
      ]
    );
  };

  const handleBMCSupportPress = () => {
    Linking.openURL('https://buymeacoffee.com/maxxdevs');
  };

  const handleUPISupportPress = () => {
    Linking.openURL('upi://pay?vpa=prathamj0502@okhdfcbank&tn=Support%20from%20Anifuri%20user');
  };

  const renderAnimeScroll = (title: string, animeList: Anime[]) => (
    <View style={styles2.scrollContainer}>
      <Text style={styles.categoryTitle}>{title}</Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#ffbade"
          style={styles.loadingIndicator}
        />
      ) : animeList.length > 0 ? (
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
                styles.regularAnimeCard,
              ]}
            >
              <Image
                source={{ uri: anime.poster }}
                style={[
                  styles.animeImage,
                  styles.regularImage,
                ]}
              />
              <Text style={styles.animeName}>{anime.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles2.noAnimeText}>No anime found</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderAnimeScroll("Watched Anime", watchedAnime)}
      <View style={styles2.clearBtnContainer}>
        <TouchableHighlight underlayColor="#e10" onPress={confirmClearCurrentWatching} style={styles2.clearButton}>
          <Text style={styles2.btnText}>Clear All Current Watching</Text>
        </TouchableHighlight>
        <TouchableHighlight underlayColor="#e10" onPress={confirmClearWatched} style={styles2.clearButton}>
          <Text style={styles2.btnText}>Clear All Watched</Text>
        </TouchableHighlight>
        <TouchableOpacity activeOpacity={0.7} onPress={handleBMCSupportPress} style={styles2.clearButton}>
          <Text style={styles2.btnText}>Buy Me A Coffee ☕</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={handleUPISupportPress} style={styles2.clearButton}>
          <Text style={styles2.btnText}>Support Me via UPI 💸</Text>
        </TouchableOpacity>
        <Text style={styles2.versionText}>{appName} v{appVersion}</Text>
      </View>
    </View>
  );
}

const styles2 = StyleSheet.create({
  scrollContainer: {
    marginTop: 20,
    borderBottomColor: "#ffbade",
  },
  noAnimeText: {
    marginLeft: 15,
    color: "#ffbade",
    fontFamily: "monospace",
    fontSize: 16,
  },
  clearBtnContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 20,
    marginHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
  },
  clearButton: {
    padding: 10,
    backgroundColor: "#ffbade",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  btnText: {
    color: "#201f31",
    fontFamily: "monospace",
    fontSize: 14,
  },
  versionText: {
    color: "#ffbade",
    fontFamily: "monospace",
    fontSize: 14,
    marginTop: 20,
    alignSelf: "center",
  },
});