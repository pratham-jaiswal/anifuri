import { HiAnime } from "aniwatch";
import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const hianime = new HiAnime.Scraper();

app.get("/explore", (req, res) => {
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

      res.send(formattedData);
    })
    .catch((err) => console.error(err));
});

app.get("/search", (req, res) => {
  const query = req.query.query;
  hianime
    .search(query)
    .then((data) => {
      res.send(data.animes);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/anime-info", (req, res) => {
  const animeId = req.query.animeId;
  hianime
    .getInfo(animeId)
    .then((data) => {
      delete data.anime.info.anilistId;
      delete data.anime.info.malId;
      res.send({ anime: data.anime, seasons: data.seasons });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/episodes-list", (req, res) => {
  const animeId = req.query.animeId;
  hianime
    .getEpisodes(animeId)
    .then((data) => {
      data.episodes = data.episodes.map((episode) => {
        const epValue = episode.episodeId.split("=")[1];
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
  const episodeId = req.query.episodeId;

  try {
    const serverData = await hianime.getEpisodeServers(
      `${animeId}?ep=${episodeId}`
    );

    const response = {
      sub: [],
      dub: [],
    };

    const subServers = serverData.sub || [];
    const subCaptions = {};

    for (const server of subServers) {
      try {
        const sourcesData = await hianime.getEpisodeSources(
          `${animeId}?ep=${episodeId}`,
          server.serverName,
          "sub"
        );

        const captionsTracks = sourcesData.tracks.filter(
          (track) => track.kind === "captions"
        );

        subCaptions[server.serverName] = captionsTracks;

        response.sub.push({
          serverName: server.serverName,
          sources: sourcesData.sources,
          captions: captionsTracks,
          intro: sourcesData.intro,
          outro: sourcesData.outro,
        });
      } catch (error) {
        console.error(`Error fetching sources for sub server ${server.serverName}:`, error.message);
      }
    }

    const dubServers = serverData.dub || [];
    for (const server of dubServers) {
      try {
        const sourcesData = await hianime.getEpisodeSources(
          `${animeId}?ep=${episodeId}`,
          server.serverName,
          "dub"
        );

        const captionsTracks = sourcesData.tracks.filter(
          (track) => track.kind === "captions"
        );

        if (captionsTracks.length === 0 && subCaptions[server.serverName]) {
          captionsTracks.push(...subCaptions[server.serverName]);
        }

        response.dub.push({
          serverName: server.serverName,
          sources: sourcesData.sources,
          captions: captionsTracks,
          intro: sourcesData.intro,
          outro: sourcesData.outro,
        });
      } catch (error) {
        console.error(`Error fetching sources for dub server ${server.serverName}:`, error.message);
      }
    }

    res.send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching episode details");
  }
});

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
