// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY, circleRadius = 50; // 圓的初始位置與半徑
let isDragging = false;
let previousX = null;
let previousY = null;
let circleColor = [0, 0, 255, 150]; // 初始圓的顏色為藍色
let trajectory = []; // 用於存儲軌跡的陣列

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

  // 畫出已存儲的軌跡
  strokeWeight(2);
  stroke(255, 0, 0); // 紅色線條
  for (let i = 1; i < trajectory.length; i++) {
    let prev = trajectory[i - 1];
    let curr = trajectory[i];
    line(prev.x, prev.y, curr.x, curr.y);
  }

  // 繪製中央的圓形
  fill(circleColor);
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
        drawFingerLines(hand, 0, 4);  // 大拇指
        drawFingerLines(hand, 5, 8);  // 食指
        drawFingerLines(hand, 9, 12); // 中指
        drawFingerLines(hand, 13, 16); // 無名指
        drawFingerLines(hand, 17, 20); // 小指

        // 獲取食指與大拇指的座標
        let indexFinger = hand.keypoints[8];
        let thumb = hand.keypoints[4];

        // 檢查食指與大拇指是否同時碰觸圓的邊緣
        let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        let dThumb = dist(thumb.x, thumb.y, circleX, circleY);
        if (dIndex < circleRadius && dThumb < circleRadius) {
          isDragging = true;

          // 畫出圓心的軌跡並存儲
          if (previousX !== null && previousY !== null) {
            trajectory.push({ x: circleX, y: circleY });
          }
          previousX = circleX;
          previousY = circleY;

          // 更新圓心位置
          circleX = (indexFinger.x + thumb.x) / 2; // 圓心移動到兩指之間
          circleY = (indexFinger.y + thumb.y) / 2;
        }
      }
    }
  }

  // 停止拖動並清除軌跡
  if (!hands.some(hand => {
    let indexFinger = hand.keypoints[8];
    let thumb = hand.keypoints[4];
    let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
    let dThumb = dist(thumb.x, thumb.y, circleX, circleY);
    return dIndex < circleRadius && dThumb < circleRadius;
  })) {
    isDragging = false;
    previousX = null;
    previousY = null;
    trajectory = []; // 清除軌跡
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
