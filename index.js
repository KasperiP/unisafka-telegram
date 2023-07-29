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
	const [_, campus, day = weekDaysShort[new Date().getDay()]] =
		match.input.split(' ');

	if (!campus || !campuses.includes(campus) || !weekDaysShort.includes(day)) {
		return bot.sendMessage(
			msg.chat.id,
			`Valitse haluamasi kampus komennolla. Voit myös valita haluamasi päivän: /ruokalista tay ma`,
			{
				reply_markup: {
					keyboard: campuses.map((campus) => [
						`/ruokalista ${campus}`,
					]),
				},
			}
		);
	}

	const menu = await fetchMenu(day);
	const wantedRestaurants = menu?.restaurants?.[campus];
	const availableMeals = menu?.[`restaurants_${campus}`];

	if (!wantedRestaurants || !availableMeals) return;

	const outputs = {};

	wantedRestaurants.forEach((restaurant) => {
		const resMenu = availableMeals?.[restaurant];
		if (!resMenu) return;
		outputs[resMenu.restaurant] =
			resMenu.meals.length === 0
				? 'Ravintola kiinni'
				: resMenu.meals
						.map((meal, index) => {
							const foodObj = meal.mo
								.map((menuItem) =>
									menuItem.mpn.replace(/[^a-zåäö\s]/gi, '')
								)
								.join(', ');
							return `*${index + 1})* ${foodObj}\n`;
						})
						.join('');
	});

	const dateStr = `${weekDays[weekDaysShort.indexOf(day)]} ${
		new Date().getDate() + weekDaysShort.indexOf(day) - new Date().getDay()
	}.${new Date().getMonth() + 1}.`;
	let mealsStr = Object.entries(outputs)
		.map(([res, list]) => `${res}\n${list}\n\n`)
		.join('');

	mealsStr = mealsStr.replace(/\n{3,}/g, '\n\n');

	mealsStr +=
		`💡 _Voit myös hakea haluamasi päivän ruokalistat komennolla:_ \`/ruokalista ${campus} ma\``.toString();

	bot.sendMessage(msg.chat.id, `*Ruokalistat ${dateStr}*\n\n${mealsStr}`, {
		parse_mode: 'Markdown',
	});
});
