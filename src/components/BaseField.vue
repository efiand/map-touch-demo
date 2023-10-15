<script setup lang="ts">
	import BaseIcon from "./BaseIcon.vue";
	import type { InputHTMLAttributes } from "vue";
	import { computed } from "vue";

	const props = withDefaults(
		defineProps<{
			modelValue: string | number;
			placeholder?: string;
			type?: InputHTMLAttributes["type"];
		}>(),
		{
			type: "text",
		},
	);
	const emit = defineEmits(["update:modelValue", "focus"]);

	const value = computed({
		get() {
			return props.modelValue;
		},
		set(value) {
			emit("update:modelValue", value);
		},
	});
</script>

<template>
	<div class="field">
		<input
			class="field__input"
			v-model="value"
			@focus="emit('focus')"
			:type="type"
			:placeholder="placeholder"
			:aria-label="placeholder"
		/>

		<template v-if="type === 'search'">
			<template v-if="value">
				<button
					class="field__reset"
					type="button"
					@click="$emit('update:modelValue', '')"
					aria-label="Очистить"
				>
					<BaseIcon class="field__icon" id="cross" />
				</button>
			</template>
			<BaseIcon class="field__icon" v-else id="search" />
		</template>
	</div>
</template>

<style scoped lang="scss">
	.field {
		position: relative;
	}

	.field__input {
		box-sizing: border-box;
		width: 100%;
		padding: 10px 40px 10px 15px;
		font: inherit;
		line-height: 24px;
		background-color: #e0e0e0;
		border: none;
		border-radius: 4px;

		&:focus-visible {
			outline: 2px solid rgba(#111111, 0.2);
		}

		&::placeholder {
			color: inherit;
			opacity: 0.5;
		}
	}

	.field__reset {
		position: absolute;
		top: 0;
		right: 0;
		width: 40px;
		height: 100%;
		background-color: transparent;
		border: none;
		opacity: 0.5;
		transition: opacity $transitions-default;

		@media (hover: hover) {
			opacity: 1;
		}
	}

	.field__icon {
		position: absolute;
		top: 12px;
		right: 12px;
		opacity: 0.6;

		&:focus-visible {
			outline: none;
		}
	}
</style>
