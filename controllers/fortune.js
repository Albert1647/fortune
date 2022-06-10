const axios = require("../api/fortune");
const seedrandom = require('seedrandom');
const {
	zodiacRivalTable,
	zodiacTimeTable,
	zodiacFriendshipPair,
	elementCode,
	colorTable,
	inauspiciousColor,
} = require("../assets/fortuneTable.js");

exports.getUserColorWeekly = (req, res, next) => {
	let token = req.headers["authorization"];
	let date = req.query.date;
	axios
		.get("/users/profile", {
			headers: {
				'Authorization': token,
			},
		})
		.then((response) => {
			let userData = response.data;
			let dateOfBirth = userData.date_of_birth;
			let timeOfBirth = userData.time_of_birth;
			if (timeOfBirth === "") {
				timeOfBirth = "null";
			}
			let promises = [];
			let userElement;
			let weekElementArray = [];
			let weekDate = [];
			let weekSeed = [];
			promises.push(
				axios
					.get(`/calendar/bazi/${dateOfBirth}/${timeOfBirth}`, {
						headers: {
							Authorization: token,
						},
					})
					.then((user) => {
						let natal = user.data;
						userElement = getElement(natal);
					})
					.catch((err) => {
						res.status(500).send("Something Broke!");
					})
			);

			let today = new Date(date);
			let dobSeed = new Date(dateOfBirth).getTime();
			let totalDay = 30;
			for (var i = 0; i < totalDay; i++) {
				let todayDate = today.toISOString().slice(0, 10);
				let todaySeed = new Date(todayDate).getTime();
				let seed = todaySeed + dobSeed;
				promises.push(
					axios
						.get(`/calendar/bazi/${todayDate}/null`, {
							headers: {
								Authorization: token,
							},
						})
						.then((day) => {
							let natal = day.data;
							todayElement = getElement(natal);
							weekElementArray.push(todayElement);
							weekDate.push(todayDate);
							weekSeed.push(seed);
						})
						.catch((err) => {
							res.status(500).send("Fail to get bazi");
						})
				);
				// next day
				today.setDate(today.getDate() + 1);
			}

			Promise.all(promises)
				.then(() => {
					if (!userElement) {
						res.status(500).send("Something broke!");
					}
					let weeklyElement = [];
					// get user element weekly
					weekElementArray.forEach((date) => {
						let sum = userElement.map((userElement, index) => {
							return Number(
								(userElement + date[index]).toFixed(3)
							);
						});
						weeklyElement.push(sum);
					});
					let weeklyColor = [];
					// random color
					weeklyElement.forEach((sumElement, index) => {
						let color = getColor(sumElement, weekSeed[index]);
						weeklyColor.push(color);
					});

					weeklyColor = weeklyColor.map((date, index) => {
						return {
							...date,
							date: weekDate[index],
						};
					});
					weeklyColor.sort((a, b) => {
						return new Date(a.date) - new Date(b.date);
					});
					res.send(weeklyColor);
					// res.send(color)
				})

				.catch((err) => {
					// Calculation fail
					res.status(500).send(err.message);
				});
		})
		.catch((err) => {
			res.status(500).send(err.message);
		});
};

exports.getUserTime = (req, res, next) => {
	let token = req.headers["authorization"];
	let date;
	if (!req.query.date) {
		date = new Date().toISOString().slice(0, 10);
	} else {
		date = req.query.date;
	}
	axios
		.get("/users/profile", {
			headers: {
				Authorization: token,
			},
		})
		.then((response) => {
			let userData = response.data;
			let dateOfBirth = userData.date_of_birth;
			let timeOfBirth = userData.time_of_birth;
			if (timeOfBirth === "") {
				timeOfBirth = "null";
			}
			let promises = [];
			let userZodiac;
			// Fetch user dob / tob
			promises.push(
				axios
					.get(`/calendar/bazi/${dateOfBirth}/${timeOfBirth}`, {
						headers: {
							Authorization: token,
						},
					})
					.then((response) => {
						let natal = response.data;
						userZodiac = natal.year.animal.code;
					})
					.catch((err) => {
						res.status(500).send("Something Broke!");
					})
			);

			let dayDetail;

			// fetch calendar to get date's hour
			promises.push(
				axios
					.get(`/calendar`, {
						headers: {
							Authorization: token,
						},
					})
					.then((response) => {
						let calendar = response.data;
						let today = date;
						dayDetail = calendar.filter((item) => {
							return item.date === today;
						})[0];
					})
					.catch((err) => {
						// res.status(500).send('Something broke!')
					})
			);

			// All API Finish
			Promise.all(promises)
				.then(() => {
					let hour = getHour(dayDetail);
					let goodHourArray = [];
					// find rival zodiac to remove hour later if any
					let badZodiac = zodiacRivalTable[userZodiac];
					let badHour = "hr_" + zodiacTimeTable[badZodiac];
					for (var prop in hour) {
						if (hour.hasOwnProperty(prop)) {
							if (hour[prop] === 1) goodHourArray.push(prop);
						}
					}
					let indexOfBadHour = goodHourArray.indexOf(badHour);
					// if in GoodHourArray Have Rival Hour , Delete it
					if (indexOfBadHour !== -1) {
						goodHourArray.splice(indexOfBadHour, 1);
					}

					// if in GoodHourArray Have FriendshipZodiac, Show FriendshipZodiac
					// find friendship zodiac time
					let goodZodiac = zodiacFriendshipPair[userZodiac];
					let goodHour = "hr_" + zodiacTimeTable[goodZodiac];
					let displayHour;
					// check if goodHour have calculated goodHour -> if so, then display that time
					if (goodHourArray.includes(goodHour)) {
						// display zodiacFriendship time
						displayHour = goodHour;
					} else if (goodHourArray.length > 0) {
						// display most early time
						displayHour = goodHourArray[0];
					} else {
						// if no goodHour
						displayHour = -1;
					}

					// send display time -1 if no goodHour
					let response = {
						display_time: displayHour ? displayHour : -1,
					};

					res.json(response);
				})
				.catch((err) => {
					res.status(500).send(err.message);
				});
		})
		.catch((err) => {
			res.status(500).send(err.message);
		});
};

