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

const inauspiciousTable = {
	0: [2, 6, 7, 10, 1], 
	1: [1, 7, 10, 5, 9], 
	2: [11, 2, 9, 10, 14],
	3: [8, 15, 16, 6, 14],
	4: [16, 15, 4, 12, 1]
};

// colorList for reference
// const colorList = [
// 	{ text: "ขาว", color: "#ffffff", code: 1 },
// 	{ text: "เขียว", color: "#28bf7a", code: 2 },
// 	{ text: "เขียวเข้ม", color: "#396752", code: 3 },
// 	{ text: "ครีม", color: "#ebd3be", code: 4 },
// 	{ text: "เงิน", color: "#f8f5f5", code: 5 },
// 	{ text: "ชมพู", color: "#ffadca", code: 6 },
// 	{ text: "ดำ", color: "#000000", code: 7 },
// 	{ text: "แดง", color: "#ba000d", code: 8 },
// 	{ text: "ทอง", color: "#f8f5f5", code: 9 },
// 	{ text: "เทา", color: "#909090", code: 10 },
// 	{ text: "น้ำเงิน", color: "#0a2c99", code: 11 },
// 	{ text: "น้ำตาล", color: "#ad7764", code: 12 },
// 	{ text: "ฟ้า", color: "#58a5ff", code: 13 },
// 	{ text: "ม่วง", color: "#996cbf", code: 14 },
// 	{ text: "ส้ม", color: "#f47036", code: 15 },
// 	{ text: "เหลือง", color: "#ffba00", code: 16 },
// ];


module.exports = {
    zodiacRivalTable,
    zodiacTimeTable,
    zodiacFriendshipPair,
    elementCode,
    colorTable,
	inauspiciousTable
}