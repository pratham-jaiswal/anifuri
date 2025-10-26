![](https://i.imgur.com/wIANk1D.png)

# Anifuri

Anifuri is a open-source free anime streaming application designed to provide you with an easy and simple way to discover, watch, and enjoy your favorite anime. With a wide range of features, Anifuri allows users to explore trending titles, keep track of episodes, and easily search for anime. Whether you're looking for the latest episodes or want to revisit classic favorites, Anifuri offers a seamless streaming experience tailored to your needs.

> <h2 align="center">DISCLAIMER</h2>
> <p align="center"><i>Anifuri does not host or store any anime content. All data fetched and displayed within the app is sourced from external platforms. We provide a service that allows users to stream anime, but we do not keep any of the streams or content on our end. Please ensure you are in compliance with local laws regarding streaming content.</i></p>

<!-- [![Sourceforge Download Anifuri](https://a.fsdn.com/con/app/sf-download-button)](https://sourceforge.net/projects/anifuri/files/latest/download) -->

<!-- [![Support on Patreon](https://img.shields.io/badge/Support_on-Patreon-FF424D?logo=patreon&style=for-the-badge)](https://patreon.com/MaxxDevs) -->

<!-- [Rate on SourceForge](https://sourceforge.net/projects/anifuri/reviews/) -->

## Project Discontinued - But You Can Still Run It Yourself

This project is no longer actively maintained.
However, you can still **set it up, host it, or build upon it** on your own using the steps below.

[Server Repository](https://github.com/pratham-jaiswal/anifuri-server)

Node v22.13.1
npm v10.9.2

### ⚙️ Setup Steps

1. **Fork or Clone the repo**

   * **If you plan to contribute or modify the project**, fork it to your own GitHub account by clicking on the fork button on top of the repo or clicking on this [link](https://github.com/pratham-jaiswal/anifuri/fork), then

    ```bash
    git clone https://github.com/<your-username>/anifuri.git
    cd anifuri
    ```

    * **If you just want to use or run the app**, clone it directly:

    ```bash
    git clone https://github.com/pratham-jaiswal/anifuri.git
    cd anifuri
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Create a `.env` file** in the project root with the following:

    ```env
    EXPO_PUBLIC_BASE_URL=http://localhost:3000
    ```

    > This should point to your **backend's base URL**.
    > If you're running the backend locally, keep it as above.
    > When deployed, replace it with your deployed backend URL (e.g., from Vercel, Heroku, etc.).

4. [Build](#-to-build-android) or [Run](#-to-run-locally)

### 📱 To Build (Android)

5. **Create an account** on [https://expo.dev](https://expo.dev)

6. **Install EAS CLI**

    ```bash
    npm install -g eas-cli
    ```

7. **Login to your Expo account**

    ```bash
    eas login
    ```

8. **Initialize EAS project**

    ```bash
    eas init
    ```

9. **Build the app to get its apk**

    ```bash
    eas build --profile preview --platform android
    ```

### 💻 To Run Locally

5. **Start in expo go sandbox**

    ```bash
    npm start
    ```

## Stats

![GitHub Downloads (specific asset, all releases)](https://img.shields.io/github/downloads/pratham-jaiswal/anifuri/anifuri.apk?style=flat&label=GitHub%20-%20Total%20Downloads&labelColor=%23201f31&color=%23ffbade)
![GitHub Downloads (specific asset, latest release)](https://img.shields.io/github/downloads/pratham-jaiswal/anifuri/latest/anifuri.apk?style=flat&label=GitHub%20-%20Downloads@Latest&labelColor=%23201f31&color=%23ffbade)
![Sourceforge Download Anifuri](https://img.shields.io/sourceforge/dt/anifuri.svg?style=flat&label=Sourceforge%20-%20Total%20Downloads&labelColor=%23201f31&color=%23ffbade)

![Codefactor](https://img.shields.io/codefactor/grade/github/pratham-jaiswal/anifuri?style=flat&label=Code%20Quality&labelColor=%23201f31)
![GitHub License](https://img.shields.io/github/license/pratham-jaiswal/anifuri?style=flat&label=License&labelColor=%23201f31)
![Made For Android](https://img.shields.io/badge/Made_For-Android-006400?style=flat&logo=android&logoColor=white&labelColor=%23201f31)
![GitHub Repo stars](https://img.shields.io/github/stars/pratham-jaiswal/anifuri?style=flat&label=Stars&labelColor=%23201f31)
![GitHub forks](https://img.shields.io/github/forks/pratham-jaiswal/anifuri?style=flat&label=Forks&labelColor=%23201f31)

## Features

- **Search Anime**: Search for your favorite anime.
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
- **Episodes List**: View a list of episodes.
- **Stream with Subtitles**: Stream episodes with subtitles.
- **Server Selection**: Choose different servers for episodes to stream them.
- **Mark as Watched**: Mark any _finished airing_ anime as watched.
- **Watched Anime**: View a list of your watched anime.
- **Clear History**: Clear the watched and currently watching anime data.

## Demo

<div style="display: flex; flex-wrap: wrap;">
    <img src="https://file.garden/aATRZRm2KRQR_hmq/Anifuri/0.8.0/Screenshot_2025-05-21-02-26-44-75_f73b71075b1de7323614b647fe394240.jpg" width="300">
    <img src="https://file.garden/aATRZRm2KRQR_hmq/Anifuri/0.8.0/Screenshot_2025-05-21-02-27-14-71_f73b71075b1de7323614b647fe394240.jpg" width="300">
</div>
<div style="display: flex; flex-wrap: wrap;">
    <img src="https://file.garden/aATRZRm2KRQR_hmq/Anifuri/0.8.0/Screenshot_2025-05-21-02-27-29-08_f73b71075b1de7323614b647fe394240.jpg" width="300">
    <img src="https://file.garden/aATRZRm2KRQR_hmq/Anifuri/0.8.0/Screenshot_2025-05-21-02-27-35-35_f73b71075b1de7323614b647fe394240.jpg" width="300">
</div>
<div style="display: flex; flex-wrap: wrap;">
    <img src="https://file.garden/aATRZRm2KRQR_hmq/Anifuri/0.8.0/Screenshot_2025-05-21-02-28-08-93_f73b71075b1de7323614b647fe394240.jpg" width="300">
    <img src="https://file.garden/aATRZRm2KRQR_hmq/Anifuri/0.8.0/Screenshot_2025-05-21-02-28-19-25_f73b71075b1de7323614b647fe394240.jpg" width="300">
</div>

## Built With

- [React Native](https://reactnative.dev/)
- [Expo 53](https://expo.dev/)
- [Axios](https://axios-http.com/)
- [Async Storage](https://react-native-async-storage.github.io/async-storage/)
- [TypeScript](https://www.typescriptlang.org/)
- [FlashList](https://github.com/shopify/flash-list)
- [AniWatch](https://github.com/ghoshRitesh12/aniwatch)

<!-- ## Contributing

Please read [CONTRIBUTING.md](https://github.com/pratham-jaiswal/anifuri/blob/main/CONTRIBUTING.md) for the process of submitting pull requests to us. -->
