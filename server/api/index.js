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

app.get("/basic-info", async (req, res) => {
  const animeId = req.query.animeId;
  const cacheKey = `basic-info:${animeId}`;

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.send(JSON.parse(cachedData));
  }

  hianime
    .getInfo(animeId)
    .then((data) => {
      delete data.seasons;
      delete data.anime.moreInfo;
      delete data.anime.info.description;
      delete data.anime.info.stats;
      delete data.anime.info.promotionalVideos;
      delete data.anime.info.charactersVoiceActors;
      delete data.anime.info.anilistId;
      delete data.anime.info.malId;


      const response = data.anime.info;
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

app.get("/episode-servers", async (req, res) => {
  const animeId = req.query.animeId;
  const givenEpisodeId = req.query.episodeId;
  const episodeId =
    (givenEpisodeId.match(/ep=(\d+)/) || [])[1] ||
    givenEpisodeId.replace(/\D/g, "");

  const cacheKey = `episode-servers:${animeId}:${episodeId}`;
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.send(JSON.parse(cachedData));
  }

  let serverNames = [];
  hianime
    .getEpisodeServers(`${animeId}?ep=${episodeId}`)
    .then((serverData) => {
      serverNames = {
        sub: (serverData.sub || [])
          .filter(
            (server) =>
              server.serverName !== "streamtape" &&
              server.serverName !== "streamsb"
          )
          .map((server) => server.serverName),
        dub: (serverData.dub || [])
          .filter(
            (server) =>
              server.serverName !== "streamtape" &&
              server.serverName !== "streamsb"
          )
          .map((server) => server.serverName),
      };

      redisClient.setEx(
        cacheKey,
        60 * 60 * 24 * 30,
        JSON.stringify(serverNames)
      );

      res.send(serverNames);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/episode-sources-from-server", async (req, res) => {
  const animeId = req.query.animeId;
  const givenEpisodeId = req.query.episodeId;
  const episodeId =
    (givenEpisodeId.match(/ep=(\d+)/) || [])[1] ||
    givenEpisodeId.replace(/\D/g, "");

  const serverName = req.query.serverName;
  const type = req.query.type;

  if (serverName === "streamsb" || serverName === "streamtape") {
    return;
  }

  hianime
    .getEpisodeSources(`${animeId}?ep=${episodeId}`, serverName, type)
    .then((sourcesData) => {
      res.send({
        serverName: serverName,
        sources: sourcesData.sources,
        captions: sourcesData.tracks.filter(
          (track) => track.kind === "captions"
        ),
        intro: sourcesData.intro,
        outro: sourcesData.outro,
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

// app.get("/clear-cache", async (req, res) => {
//   try {
//     await redisClient.flushAll();
//     res.status(200).send("Cache cleared successfully");
//   } catch (error) {
//     console.error("Error clearing cache:", error);
//     res.status(500).send("Error clearing cache");
//   }
// });

// app.get("/by-genres", (req, res) => {
//   const genre = req.query.genre;
//   hianime
//     .getGenreAnime(genre)
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// });

app.get("/", (req, res) => {
  res.send("Working");
});

app.listen(3000, () => {
  console.log("Server started");
});
