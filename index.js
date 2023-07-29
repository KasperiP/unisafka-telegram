const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const { fetchMenu } = require('./functions/fetchMenu');

const token = process.env.TELEGRAM_BOT_TOKEN;

const weekDays = [
	'Sunnuntai',
	'Maanantai',
	'Tiistai',
	'Keskiviikko',
	'Torstai',
	'Perjantai',
	'Lauantai',
];
const weekDaysShort = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
const campuses = ['tty', 'tay', 'tays', 'tamk'];

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/ruokalista/, async (msg, match) => {
	const campus = match.input.split(' ')?.[1];
	const day =
		match.input.split(' ')?.[2] ?? weekDaysShort[new Date().getDay()];

	if (!campus && !campuses?.includes(campus)) {
		bot.sendMessage(
			msg.chat.id,
			'Valitse haluamasi kampus komennolla. Voit myös valita haluamasi päivän: /ruokalista tay ti',
			{
				reply_markup: {
					keyboard: [
						['/ruokalista tty'],
						['/ruokalista tay'],
						['/ruokalista tays'],
						['/ruokalista tamk'],
					],
				},
			}
		);
	}

	const menu = await fetchMenu(day);

	const wantedRestaurants = menu?.restaurants?.[campus];
	const availableMeals = menu?.[`restaurants_${campus}`];

	if (!wantedRestaurants || !availableMeals) return;

	const outputs = new Object();

	wantedRestaurants.forEach((restaurant) => {
		const resMenu = availableMeals?.[restaurant];
		if (!resMenu) return;
		outputs[resMenu.restaurant] = '';

		if (resMenu.meals.length === 0) {
			outputs[resMenu.restaurant] = 'Ravintola kiinni';
		} else {
			const mo = resMenu.meals.map((meal) => meal.mo);
			mo.forEach((meal, index) => {
				const foodObj = meal
					.map((menuItem) => menuItem.mpn)
					.map((food) => {
						const allowedCharacters =
							'abcdefghijklmnopqrstuvwxyzåäö';
						const foodArr = food.split('');
						const foodArrFiltered = foodArr.filter(
							(char) =>
								allowedCharacters.includes(
									char.toLowerCase()
								) || char === ' '
						);
						const foodFiltered = foodArrFiltered.join('');

						return foodFiltered;
					});
				outputs[resMenu.restaurant] += `*${index + 1})* ${foodObj.join(
					', '
				)}\n`;
			});
		}
	});

	let dateStr = '';
	if (day) {
		dateStr += `${weekDays[weekDaysShort.indexOf(day)]} ${
			new Date().getDate() +
			weekDaysShort.indexOf(day) -
			new Date().getDay()
		}.${new Date().getMonth() + 1}.`;
	} else {
		dateStr = `${weekDays[new Date().getDay()]} ${new Date().getDate()}.${
			new Date().getMonth() + 1
		}.`;
	}

	let mealsStr = '';
	Object.entries(outputs).forEach(([res, list]) => {
		mealsStr += `${res}\n${list}\n\n`;
	});

	mealsStr = mealsStr.replace(/\n{3,}/g, '\n\n');

	mealsStr +=
		`💡 _Voit myös hakea haluamasi päivän ruokalistat komennolla:` +
		'_`' +
		`/ruokalista ${campus} ma` +
		'`';

	bot.sendMessage(msg.chat.id, `*Ruokalistat ${dateStr}*\n\n${mealsStr}`, {
		parse_mode: 'Markdown',
	});
});
