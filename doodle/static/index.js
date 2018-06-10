var canvas = document.getElementById("cnv");
var ctx = canvas.getContext("2d");

var nn, training, testing;
var data = [];
var apples = {},
  cats = {},
  flipflops = {},
  pants = {},
  scissors = {};

const types = ["apples", "cats", "flipflops", "pants", "scissors"];
const size = 784;
const total_data = 1000;
const APPLE = 0,
  CAT = 1,
  FLIPFLOP = 2,
  PANT = 3,
  SCISSOR = 4;


function prepareData(byteArray, label) {
  var type = {};
  type.training = [];
  type.testing = [];
  for (let j = 0; j < total_data; j++) {
    let offset = j * size;
    let threshold = Math.floor(0.8 * total_data)
    if (j < 800) {
      type.training[j] = byteArray.slice(offset, offset + size)
      type.training[j].label = label;
    } else {
      type.testing[j - threshold] = byteArray.slice(offset, offset + size)
      type.testing[j - threshold].label = label
    }
  }
  return type;
}


function train(nn, training) {

  //TRAINING NN

  for (let l = 0; l < training.length; l++) {

    let data = training[l]
    let inputs = [];
    for (let m = 0; m < data.length; m++) {
      inputs[m] = data[m] / 255.0;
    }

    let label = data.label;
    let targets = [0, 0, 0, 0, 0]
    targets[label] = 1;
    //           console.log(inputs)
    //           console.log(targets)
    nn.train(inputs, targets)


  }
}

function testAll(nn, testing) {
  var correct = 0;
  for (let l = 0; l < testing.length; l++) {

    let data = testing[l]
    let inputs = [];
    for (let m = 0; m < data.length; m++) {
      inputs[m] = data[m] / 255.0;
    }

    let label = data.label;
    let guess = nn.predict(inputs)
    guess = guess.indexOf(_.max(guess))

    
    if (guess === label) {
      correct++;
    }
    console.log(types[guess])
  }

  var efficiency = correct / testing.length;
  console.log("Percent: " + efficiency)
  
}
function testOne(nn, testing){
  
    
    let inputs = [];
    for (let m = 0; m < testing.length; m++) {
      inputs[m] = testing[m] / 255.0;
    }
    let guess = nn.predict(inputs)
    guess = guess.indexOf(_.max(guess))

    return(types[guess])
}

//LOAD BINARIES
var oReq = []
for (let i = 0; i < types.length; i++) {
  oReq[i] = new XMLHttpRequest();
  oReq[i].open("GET", types[i] + "1000.bin", true);
  oReq[i].responseType = "arraybuffer";

  oReq[i].onload = function(oEvent) {
    var arrayBuffer = oReq[i].response; // Note: not oReq.responseText
    if (arrayBuffer) {
      var byteArray = new Uint8Array(arrayBuffer);
      data.push(byteArray)
      if (data.length == types.length) {

        //ALL BINARIES LOADED - PREP DATA
        apples = prepareData(data[0], APPLE)
        cats = prepareData(data[1], CAT)
        flipflops = prepareData(data[2], FLIPFLOP)
        pants = prepareData(data[3], PANT)
        scissors = prepareData(data[4], SCISSOR)

        //MAKING NN
        nn = new NeuralNetwork(784, 64, 5)


        //TRAINING NN
        training = []
        training = training.concat(apples.training)
        training = training.concat(cats.training)
        training = training.concat(flipflops.training)
        training = training.concat(pants.training)
        training = training.concat(scissors.training)
        shuffle(training)

        

        //TESTING NN 
        testing = [];
        testing = testing.concat(apples.testing)
        testing = testing.concat(cats.testing)
        testing = testing.concat(flipflops.testing)
        testing = testing.concat(pants.testing)
        testing = testing.concat(scissors.testing)



        //train(nn, training);
        //console.log("trained an epoch")
        //testAll(nn, testing)

      }
    }
  };

  oReq[i].send(null);
}



//auxiliary methods

function scaleImageData(imageData, scale) {
  var scaled = ctx.createImageData(imageData.width * scale, imageData.height * scale);

  for(var row = 0; row < imageData.height; row++) {
    for(var col = 0; col < imageData.width; col++) {
      var sourcePixel = [
        imageData.data[(row * imageData.width + col) * 4 + 0],
        imageData.data[(row * imageData.width + col) * 4 + 1],
        imageData.data[(row * imageData.width + col) * 4 + 2],
        imageData.data[(row * imageData.width + col) * 4 + 3]
      ];
      for(var y = 0; y < scale; y++) {
        var destRow = row * scale + y;
        for(var x = 0; x < scale; x++) {
          var destCol = col * scale + x;
          for(var i = 0; i < 4; i++) {
            scaled.data[(destRow * scaled.width + destCol) * 4 + i] =
              sourcePixel[i];
          }
        }
      }
    }
  }

  return scaled;
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

//button event handlers
document.getElementById("train").addEventListener("click", function(){
  train(nn, training);
  console.log("trained epoch")
});

document.getElementById("test").addEventListener("click", function(){
  //testAll(nn, testing)
  var oldData = ctx.getImageData(0,0,28,28);
  var newData = scaleImageData(oldData, 1) // 280x280 => 28x28

  var inputs = [];
  
  for(let n = 0; n < size; n++){
    var sub = 1;
    if(n === 0){
      sub = 0;
    }
    
    inputs[n] = oldData.data[n*4 - sub];
  }
  
  var guess = testOne(nn,inputs);
  console.log(guess)
  console.log("Tested Picture")
});


//  //visualization
//      var total = 100
//         for (let n = 0; n < total; n++) {
//           var imgData = ctx.createImageData(28, 28);
//           var offset = n * size;
//           for (var k = 0; k < size; k++) {
//             let val = 255 - data[4][k + offset]
//             imgData.data[k * 4 + 0] = val;
//             imgData.data[k * 4 + 1] = val;
//             imgData.data[k * 4 + 2] = val;
//             imgData.data[k * 4 + 3] = 255;
//           }
//           let x = (n % 10) * 28;
//           let y = Math.floor(n / 10) * 28;
//           ctx.putImageData(imgData, x, y);

//         }