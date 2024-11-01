import { HiAnime } from "aniwatch";
import express from "express";
import cors from "cors";
import compression from "compression";
import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(compression());

const redisClient = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_URL,
    port: process.env.REDIS_PORT,
  },
});

redisClient.connect().catch(console.error);

const hianime = new HiAnime.Scraper();

app.get("/explore", async (req, res) => {
  const cacheKey = "explore";
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.send(JSON.parse(cachedData));
  }

  hianime
    .getHomePage()
    .then((data) => {
      delete data.topUpcomingAnimes;
      delete data.top10Animes;
      delete data.genres;

      const formattedData = {};
      const seenIds = new Set();

      for (const key in data) {
        if (Array.isArray(data[key])) {
          formattedData[key] = data[key].reduce((acc, anime) => {
            if (!seenIds.has(key + anime.id)) {
              seenIds.add(key + anime.id);
              acc.push({
                id: anime.id,
                name: anime.name,
                poster: anime.poster,
              });
            }
            return acc;
          }, []);
        }
      }

      redisClient.setEx(cacheKey, 60 * 60 * 3, JSON.stringify(formattedData));
      res.send(formattedData);
    })
    .catch((err) => console.error(err));
});

app.get("/search", async (req, res) => {
  const query = req.query.query;
  const cacheKey = `search:${query}`;

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.send(JSON.parse(cachedData));
  }

  hianime
    .search(query)
    .then((data) => {
      redisClient.setEx(cacheKey, 60 * 60 * 12, JSON.stringify(data.animes));
      res.send(data.animes);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/anime-info", async (req, res) => {
  const animeId = req.query.animeId;
  const cacheKey = `anime-info:${animeId}`;

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.send(JSON.parse(cachedData));
  }

  hianime
    .getInfo(animeId)
    .then((data) => {
      delete data.anime.info.anilistId;
      delete data.anime.info.malId;

      const response = { anime: data.anime, seasons: data.seasons };
      redisClient.setEx(cacheKey, 60 * 60 * 24 * 3, JSON.stringify(response));

      res.send(response);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/episodes-list", async (req, res) => {
  const animeId = req.query.animeId;
  const cacheKey = `episodes-list:${animeId}`;

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.send(JSON.parse(cachedData));
  }

  hianime
    .getEpisodes(animeId)
    .then((data) => {
      data.episodes = data.episodes.map((episode) => {
        const epValue = episode.episodeId.split("=")[1];
        redisClient.setEx(cacheKey, 60 * 60 * 24 * 7, JSON.stringify(data));

        return { ...episode, episodeId: epValue };
      });

      res.send(data);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/episode-server-sources", async (req, res) => {
  const animeId = req.query.animeId;
  const givenEpisodeId = req.query.episodeId;
  const episodeId =
    (givenEpisodeId.match(/ep=(\d+)/) || [])[1] ||
    givenEpisodeId.replace(/\D/g, "");

  const cacheKey = `episode-server-sources:${animeId}:${episodeId}`;

  const cachedData = await redisClient.get(cacheKey);
  let serverNames = [];

  if (cachedData) {
    serverNames = JSON.parse(cachedData);
  } else {
    try {
      const serverData = await hianime.getEpisodeServers(
        `${animeId}?ep=${episodeId}`
      );
      serverNames = {
        sub: (serverData.sub || []).map((server) => server.serverName),
        dub: (serverData.dub || []).map((server) => server.serverName),
      };
      redisClient.setEx(
        cacheKey,
        60 * 60 * 24 * 30,
        JSON.stringify(serverNames)
      );
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error fetching episode server names");
    }
  }

  const response = { sub: [], dub: [] };
  const subCaptions = {};

  async function fetchServerSources(serverName, type, captionsCache) {
    if (serverName === "streamsb" || serverName === "streamtape") {
      return;
    }

    try {
      const sourcesData = await hianime.getEpisodeSources(
        `${animeId}?ep=${episodeId}`,
        serverName,
        type
      );

      const captionsTracks = sourcesData.tracks.filter(
        (track) => track.kind === "captions"
      );

      if (type === "sub") {
        captionsCache[serverName] = captionsTracks;
      } else if (
        type === "dub" &&
        captionsTracks.length === 0 &&
        captionsCache[serverName]
      ) {
        captionsTracks.push(...captionsCache[serverName]);
      }

      response[type].push({
        serverName: serverName,
        sources: sourcesData.sources,
        captions: captionsTracks,
        intro: sourcesData.intro,
        outro: sourcesData.outro,
      });
    } catch (error) {
      console.error(
        `Error fetching sources for ${type} server ${serverName}:`,
        error.message
      );
    }
  }

  for (const serverName of serverNames.sub) {
    await fetchServerSources(serverName, "sub", subCaptions);
  }

  for (const serverName of serverNames.dub) {
    await fetchServerSources(serverName, "dub", subCaptions);
  }

  res.send(response);
});

// app.get('/clear-cache', async (req, res) => {
//   try {
//     await redisClient.flushAll();
//     res.status(200).send('Cache cleared successfully');
//   } catch (error) {
//     console.error('Error clearing cache:', error);
//     res.status(500).send('Error clearing cache');
//   }
// });

app.get("/by-genres", (req, res) => {
  const genre = req.query.genre;
  hianime
    .getGenreAnime(genre)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/", (req, res) => {
  res.send("Working");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
  console.log("http://localhost:3000");
});
