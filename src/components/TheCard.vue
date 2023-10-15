<script setup lang="ts">
	import { type Place } from "@/lib/types";
	import { Category } from "@/lib/constants";

	defineProps<{
		place: Place;
	}>();
</script>

<template>
	<div class="card">
		<h2 class="card__title">{{ place.name }}</h2>
		<b>Категория:</b> {{ Category[place.category] }}. <b>Координаты:</b>
		{{ place.location.lat }}, {{ place.location.lng }}.
	</div>
</template>

<style scoped lang="scss">
	.card {
		box-sizing: border-box;
		padding: 20px;
		background-color: #ffffff;
		border-radius: 4px;
	}

	.card__title {
		margin: 0 0 15px;
		font-size: 20px;
		line-height: inherit;
	}
</style>
