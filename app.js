const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(bodyParser.json());
app.use(cors());

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

// calculate god bazi
app.get("/bazi-god", (req, res, next) => {
  let date = req.query.date;
  let time = req.query.time;
  let haveHour = 1;
  if (!req.query.time) {
    time = "null";
  }
  axios
    .get(`http://35.187.245.238:5101/api/bazi/${date}/${time}`)
    .then((response) => {
      let data = response.data;
      res.send(getGodCount(data));
    });
});

// calculate 5 structure
app.get("/bazi-element", (req, res, next) => {
  let date = req.query.date;
  let time = req.query.time;
  let haveHour = 1;
  if (typeof req.query.time === 'undefined') {
    time = "null";
    haveHour = 0;
  }
  
  axios
    .get(`http://35.187.245.238:5101/api/bazi/${date}/${time}`)
    .then((response) => {
      let data = response.data;
      res.send(getElement(data));
    });
    
});

// calculate daily personalise color of user
app.get("/get-user-color", (req, response, next) => {
  let userID = req.query.user_id;
  axios
    .get(`http://35.187.245.238:5102/api/admin/users/${userID}`)
    .then(res => {
      let userData = res.data;
      let dateOfBirth = userData.date_of_birth;
      let timeOfBirth = userData.time_of_birth;
      let haveHour = 1;
      if (timeOfBirth === "") {
        timeOfBirth = "null";
        haveHour = 0
      }
      let promises = [];
      let userElement
      promises.push(
        axios
        .get(`http://35.187.245.238:5101/api/bazi/${dateOfBirth}/${timeOfBirth}`)
        .then(response => {
          let natal = response.data;
          userElement = getElement(natal);
        })
        .catch(err => {
          // console.log(err)
          // response.status(500).send('Something broke!')
        })
      );

      let today = new Date();
      today = today.toISOString().slice(0, 10);
      let todayElement

      promises.push(
        axios.get(`http://35.187.245.238:5101/api/bazi/${today}/null`)
        .then(response => {
          let natal = response.data;
          todayElement = getElement(natal)
        })
        .catch(err => {
          // console.log(err)
          // response.status(500).send('Something broke!')
        })
      );

    Promise.all(promises).then(() => {
      if(!userElement){
        response.status(500).send('Something broke!')
      }
      let sum = userElement.map( (userElement, index) => {
        return Number((userElement + todayElement[index]).toFixed(3));
      });
      let color = getColor(sum);
      response.send(color)
    })
    .catch(err => {
      // console.log(err)
      // response.status(500).send('Something broke!')
    });
    })
    .catch(err => {
      console.log(err)
      response.status(500).send('Something broke!')
    });
    
});


// count hidden stem of bazi table (hour / day / month / year )
const getCap = (hiddenStemArray) => {
  return Number((5 / hiddenStemArray.length).toFixed(3));
};

// calculate color of user missing element
const getColor = (countedElement) => {
  // หา index ที่มีธาตุมากที่สุด
	let inauspicious_color = countedElement.indexOf(Math.max(...countedElement));
  console.log(countedElement)
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
  let ans = [inauspiciousColor[inauspicious_color]]
  let a = result.map(code => {
    range += Math.floor(Math.random() * colorTable[code].length);
    // if color is duplicate
    if(ans.includes(colorTable[code][range % colorTable[code].length])){
      // re-roll until color is not duplicate
      while(ans.includes(colorTable[code][range % colorTable[code].length])){
        range += Math.floor(Math.random() * colorTable[code].length);
      }
    }

    ans.push(colorTable[code][range % colorTable[code].length])

    return  colorTable[code][range % colorTable[code].length] 
    
  })

  let color = {
    inauspicious_color_1: ans[0],
    auspicious_color_1: ans[1],
    auspicious_color_2: ans[2],
    auspicious_color_3: ans[3]
  }

  return color

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

app.use("/", (req, res, next) => {
  res.send("no page found");
  next();
});

app.listen(3000);

console.log("server is started")