const axios = require('axios');

const weekDays = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];

const getYear = () => {
	const date = new Date();
	const year = date.getFullYear();
	return year;
};

const getWeekNumber = () => {
	const date = new Date();
	const startDate = new Date(date.getFullYear(), 0, 1);
	const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));

	const weekNumber = Math.ceil(days / 7);

	if (date.getDay() === 0) return weekNumber + 1;

	return weekNumber;
};

const fetchVersion = async () => {
	const url = `https://unisafka.fi/static/json/${getYear()}/${getWeekNumber()}/v.json`;
	try {
		const { data } = await axios.get(url);
		return data.v;
	} catch (err) {
		console.error(
			'Version not recieved',
			err.response?.status,
			err.response?.statusText,
			err.config.url
		);
	}
};

const fetchMenu = async (day) => {
	const date = new Date();
	const version = await fetchVersion();
	const url = `https://unisafka.fi/static/json/${getYear()}/${getWeekNumber()}/${version}/${
		day || weekDays[date.getDay()]
	}.json`;

	try {
		const { data } = await axios.get(url);
		return data;
	} catch (err) {
		console.error(
			'No menus recieved',
			err.response?.status,
			err.response?.statusText,
			err.config.url
		);
	}
};

module.exports = { fetchMenu };
