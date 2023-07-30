const getNextDateOfTheDay = (dayName) => {
	const daysOfWeek = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
	const inputDayIndex = daysOfWeek.findIndex(
		(day) => day === dayName.toLowerCase()
	);

	if (inputDayIndex === -1) return;

	const today = new Date();
	const currentDayIndex = today.getDay();
	const daysToAdd =
		inputDayIndex +
		(inputDayIndex >= currentDayIndex ? 0 : 7) -
		currentDayIndex;

	const nextDate = new Date(today);
	nextDate.setDate(today.getDate() + daysToAdd);
	return `${nextDate.getDate()}.${nextDate.getMonth() + 1}`;
};

module.exports = { getNextDateOfTheDay };
