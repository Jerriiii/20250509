// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY, circleRadius = 50; // 圓的初始位置與半徑
let isDragging = false;

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);

  // 初始化圓的位置
  circleX = width / 2;
  circleY = height / 2;
}

function draw() {
  image(video, 0, 0);

  // 繪製中央的圓形
  fill(0, 0, 255, 150);
  noStroke();
  circle(circleX, circleY, circleRadius * 2);

  // 確保至少檢測到一隻手
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 繪製手指上的圓與線條
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];
          fill(255, 0, 0);
          noStroke();
          circle(keypoint.x, keypoint.y, 10);
        }

        // 繪製手指的線條
        drawFingerLines(hand, 5, 8);  // 食指
        drawFingerLines(hand, 9, 12); // 中指
        drawFingerLines(hand, 13, 16); // 無名指
        drawFingerLines(hand, 17, 20); // 小指

        // 串接 keypoints 5 到 8
        for (let i = 5; i < 8; i++) {
          let kp1 = hand.keypoints[i];
          let kp2 = hand.keypoints[i + 1];
          stroke(0, 255, 0);
          strokeWeight(2);
          line(kp1.x, kp1.y, kp2.x, kp2.y);
        }

        // 獲取食指與大拇指的座標
        let indexFinger = hand.keypoints[8];
        let thumb = hand.keypoints[4];

        // 檢查食指與大拇指是否同時碰觸圓的邊緣
        let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        let dThumb = dist(thumb.x, thumb.y, circleX, circleY);
        if (dIndex < circleRadius && dThumb < circleRadius) {
          isDragging = true;
        }

        // 如果正在拖動，讓圓跟隨手指移動
        if (isDragging) {
          circleX = (indexFinger.x + thumb.x) / 2; // 圓心移動到兩指之間
          circleY = (indexFinger.y + thumb.y) / 2;
        }
      }
    }
  }

  // 停止拖動
  if (!hands.some(hand => {
    let indexFinger = hand.keypoints[8];
    let thumb = hand.keypoints[4];
    let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
    let dThumb = dist(thumb.x, thumb.y, circleX, circleY);
    return dIndex < circleRadius && dThumb < circleRadius;
  })) {
    isDragging = false;
  }
}

// 繪製手指的線條函式
function drawFingerLines(hand, startIdx, endIdx) {
  for (let i = startIdx; i < endIdx; i++) {
    let kp1 = hand.keypoints[i];
    let kp2 = hand.keypoints[i + 1];
    stroke(0, 255, 0);
    strokeWeight(2);
    line(kp1.x, kp1.y, kp2.x, kp2.y);
  }
}