exports.getBaziGod = (req, res, next) => {
  let date = req.query.date;
	let time = req.query.time;
	if (!req.query.time) {
		time = "null";
	}

	axios.get(`/calendar/bazi/${date}/${time}`).then((response) => {
		let data = response.data;
		res.send(getGodCount(data));
	});
};

exports.getBaziElement = (req, res, next) => {
	let date = req.query.date;
	let time = req.query.time;
	if (typeof req.query.time === "undefined") {
		time = "null";
	}

	axios.get(`/calendar/bazi/${date}/${time}`).then((response) => {
		let data = response.data;
		res.send(getElement(data));
	});
};

exports.getUserColor = (req, res, next) => {
	let token = req.headers["authorization"];
	axios
		.get("/users/profile", {
			headers: {
				Authorization: token,
			},
		})
		.then((response) => {
			let userData = response.data;
			let dateOfBirth = userData.date_of_birth;
			let timeOfBirth = userData.time_of_birth;
			if (timeOfBirth === "") {
				timeOfBirth = "null";
			}
			let promises = [];
			let userElement;
			promises.push(
				axios
					.get(`/calendar/bazi/${dateOfBirth}/${timeOfBirth}`, {
						headers: {
							Authorization: token,
						},
					})
					.then((response) => {
						let natal = response.data;
						userElement = getElement(natal);
					})
					.catch((err) => {
						res.status(500).send("Something Broke!");
					})
			);

			let today = new Date();
			today = today.toISOString().slice(0, 10);
			let todayElement;
			promises.push(
				axios
					.get(`/calendar/bazi/${today}/null`, {
						headers: {
							Authorization: token,
						},
					})
					.then((response) => {
						let natal = response.data;
						todayElement = getElement(natal);
					})
					.catch((err) => {
						res.status(500).send("Something broke!");
					})
			);

			Promise.all(promises)
				.then(() => {
					if (!userElement) {
						res.status(500).send("Something broke!");
					}
					let sum = userElement.map((userElement, index) => {
						return Number(
							(userElement + todayElement[index]).toFixed(3)
						);
					});
					let color = getColor(sum);
					res.send(color);
				})

				.catch((err) => {
					// Calculation fail
					res.status(500).send("Something Broke");
				});
		})
		.catch((err) => {
			// Fail to authorize token
			res.status(401).send();
		});
};

// Helper Function

// calculate color of user missing element
const getColor = (countedElement, seed) => {
	var random = seedrandom(seed);
	// หา index ที่มีธาตุมากที่สุด
	let inauspicious_color = countedElement.indexOf(
		Math.max(...countedElement)
	);
	// หาอินเวอร์ส
	let elementData = countedElement.map((element, index) => {
		return {
			code: index,
			value: (element * 100 - 100) * -1,
		};
	});
	// เรียงจากมากไปน้อย
	elementData = elementData.sort((a, b) => {
		return b.value - a.value;
	});
	// หาผลรวม
	let sum = 0;
	elementData.forEach((data) => {
		sum = sum + data.value;
	});
	// หาอัตราส่วน
	let proportion = sum / 3;
	let result = [];
	// หาธาตุที่ต้องเติม
	for (let i = 0, count = 0; i < elementData.length && count < 3; i++) {
		let n = Math.ceil(elementData[i].value / proportion);
		for (let j = 0; j < n; j++) {
			result.push(elementCode[elementData[i].code].code);
			// เอาแค่ 3 ตัว ถ้ามี 4 ตัว (เวลามีธาตุสองตัวที่ขาดเท่ากัน)
			result.length === 4 ? result.pop() : null;
			count++;
		}
	}

	let range = 0;
	// insert in auspicious color first
	let ans = [inauspiciousColor[inauspicious_color]];
	result.map((code) => {
		range += Math.floor(random() * colorTable[code].length);
		// if color is duplicate
		if (ans.includes(colorTable[code][range % colorTable[code].length])) {
			// re-roll until color is not duplicate
			while (
				ans.includes(colorTable[code][range % colorTable[code].length])
			) {
				range += Math.floor(random() * colorTable[code].length);
			}
		}

		ans.push(colorTable[code][range % colorTable[code].length]);

		return colorTable[code][range % colorTable[code].length];
	});

	let color = {
		inauspicious_color_1: ans[0],
		auspicious_color_1: ans[1],
		auspicious_color_2: ans[2],
		auspicious_color_3: ans[3],
	};

	return color;
};

