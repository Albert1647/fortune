// Document on google sheet : Auxiliary NumEiang App
// Year Code
const zodiacRivalTable = {
	1: 7,
	2: 8,
	3: 9,
	4: 10,
	5: 11,
	6: 12,
	7: 1,
	8: 2,
	9: 3,
	10: 4,
	11: 5,
	12: 6,
};

const zodiacTimeTable = {
	1: 23,
	2: 1,
	3: 3,
	4: 5,
	5: 7,
	6: 9,
	7: 11,
	8: 13,
	9: 15,
	10: 17,
	11: 19,
	12: 21,
};

const zodiacFriendshipPair = {
	1: 2,
	2: 1,
	3: 12,
	4: 11,
	5: 10,
	6: 9,
	7: 8,
	8: 7,
	9: 6,
	10: 5,
	11: 4,
	12: 3,
};

// Parse element code
const elementCode = [
	{ name: "earth", code: 0 },
	{ name: "wood", code: 1 },
	{ name: "fire", code: 2 },
	{ name: "metal", code: 3 },
	{ name: "water", code: 4 },
];
// ตารางสีของธาตุ
const colorTable = {
	0: [1, 4, 16, 12, 15, 13, 8, 7],
	1: [3, 8, 16, 11, 2, 7],
	2: [1, 6, 16, 15, 2, 8],
	3: [1, 5, 11, 2, 9, 16, 7],
	4: [1, 2, 11, 14, 8, 7, 13],
};

const inauspiciousColor = [2, 1, 11, 8, 16];


module.exports = {
    zodiacRivalTable,
    zodiacTimeTable,
    zodiacFriendshipPair,
    elementCode,
    colorTable,
    inauspiciousColor
}