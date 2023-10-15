<script setup lang="ts">
	import TheCard from "./TheCard.vue";
	import type { Place, PlacesGroup } from "@/lib/types";
	import type { Swiper as SwiperClass } from "swiper/types";
	import { Category, TRANSITION_TIMEOUT } from "@/lib/constants";
	import { Pagination } from "swiper/modules";
	import { Swiper, SwiperSlide } from "swiper/vue";
	import { computed, onMounted, ref, reactive, watch } from "vue";
	import { wait } from "@/lib/utils";

	const props = defineProps<{
		places: Place[];
		renew: boolean;
	}>();
	const emit = defineEmits([
		"places:filter",
		"update:resetRenew",
		"scroll:top",
		"scroll:bottom",
	]);

	const sliderModules = ref([Pagination]);
	const paginationElement = ref<HTMLDivElement | null>(null);
	const paginationSettings = reactive({
		bulletClass: "catalog__tab",
		bulletActiveClass: "catalog__tab--active",
		clickable: true,
		el: paginationElement.value,
		renderBullet: (index: number, className: string) => `
			<button class="${className}">${slideGroups.value[index].title}</button>
		`,
	});
	const swiperInstance = ref<SwiperClass | null>(null); // Экземпляр свайпера

	// Режим блокировки прокрутки в момент переключения шторок
	const lockingScroll = ref(false);

	const slideGroups = computed((): PlacesGroup[] =>
		[
			{
				title: "Все",
				places: props.places,
			},
			...Object.entries(Category).map(([key, title]) => ({
				title,
				places: props.places.filter(({ category }) => category === key),
			})),
		].filter(({ places }) => places.length),
	);

	onMounted(() => {
		paginationSettings.el = paginationElement.value;
	});

	watch(
		() => slideGroups.value,
		() => {
			if (props.renew && slideGroups.value.length) {
				// Следим, чтобы при перезапросе поиска был переход на первую вкладку
				swiperInstance.value?.slideTo(0, 0);
			}
			emit("update:resetRenew");
		},
	);

	async function saveScroll(callback = () => {}) {
		lockingScroll.value = true;

		await wait(TRANSITION_TIMEOUT);

		callback();
		lockingScroll.value = false;
	}

	// В момент плавного перемещения створки не должно быть отлавливание скролла
	function setScroll(
		element: HTMLElement,
		scrollTop: number = element.scrollTop,
	) {
		saveScroll(() => (element.scrollTop = scrollTop));
	}

	function onSwiper(swiper: SwiperClass) {
		swiperInstance.value = swiper;
	}

	function onSlideChange({ activeIndex }: SwiperClass) {
		emit("places:filter", slideGroups.value[activeIndex].places);
		saveScroll();
	}

	async function onScroll(event: Event) {
		if (lockingScroll.value || !event.isTrusted) {
			return;
		}

		const element = event.target as HTMLElement;

		if (element.scrollTop === 0) {
			setScroll(element);
			emit("scroll:top");
		} else if (
			element.scrollTop >=
			element.scrollHeight - element.clientHeight
		) {
			setScroll(element);
			emit("scroll:bottom");
		}
	}
</script>

<template>
	<section class="catalog">
		<header
			class="catalog__pagination"
			ref="paginationElement"
			v-show="slideGroups.length"
		></header>

		<div
			class="catalog__main"
			:class="{
				'catalog__main--empty': !slideGroups.length,
				'catalog__main--locked': lockingScroll,
			}"
			@mousedown.stop
			@touchstart.stop
			@mousemove.stop
			@touchmove.stop
			@scroll="onScroll"
		>
			<Swiper
				class="catalog__slider"
				v-if="slideGroups.length"
				:autoHeight="true"
				:slidesPerView="'auto'"
				:modules="sliderModules"
				:pagination="paginationSettings"
				@swiper="onSwiper"
				@slideChange="onSlideChange"
			>
				<SwiperSlide
					class="catalog__slide"
					v-for="{ title, places } in slideGroups"
					:key="title"
				>
					<ul class="catalog__cards">
						<li v-for="(place, i) in places" :key="i">
							<TheCard :place="place"> </TheCard>
						</li>
					</ul>
				</SwiperSlide>
			</Swiper>
			<p class="catalog__empty" v-else>
				Поиск не дал результатов. Попробуйте изменить поисковый запрос.
			</p>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.catalog {
		display: flex;
		flex-direction: column;
		height: 100%;
		user-select: none;
	}

	.catalog__pagination {
		position: relative;
		top: 0;
		z-index: 2;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		padding-top: 8px;
		box-shadow: 0 8px 16px 0 rgba(45, 52, 64, 0.12);

		&:deep(.catalog__tab) {
			padding: 10px;
			font: inherit;
			line-height: 24px;
			text-transform: uppercase;
			background-color: transparent;
			border: none;
			border-bottom: 3px solid transparent;
			transition: $transitions-default;
			transition-property: color, border-color;

			@include media-desktop {
				padding: 10px 20px;
			}
		}

		&:deep(.catalog__tab--active) {
			color: #10a9a0;
			border-color: #10a9a0;
		}
	}

	.catalog__main {
		height: calc(100% - 98px);
		overflow-y: auto;

		&--empty {
			height: 100%;
		}

		&--locked {
			overflow-y: hidden;
		}
	}

	.catalog__slider {
		max-width: 100vw;
	}

	.catalog__cards {
		display: grid;
		gap: 20px;
		margin: 0;
		padding: 20px 15px;
		list-style: none;
	}

	.catalog__empty {
		padding: 20px 15px;
	}
</style>