// count each god in natal chart
const getGodCount = (natal) => {
	let godCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

	// Calculation method
	// : Count every god in natal chart
	// ps. the day column have no god except hidden stem
	// day column have no god
	// god list (for debug)
	// 1,正印,DR,Direct Resource
	// 2,偏印,IR,Indirect Resource
	// 3,正官,DO,Direct Officer
	// 4,七殺,SK,Seven Killings
	// 5,正财,DW,Direct Wealth
	// 6,偏财,IW,Indirect Wealth
	// 7,伤官,HO,Hurting Officer
	// 8,食神,EG,Eating God
	// 9,劫财,RW,Rob Wealth
	// 10,比肩,F,Friend
	let haveHour = natal.hour.animal.code === 0 ? false : true;
	if (haveHour === true) {
		godCount[natal.hour.god.code]++;
	}
	godCount[natal.month.god.code]++;
	godCount[natal.year.god.code]++;
	if (haveHour === true) {
		natal.hour.hidden_stem.forEach((hour) => {
			godCount[hour.god.code]++;
		});
	}
	natal.day.hidden_stem.forEach((day) => {
		godCount[day.god.code]++;
	});
	natal.month.hidden_stem.forEach((month) => {
		godCount[month.god.code]++;
	});
	natal.year.hidden_stem.forEach((year) => {
		godCount[year.god.code]++;
	});
	godCount = godCount.map((element) =>
		parseFloat((element / Math.max(...godCount)).toFixed(3))
	);
	return godCount;
};

// calculate user element -> return array of element
const getElement = (natal) => {
	let percentArray = [0, 0, 0, 0, 0];

	// Calculation method
	// : the top 8 table (heavenly, earthly) is count as 10 percent per slot (cap 80 %)
	// : the lower (hidden stem) is max 5 percent per slot (cap 20 % ) calculate by 5 / number of hidden stem
	// Check if Natal Chart have Hour (animal.code = 0 mean there is no data )
	let haveHour = natal.hour.animal.code === 0 ? false : true;
	if (haveHour === true) {
		percentArray[natal.hour.heaven_element.code % 5] += 10;
	}
	percentArray[natal.day.heaven_element.code % 5] += 10;
	percentArray[natal.month.heaven_element.code % 5] += 10;
	percentArray[natal.year.heaven_element.code % 5] += 10;

	if (haveHour === true) {
		percentArray[natal.hour.earth_element.code % 5] += 10;
	}
	percentArray[natal.day.earth_element.code % 5] += 10;
	percentArray[natal.month.earth_element.code % 5] += 10;
	percentArray[natal.year.earth_element.code % 5] += 10;

	if (haveHour === true) {
		let computedCap = getCap(natal.hour.hidden_stem);
		natal.hour.hidden_stem.forEach((hour) => {
			percentArray[hour.element.code % 5] += computedCap;
		});
	}
	computedCap = getCap(natal.day.hidden_stem);
	natal.day.hidden_stem.forEach((day) => {
		percentArray[day.element.code % 5] += computedCap;
	});
	computedCap = getCap(natal.month.hidden_stem);
	natal.month.hidden_stem.forEach((month) => {
		percentArray[month.element.code % 5] += computedCap;
	});
	computedCap = getCap(natal.year.hidden_stem);
	natal.year.hidden_stem.forEach((year) => {
		percentArray[year.element.code % 5] += computedCap;
	});

	return percentArray;
};

const getCap = (hiddenStemArray) => {
	return Number((5 / hiddenStemArray.length).toFixed(3));
};

const getHour = (dayDetail) => {
	// Prior early morning and onward
	// Order matter
	return {
		hr_5: dayDetail.hr_5,
		hr_7: dayDetail.hr_7,
		hr_9: dayDetail.hr_9,
		hr_11: dayDetail.hr_11,
		hr_13: dayDetail.hr_13,
		hr_15: dayDetail.hr_15,
		hr_17: dayDetail.hr_17,
		hr_19: dayDetail.hr_19,
		hr_21: dayDetail.hr_21,
		hr_23: dayDetail.hr_23,
		hr_1: dayDetail.hr_1,
		hr_3: dayDetail.hr_3,
	};
};
