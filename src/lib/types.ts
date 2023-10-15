export enum CategoryType {
	CARDS = "CARDS",
	DISCOUNTS = "DISCOUNTS",
	PLACES = "PLACES",
}

export interface Coord {
	lat: number;
	lng: number;
}

export interface Place {
	location: Coord;
	name: string;
	category: CategoryType;
}

export interface PlacesGroup {
	title: string;
	places: Place[];
}
