const fs = require('fs') //Módulo nativo FileSystem do node.js para leitura e escrita em disco
const csv = require('csvtojson') //Módulo de conversão de aquivo .csv para Object JSON
const g = Math.pow(9.8, 2) //Constante gravitacional

const file1 = process.argv[2] //Nome do primeiro arquivo csv - Deve ser passado como o primeiro parâmetro
const file2 = process.argv[3] //Nome do segundo arquivo csv - Deve ser passado como o segundo parâmetro
const outputFile = process.argv[4] //Nome do arquivo de saida sendo passado como 3º parâmetro

let finalJSON //Variável final com todas informações serializadas

//Inicia a aplicacao
readFile1()

// Função que retorna a velocidade do dinossauro definido por cáculo, recebe como parâmetro o "comprimento do passo" e o "tamanho da perna"
function calcSpeed(STRIDE_LENGTH, LEG_LENGTH) {
  return ((STRIDE_LENGTH / LEG_LENGTH) - 1) * Math.sqrt(LEG_LENGTH * g)
}

//Leitura do arquivo inicial
function readFile1() {
  //Define variável para iniciar um array em JSON
  let jsonFile = []
  csv()
    .fromFile(file1)
    .on('json', (jsonObj, rowIndex) => {
      //Define velocidade zerada para todos objetos, para que em caso de informações desalinhadas não erre o cálculo
      jsonObj.SPEED = 0
      //Adiciona cada linha do arquivo json como um ítem do array
      jsonFile.push(jsonObj)
    })
    .on('done', (error) => {
      //Ao concluir a leitura do primeiro arquivo ele chama a função complementar
      readFile2(jsonFile)
    })
}

//Leitura do arquivo incremental, recebe como parâmetro o JSON convertido do primeiro arquivo
function readFile2(jsonFile) {
  csv()
    .fromFile(file2)
    .on('json', (jsonObj, rowIndex) => {
      //Define que o dinossauro não existe
      hasDino = false
      jsonFile.forEach((element) => {
        //Verifica se o dinossauro já existe
        if (element.NAME === jsonObj.NAME) {
          //Define que o dinossauro já existe e adiciona as informações complementares
          element.STRIDE_LENGTH = jsonObj.STRIDE_LENGTH
          element.STANCE = jsonObj.STANCE
          element.SPEED = calcSpeed(jsonObj.STRIDE_LENGTH, element.LEG_LENGTH)
          hasDino = true
        }
      })
      if (!hasDino) {
        //Define que o dinossauro da segunda lista não existe na primeira e inclui com as informações existentes
        jsonObj.SPEED = 0
        jsonFile.push(jsonObj)
      }
    })
    .on('done', (error) => {
      //Ao finalizar a leitura do segundo arquivo ele faz todos os calculos
      //Organiza o JSON por ordem de velocidade do maior para o menor
      finalJSON = jsonFile.sort((a, b) => { return (a.SPEED < b.SPEED) ? 1 : ((b.SPEED < a.SPEED) ? -1 : 0) })
      
      //Define a variável para gravar em disco
      let bipedalSpeedOrder = ''

      //Separa somente os dinossauros bípedes que tenham velocidade definida
      finalJSON.forEach((element) => {
        if (element.SPEED > 0 && element.STANCE == 'bipedal') {
          bipedalSpeedOrder += `${element.NAME}\n`
        }
      })

      //Imprime em arquivo com o nome definido por parâmetro apenas os nomes dos dinossauros bípedes do mais rápido ao mais lento.
      //Não imprime qualquer outra informação (Incluindo informações incosistentes, já que não pode ser definido se é mais rápido ou mais lento sem ter todas informações)
      fs.writeFile(outputFile, bipedalSpeedOrder, (err) => {
        if (err) throw err
        // Informa via console se ocorreu tudo certo
        console.log(`Arquivo ${outputFile} gravado com sucesso!`)
      })
    })
}