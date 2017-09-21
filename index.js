const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
// create application/json parser
const jsonParser = bodyParser.json();

const Moon = (card_number) => {
	const arr = [];
	card_number = card_number.toString();
	for(let i = 0; i < card_number.length; i++) {
		if(i % 2 === 0) {
			const m = parseInt(card_number[i]) * 2;
			if(m > 9) {
				arr.push(m - 9);
			} else {
				arr.push(m);
			}
		} else {
			const n = parseInt(card_number[i]);
			arr.push(n)
		}
	}
	const summ = arr.reduce(function(a, b) { return a + b; });
	return Boolean(!(summ % 10));
};

const readCards = () => {
	return new Promise((resolve, reject) => {
		fs.readFile('source/cards.json', 'utf8', (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	});
};

const addCards = (cardsData) => {
	return new Promise((resolve, reject) => {
		fs.writeFile('source/cards.json', JSON.stringify(cardsData), (err) => {
			if (err) reject(err);
			resolve();
		});
	});
};

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.send(`<!doctype html>
	<html>
		<head>
			<link rel="stylesheet" href="/style.css">
		</head>
		<body>
			<h1>Hello Smolny!</h1>
		</body>
	</html>`);
});

app.get('/error', (req, res) => {
	throw Error('Oops!');
});

app.get('/transfer', (req, res) => {
	const {amount, from, to} = req.query;
	res.json({
		result: 'success',
		amount,
		from,
		to
	});
});

app.get('/cards', (req, res) => {
	const htmlStart = `<!doctype html><html><head><link rel="stylesheet" href="/style.css"></head><body>`;
	const htmlEnd = `</body></html>`;

	readCards()
		.then((cards) => {
			let htmlMiddle = `<ul>`;
			JSON.parse(cards).forEach((card) => {
				htmlMiddle += `<li>Number: ${card.cardNumber}, Balance: ${card.balance}</li>`;
			});
			htmlMiddle += '</ul>';
			res.send(htmlStart + htmlMiddle + htmlEnd);
		})
		.catch((err) => {
			throw err;
			res.status(500).send('Something broke!');
		});

});

app.post('/cards', jsonParser, (req, res) => {
	readCards()
		.then((cards) => {
			// TODO: сделать проверку на такие же номера
			// TODO: проверить алгоритмом Луна
			if (!req.body) return res.sendStatus(400);
			const newCard = req.body;
			const cardsData = JSON.parse(cards);
			cardsData.push(newCard);

			addCards(cardsData)
				.then(() => {
					res.send(JSON.stringify(newCard));
				})
				.catch((err) => {
					throw err;
					res.status(500).send('Something broke!');
				})

		})
		.catch((err) => {
			throw err;
			res.status(500).send('Something broke!');
		});

});

app.delete('/cards/:id', (req, res) => {
	const cardId = req.params.id || null;
	if (!cardId) return res.status(404).send('Card not found');
	readCards()
		.then((cards) => {
			const cardsData = JSON.parse(cards)
			if (cardsData[cardId]) {
				cardsData.splice(cardId, 1);
				addCards(cardsData)
					.then(() => {
						res.sendStatus(200);
					})
			} else {
				return res.status(404).send('Card not found');
			}
		})
});


app.listen(3000, () => {
	console.log('YM Node School App listening on port 3000!');
});
