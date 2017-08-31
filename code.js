const fs = require('fs')
const csv = require('csvtojson')
const g = Math.pow(9.8, 2) //constante gravitacional
const outputFile = fs.createWriteStream('output.txt')
let finalJSON

function readFile1() {
  let jsonFile1 = []
  csv({
    ignoreEmpty: true
  })
    .fromFile('dataset1.csv')
    .on('json', (jsonObj, rowIndex) => {
      jsonObj.SPEED = 0
      jsonFile1.push(jsonObj)
    })
    .on('done', (error) => {
      readFile2(jsonFile1)
    })
}

function readFile2(jsonFile) {
  let jsonFile2
  csv()
    .fromFile('dataset2.csv')
    .on('json', (jsonObj, rowIndex) => {
      hasDino = false
      jsonFile.forEach(function (element) {
        if (element.NAME === jsonObj.NAME) {
          element.STRIDE_LENGTH = jsonObj.STRIDE_LENGTH
          element.STANCE = jsonObj.STANCE
          element.SPEED = ((jsonObj.STRIDE_LENGTH / element.LEG_LENGTH) - 1) * Math.sqrt(element.LEG_LENGTH * g)
          hasDino = true
        }
      }, this)
      if (!hasDino) {
        jsonObj.SPEED = 0
        jsonFile.push(jsonObj)
      }
    })
    .on('done', (error) => {
      finalJSON = jsonFile.sort(function (a, b) { return (a.SPEED < b.SPEED) ? 1 : ((b.SPEED < a.SPEED) ? -1 : 0) })
      let bipedalSpeedOrder = ''
      finalJSON.forEach(function (element) {
        if (element.SPEED > 0 && element.STANCE == 'bipedal') {
          bipedalSpeedOrder += `${element.NAME}\n`
        }
      })
      fs.writeFileSync('output.txt', bipedalSpeedOrder)
    })
}

readFile1()