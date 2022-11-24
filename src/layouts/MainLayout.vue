<template>
  <q-layout view="HHH Lpr lFf">
    <q-header bordered>
      <q-bar dense class="q-electron-drag">
        <q-icon name="play_arrow" />
        <div>Media Player</div>
        <q-space />
        <q-btn dense flat icon="minimize" @click="minimize" />
        <q-btn dense flat icon="crop_square" @click="toggleMaximize" />
        <q-btn dense flat icon="close" @click="closeApp" />
      </q-bar>
    </q-header>

    <!-- TODO Dynamically resize video player to show fullscreen,
    OR Darken media when visible. Will probably add both, darkened mode
    for when app is in "Theatre Mode" and otherwise resize player to show
    whole video as sidebar is visible  -->
    <q-drawer
      class="text-white"
      style="background-color: #3b3b3b"
      v-model="leftDrawerOpen"
      :breakpoint="0"
      :overlay="false"
    >
      <!-- TODO Add settings button  -->
      <!-- TODO Add playlist button  -->
      <div class="bg-primary q-py-sm row justify-evenly">
        <q-btn dense flat @click="openFolder()" color="white" icon="folder" />
      </div>

      <q-scroll-area style="max-width: 299px; height: calc(100% - 48px)">
        <div v-for="songDir in songLibrary" :key="songDir">
          <q-btn
            style="max-width: 299px"
            align="left"
            no-caps
            flat
            class="full-width"
            @click="loadMedia('/' + songDir)"
          >
            <div class="ellipsis">
              {{ songDir }}
            </div>
          </q-btn>
        </div>
      </q-scroll-area>
    </q-drawer>

    <div
      v-if="volumeSliderShown"
      class="absolute-bottom-right q-mr-xs q-mb-lg q-my-md q-py-md"
      style="background-color: #3b3b3b; z-index: 1"
    >
      <q-slider
        style="max-height: 80px"
        v-model="currentMedia.volume"
        :min="0"
        :max="1"
        :step="0.01"
        color="green"
        thumb-color="white"
        thumb-size="12px"
        track-size="8px"
        vertical
        reverse
      />
    </div>
    <div>
      <video
        class="absolute-center"
        style="width: 100%"
        ref="currentMedia"
        @timeupdate="
          playbackProgress = currentMedia.currentTime / currentMedia.duration
        "
        @ended="
          currentMedia.load();
          isPlaying = false;
          playbackProgress = 0;
        "
      ></video>
    </div>
    <q-footer class="row justify-around align-center">
      <q-btn
        dense
        class="q-py-xs full-height"
        flat
        @click="play()"
        v-if="!isPlaying"
        icon="play_arrow"
      />
      <q-btn
        dense
        class="q-py-xs full-height"
        flat
        @click="pause()"
        v-else
        icon="pause"
      />
      <q-btn
        dense
        class="q-py-xs full-height"
        flat
        @click="seek(currentMedia.currentTime - 5)"
        icon="fast_rewind"
      />
      <q-btn
        dense
        class="q-py-xs full-height"
        flat
        @click="seek(currentMedia.currentTime + 5)"
        icon="fast_forward"
      />
      <p class="q-px-sm no-margin" style="padding-top: 5.5px">
        {{ timeSecondsToMinAndSeconds(currentMedia.currentTime) }}
      </p>
      <!-- TODO Seek progress on mouse drag (Currently only on mouse down) -->
      <q-linear-progress
        ref="seekBar"
        @mousedown="seekBarClicked"
        @scroll.prevent="seekBarScrolled"
        :value="playbackProgress"
        size="16px"
        color="white"
        class="q-my-sm"
        style="max-width: calc(100% - (32px * 8))"
        animation-speed="0"
      />
      <p class="q-px-sm no-margin" style="padding-top: 5.5px">
        -{{
          timeSecondsToMinAndSeconds(
            currentMedia.duration - currentMedia.currentTime
          )
        }}
      </p>
      <q-btn
        @click="toggleVolumeSlider()"
        dense
        class="q-py-xs full-height"
        flat
        icon="volume_up"
      />
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { MouseWheelInputEvent } from 'electron';
import { QLinearProgress } from 'quasar';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MainLayout',
  data() {
    return {
      currentMedia: new Audio() as HTMLMediaElement,
      isPlaying: false,
      volumeSliderShown: false,
      playbackProgress: 0,
      songLibrary: [''],
      songLibraryDir: '',
    };
  },
  methods: {
    // label helper functions

    timeSecondsToMinAndSeconds(seconds: number) {
      if (!seconds) return '00:00';
      seconds = Math.floor(seconds);
      let minutes = Math.floor(seconds / 60);
      let extraSeconds = seconds % 60;
      let outString: string;
      outString = minutes < 10 ? '0' + minutes.toString() : minutes.toString();
      outString =
        extraSeconds < 10
          ? outString + ':' + '0' + extraSeconds
          : outString + ':' + extraSeconds;
      return outString;
    },

    // media controls

    pause() {
      this.currentMedia.pause();
      this.isPlaying = false;
    },

    play() {
      this.currentMedia.play();
      this.isPlaying = true;
    },

    seek(time: number) {
      this.currentMedia.currentTime = time;
    },

    setVolume(percentage: number) {
      if (percentage < 0) percentage = 0;
      if (percentage > 1) percentage = 1;
      this.currentMedia.volume = percentage;
    },

    toggleVolumeSlider() {
      this.volumeSliderShown = !this.volumeSliderShown;
    },

    seekBarClicked(event: MouseEvent) {
      const mousePos = { x: event.pageX, y: event.pageY };
      const seekBarRect = (
        this.$refs.seekBar as QLinearProgress
      ).$el.getBoundingClientRect();
      const mediaDuration = (this.$refs.currentMedia as HTMLMediaElement)
        .duration;

      const targetSeekPercentage =
        (mousePos.x - seekBarRect.left) /
        (seekBarRect.right - seekBarRect.left);

      this.seek(mediaDuration * targetSeekPercentage);
    },

    seekBarScrolled(event: MouseWheelInputEvent) {
      const media = this.$refs.currentMedia as HTMLMediaElement;

      const direction = (event.deltaY as number) < 0 ? 1 : -1;

      const seekAmount = 5;
      const seek = direction * seekAmount;

      this.seek(media.currentTime + seek);
    },

    // library management

    openFolder() {
      let songPaths = [''];
      let setLibrary = this.setSongLibrary;
      let setFolder = this.setLibraryDir;
      window.electronFileApi.dialog
        .showOpenDialog({ properties: ['openDirectory'] })
        .then((folder) => {
          handleSelected(folder.filePaths);
        })
        .catch((err) => {
          console.error(err);
        });

      function handleSelected(folderPaths: string[]) {
        folderPaths.forEach((folderPath) => {
          setFolder(folderPath);
          const files = window.electronFileApi.readdirSync(folderPath);
          // TODO Currently only adds songs in selected folder. Change to also search subfolders.
          const audioFileTypes = ['.mp3', '.wav', '.ogg'];
          const videoFileTypes = ['.mpg', '.mpeg', '.avi', '.webm', '.mp4'];
          const audioFiles = files.filter(function (file) {
            const extension = window.electronFileApi.extname(file);
            return (
              audioFileTypes.includes(extension) ||
              videoFileTypes.includes(extension)
            );
          });
          songPaths = audioFiles;
          setLibrary(songPaths);
        });
      }
    },

    setSongLibrary(songPaths: string[]) {
      this.songLibrary = songPaths;
    },

    setLibraryDir(directory: string) {
      this.songLibraryDir = directory;
    },

    // BUG Does not load media with "#" character in filename
    loadMedia(mediaFileName: string) {
      this.currentMedia.src = this.songLibraryDir + mediaFileName;
      this.currentMedia.load();
      // TODO Window aspect ratio should change to match video and be 16:9 otherwise
      if (this.currentMedia instanceof HTMLVideoElement) {
        const video = this.currentMedia as HTMLVideoElement;
        const aspectRatio = video.videoWidth / video.videoHeight;
        window.windowControlApi.setAspectRatio(aspectRatio);
      }
      this.play();
    },
  },
  setup() {
    const leftDrawerOpen = ref(false);

    // window control
    function minimize() {
      if (process.env.MODE === 'electron') {
        window.windowControlApi.minimize();
      }
    }

    function toggleMaximize() {
      if (process.env.MODE === 'electron') {
        window.windowControlApi.toggleMaximize();
      }
    }

    function closeApp() {
      if (process.env.MODE === 'electron') {
        window.windowControlApi.close();
      }
    }

    return {
      leftDrawerOpen: true,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      minimize,
      toggleMaximize,
      closeApp,
    };
  },
  mounted() {
    this.currentMedia = this.$refs.currentMedia as HTMLMediaElement;
  },
});
</script>
