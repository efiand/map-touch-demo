<script setup lang="ts">
	import L from "leaflet";
	import type { Coord, Place } from "@/lib/types";
	import { onMounted, ref, watch } from "vue";

	const ICON_OPTIONS: L.IconOptions = {
		iconUrl: "pin.svg",
		iconSize: [36, 46],
		iconAnchor: [18, 46],
	};

	const mapElement = ref<HTMLDivElement | null>(null);
	const mapInstance = ref<L.Map | null>(null);
	const markerGroup = ref<L.LayerGroup>(L.layerGroup());
	const mapWidth = ref(0);

	const props = withDefaults(
		defineProps<{
			center: Coord;
			places: Place[];
			zoom?: number;
		}>(),
		{
			zoom: 10,
		},
	);

	onMounted(async () => {
		mapInstance.value = createMap();
		mapWidth.value = mapElement.value?.clientWidth || 0;

		// Для выдвижения панели отключено перестраивание, а при повороте девайса или ресайзе окна
		// нужно перестраивать
		window.addEventListener("resize", () => {
			const width = mapElement.value?.clientWidth;

			if (width !== mapWidth.value) {
				mapInstance.value?.off().remove();
				mapInstance.value = createMap();
			}

			mapWidth.value = width || 0;
		});
	});

	function createMap() {
		const map = L.map(mapElement.value as HTMLElement, {
			preferCanvas: true,
			trackResize: false, // иначе скачет на мобиле
		});
		L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
			subdomains: ["mt0", "mt1", "mt2", "mt3"],
		}).addTo(map);

		markerGroup.value.addTo(map);
		addMarkers();
		map.setView(props.center, props.zoom);

		return map;
	}

	function addMarkers() {
		markerGroup.value.clearLayers();

		props.places.forEach(({ location, name }: Place) => {
			const pinIcon: L.Marker = L.marker(location, {
				icon: L.icon(ICON_OPTIONS),
			});
			pinIcon
				.bindPopup(`<b>${name}</b>`)
				.addTo(markerGroup.value as L.LayerGroup);
		});
	}

	watch(
		() => props.places,
		() => {
			addMarkers();
		},
	);
</script>

<template>
	<div class="map" ref="mapElement"></div>
</template>

<style scoped lang="scss">
	.map {
		height: 100%;
	}
</style>
