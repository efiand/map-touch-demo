import { CategoryType } from "@/lib/types";

export const Category = {
	[CategoryType.CARDS]: "Карты",
	[CategoryType.DISCOUNTS]: "Скидки",
	[CategoryType.PLACES]: "Места",
};

// Допуск на прокрутку и перетягивание
export const THRESHOLD = 10;

// Время ожидания завершения плавных переходов
export const TRANSITION_TIMEOUT = 400;

// Для невысоких гаджетов нецелесообразен средний режим створки
export const LOW_GADGET_HEIGHT = 600;
