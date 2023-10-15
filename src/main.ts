import "leaflet/dist/leaflet.css";
import "swiper/css";
import "swiper/css/pagination";
import "@/assets/scss/base/index.scss";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";

const app = createApp(App);

app.use(createPinia());

app.mount("#app");
