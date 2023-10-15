<script setup lang="ts">
	import BaseField from "@/components/BaseField.vue";
	import TheCatalog from "@/components/TheCatalog.vue";
	import TheMap from "@/components/TheMap.vue";
	import type { Place } from "@/lib/types";
	import {
		TRANSITION_TIMEOUT,
		THRESHOLD,
		LOW_GADGET_HEIGHT,
	} from "@/lib/constants";
	import { computed, ref } from "vue";
	import { useAppStore } from "@/stores";
	import { wait } from "@/lib/utils";

	const MIN_PANEL_HEIGHT = 80; // Высота панели в покое

	const panelElement = ref<HTMLDivElement | null>(null);
	const panelHeight = ref(MIN_PANEL_HEIGHT);
	const diff = ref(0); // Разница между координатами верха панели и точки нажатия
	const animating = ref(false); // Режим плавного изменения высоты панели
	const dragging = ref(false); // Режим перетаскивания
	const overlayed = ref(false); // Режим появления оверлея над панелью

	// Величина координаты в начале перетаскивания, сравнивается с координатой в конце перетаскивания
	const startCoord = ref(0);

	const query = ref("");
	const renewPlaces = ref(false);
	const filteredPlaces = ref<Place[]>([]);
	const dragTargetElement = ref<HTMLElement | null>(null);

	const appStore = useAppStore();
	appStore.get();

	const places = computed(() => {
		if (filteredPlaces.value.length) {
			return filteredPlaces.value;
		}
		return appStore.state.places;
	});

	async function setHeightSmoothly(value: number) {
		animating.value = true;
		panelHeight.value = value;

		await wait(TRANSITION_TIMEOUT); // Ожидаем завершения анимации

		startCoord.value = panelHeight.value;
		animating.value = false;
	}

	async function makePanelHigh() {
		overlayed.value = true;
		await setHeightSmoothly(document.body.clientHeight - MIN_PANEL_HEIGHT);
	}

	async function makePanelMedium() {
		overlayed.value = false;
		await setHeightSmoothly(
			(document.body.clientHeight - MIN_PANEL_HEIGHT) / 2,
		);
	}

	async function makePanelLow() {
		overlayed.value = false;
		await setHeightSmoothly(MIN_PANEL_HEIGHT);
	}

	async function onDragStart(event: Event | Touch, y: number) {
		dragTargetElement.value = event.target as HTMLElement;
		diff.value = document.body.clientHeight - y - panelHeight.value;
		startCoord.value = panelHeight.value;
		dragging.value = true;
	}

	function onDrag(y: number) {
		if (!dragging.value) {
			return;
		}
		if (y < THRESHOLD || y > document.body.clientHeight - THRESHOLD) {
			return onDragEnd();
		}

		const value = document.body.clientHeight - y - diff.value;
		overlayed.value = value > (document.body.clientHeight * 3) / 5;
		panelHeight.value = value;
	}

	function onDragEnd() {
		dragging.value = false;

		// Раскрытие поиска из нижней панели
		if (
			panelHeight.value === MIN_PANEL_HEIGHT &&
			dragTargetElement.value?.tagName.toLowerCase() === "input"
		) {
			return makePanelHigh();
		}

		const delta = startCoord.value - panelHeight.value;
		if (!delta) {
			return;
		}

		if (document.body.clientHeight < LOW_GADGET_HEIGHT) {
			return delta > 0 ? makePanelLow() : makePanelHigh();
		}

		const lowMultiplayer = delta > 0 ? 2 : 1;
		if (panelHeight.value < (document.body.clientHeight * lowMultiplayer) / 5) {
			return makePanelLow();
		}

		const highMultiplayer = delta > 0 ? 4 : 2.5;
		if (
			panelHeight.value >
			(document.body.clientHeight * highMultiplayer) / 5
		) {
			return makePanelHigh();
		}

		return makePanelMedium();
	}

	async function onSearch() {
		filteredPlaces.value = [];
		await appStore.search(query.value);
		renewPlaces.value = true;
	}
</script>

<template>
	<div
		class="app"
		v-if="appStore.state.center"
		@touchmove.prevent="onDrag($event.changedTouches[0].clientY)"
		@mousemove.prevent="onDrag($event.clientY)"
	>
		<TheMap class="app__map" :center="appStore.state.center" :places="places" />

		<div
			class="app__panel"
			:class="{
				'app__panel--animated': animating,
				'app__panel--dragging': dragging,
				'app__panel--overlayed': overlayed,
			}"
			ref="panelElement"
			@touchstart="
				onDragStart($event.changedTouches[0], $event.changedTouches[0].clientY)
			"
			@touchend="onDragEnd"
			@mousedown="onDragStart($event, $event.clientY)"
			@mouseup="onDragEnd"
			:style="`height: ${panelHeight}px`"
		>
			<span class="app__overlay" @click="makePanelLow"></span>
			<span class="app__top-saver"></span>

			<BaseField
				class="app__search"
				v-model="query"
				@update:model-value="onSearch"
				type="search"
				placeholder="Поиск мест, скидок, карт поблизости"
			/>

			<TheCatalog
				:places="appStore.state.places"
				:renew="renewPlaces"
				@places:filter="filteredPlaces = $event"
				@scroll:top="makePanelLow"
				@scroll:bottom="makePanelHigh"
				@update:resetRenew="renewPlaces = false"
			/>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.app {
		display: grid;
		grid-template-rows: 1fr auto;
		height: 100vh;
		overflow: hidden;
	}

	.app__overlay {
		position: absolute;
		right: 0;
		bottom: 100%;
		left: 0;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		visibility: hidden;
		opacity: 0;
		transition: $transitions-default;
		transition-property: opacity, visibility;
	}

	// Чтобы на границе с картой перетягивание тоже работало
	.app__top-saver {
		position: absolute;
		right: 0;
		bottom: 100%;
		left: 0;
		height: 20px;
	}

	.app__panel {
		position: relative;
		z-index: 400; // из-за leaflet
		box-sizing: border-box;
		padding-top: 20px;
		box-shadow: 0 -8px 16px 0 rgba(45, 52, 64, 0.12);

		&::before,
		&::after {
			content: "";
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
		}

		&::before {
			top: 8px;
			width: 60px;
			height: 4px;
			background-color: #bbbbbb;
			border-radius: 2px;
		}

		// Зона демонстрации курсора
		&::after {
			top: 0;
			width: 80px;
			height: 20px;
			cursor: grab;
		}

		&--dragging {
			cursor: grabbing;

			&::after {
				cursor: inherit;
			}
		}

		&--overlayed {
			.app__overlay {
				visibility: visible;
				opacity: 1;
			}
		}

		&--animated {
			transition: height $transitions-default;
		}
	}

	.app__search {
		margin: 0 15px;
	}
</style>
