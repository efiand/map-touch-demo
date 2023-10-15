<script setup lang="ts">
	withDefaults(defineProps<{ id: string; size?: number }>(), {
		size: 16,
	});
</script>

<template>
	<svg
		class="icon"
		:width="size"
		:height="size"
		aria-hidden="true"
		focusable="false"
	>
		<use :href="`sprite.svg#${id}`" />
	</svg>
</template>

<style scoped lang="scss">
	.icon {
		pointer-events: none;
		fill: currentColor;
	}
</style>
