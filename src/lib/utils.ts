export const wait = async (ms = 0) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};
