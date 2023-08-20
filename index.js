const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const { fetchMenu } = require('./functions/fetchMenu');
const { getNextDateOfTheDay } = require('./functions/getNextDate');

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

	if (
		weekDaysShort.indexOf(day) < new Date().getDay() &&
		weekDaysShort.indexOf(day) !== 0
	) {
		return bot.sendMessage(
			msg.chat.id,
			`Päivä ${
				weekDays[weekDaysShort.indexOf(day)]
			} on jo mennyt, eikä seuraavan viikon ruokalistoja ole vielä saatavilla! 😢`
		);
	}

	console.log(
		`${new Date().toLocaleString()} - ${msg.from.username} - ${match.input}`
	);

	const menu = await fetchMenu(day);

	const wantedRestaurants = menu?.restaurants?.[campus];
	const availableMeals = menu?.[`restaurants_${campus}`];

	if (!wantedRestaurants || !availableMeals) {
		return bot.sendMessage(
			msg.chat.id,
			`Ruokalistojen hakemisessa päivälle ${weekDays[
				weekDaysShort.indexOf(day)
			].toLowerCase()} tapahtui virhe. Yritä myöhemmin uudelleen.`
		);
	}

	const outputs = {};

	wantedRestaurants.forEach((restaurant) => {
		const resMenu = availableMeals?.[restaurant];
		if (!resMenu) return;
		outputs[restaurant] =
			resMenu.meals.length === 0
				? 'Ravintola kiinni'
				: resMenu.meals
						.map((meal, index) => {
							const foodObj = meal.mo
								.map((menuItem) =>
									menuItem.mpn.replace(/[^a-zåäö\s]/gi, '')
								)
								.join(', ');
							return `*(${index + 1})* ${foodObj}\n`;
						})
						.join('');
	});

	const dateStr = `${
		weekDays[weekDaysShort.indexOf(day)]
	} ${getNextDateOfTheDay(day)}.`;

	let mealsStr = Object.entries(outputs)
		.map(
			([res, list]) =>
				`*${availableMeals[res].restaurant}*${
					availableMeals[res].eating_hours !== '' &&
					availableMeals[res].meals.length !== 0
						? ` *(${availableMeals[res].eating_hours})*`
						: ''
				}\n${list}\n\n`
		)
		.join('');

	mealsStr = mealsStr.replace(/\n{3,}/g, '\n\n');

	mealsStr +=
		`💡 _Voit myös hakea haluamasi päivän ruokalistat komennolla:_ \`/ruokalista ${campus} ma\``.toString();

	bot.sendMessage(msg.chat.id, `*Ruokalistat ${dateStr}*\n\n${mealsStr}`, {
		parse_mode: 'Markdown',
	});
});

bot.onText(/\/source/, (msg) => {
	console.log(
		`${new Date().toLocaleString()} - ${msg.from.username} - /source`
	);
	bot.sendMessage(
		msg.chat.id,
		'Tämä botti pohjautuu avoimeen lähdekoodiin. Voit tarkastella koodia *GitHubissa*, sekä ilmoittaa mahdollisista ongelmista GitHubin _issues_-välilehdellä:\n\nhttps://github.com/KasperiP/unisafka-telegram',
		{
			parse_mode: 'Markdown',
		}
	);
});
