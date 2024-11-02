![](https://i.imgur.com/wIANk1D.png)

# Anifuri

Anifuri is a open-source free anime streaming application designed to provide you with an intuitive and engaging way to discover, watch, and enjoy your favorite anime. With a wide range of features, Anifuri allows users to explore trending titles, keep track of episodes, and easily search for anime by title or keywords. Whether you're looking for the latest episodes or want to revisit classic favorites, Anifuri offers a seamless streaming experience tailored to your needs.

><p style="text-align: center;">DISCLAIMER:<br>Anifuri does not host or store any anime content. All data fetched and displayed within the app is sourced from external platforms. We provide a service that allows users to stream anime, but we do not keep any of the streams or content on our end. Please ensure you are in compliance with local laws regarding streaming content.</p>

> Download from [here](https://github.com/pratham-jaiswal/anifuri/releases/latest).

## App Features

- **Search Anime**: Search for your favorite anime using the search bar.
- **Explore Anime**
    - **Spotlight Anime**: Highlighted anime recommendations based on trends.
    - **Continue Watching**: Easily access anime you have started but not finished.
    - **Trending Anime**: Explore the currently trending anime.
    - **Latest Episodes**: Stay updated with the latest episodes of your favorite series.
    - **Top Airing Anime**: Discover top anime that are currently being released.
    - **Most Popular Anime**: Find the most popular anime.
    - **Most Favorite Anime**: Discover anime that are highly rated and loved by the community.
    - **Latest Completed Anime**: Find anime that have recently finished airing.
- **Anime Details**: Display detailed information about a specific anime.
- **Episodes List**: View a list of episodes with the ability to mark episodes as watched.
- **Download Subtitles**: Download subtitles for episodes.
- **Server Selection**: Choose different servers for episodes to stream them.
- **Mark as Watched**: Mark any *finished airing* anime as watched. 
- **Watched Anime**: View a list of your watched anime.
- **Clear History**: Clear the watched and currently watching anime data.
- **Stream on VLC**: Stream episodes on VLC.

## Server Features

- **Explore**: Retrieve a curated list of anime from the home page, excluding specific categories for a cleaner view.
- **Search**: Search feature to find anime by title or keywords.
- **Anime Info**: Get comprehensive details about a specific anime, including seasons and other related data.
- **Basic Anime Info**: Access essential information about an anime, stripped of unnecessary details, allowing for quick reference.
- **Episode List**: Fetch a list of episodes for a given anime, with caching to minimize repeated data retrieval and to optimize loading times.
- **Episode Servers**: Retrieve server names for streaming episodes.
- **Server Video Sources**: Get sources for streaming episodes from a specific server, including additional metadata like subtitles.
- **Caching**: Utilize Redis for caching responses to minimize database hits and improve application speed, with varying expiration times based on data type.

## Demo

![](https://i.imgur.com/nqQHQQkl.jpg)
![](https://i.imgur.com/Zz2DFx8l.jpg)
![](https://i.imgur.com/Mhvjh6hl.jpg)
![](https://i.imgur.com/BBvZOHZl.jpg)
![](https://i.imgur.com/cg8rWDql.jpg)
![](https://i.imgur.com/n0xlPVtl.jpg)

## Built With

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Express](https://expressjs.com/)
- [Node.js](https://nodejs.org/)
- [Redis](https://redis.io/)
- [Axios](https://axios-http.com/)
- [Async Storage](https://react-native-async-storage.github.io/async-storage/)
- [TypeScript](https://www.typescriptlang.org/)
- [FlashList](https://github.com/shopify/flash-list)
- [AniWatch](https://github.com/ghoshRitesh12/aniwatch)

## Contributing

Please read [CONTRIBUTING.md](https://github.com/pratham-jaiswal/anifuri/blob/main/CONTRIBUTING.md) for the process of submitting pull requests to us.