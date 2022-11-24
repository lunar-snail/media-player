# Media Player

A clean and minimal media player.

Inspired by the minimal design of MPV media player. Having used MPV for a while, there are features I sorely wished it had: Media queues, playlists, better interaction without needing to use hotkeys.


This is an Electron app made in Typescript and Vue using the Quasar framwork.

## Features
This app is still in development, so there is no production build available for download yet. This will change when the first production version is out, however for the moment only development versions are available.
### Current features
- Open folder as media library
- Support for file formats: .mp3, .wav, .ogg, .mpeg, .avi, .webm, .mp4
### Features In development
- Create media queues
- Create playlists
- Support for .mkv and other file formats


## Usage



### Install the dependencies
```bash
yarn install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev -m electron
```

### Build the app for production
```bash
quasar build -m electron
```
