import type { Coord, Place } from "@/lib/types";
import { defineStore } from "pinia";
import { reactive } from "vue";

interface State {
	center?: Coord;
	places: Place[];
}

const cache: State = {
	places: [],
};

export const useAppStore = defineStore("user", () => {
	const state = reactive<State>({ places: [] });

	async function get() {
		const response = await fetch("api.json");
		const { center, places }: State = await response.json();
		state.center = center;
		state.places = places;
		cache.places = places;
	}

	async function search(query: string = "") {
		state.places = cache.places.filter(({ name }: Place) => {
			return (
				!query ||
				name.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim())
			);
		});
	}

	return { state, get, search };
});
