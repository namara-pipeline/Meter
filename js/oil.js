const canvas = document.getElementById("meter");
const ctx = canvas.getContext("2d");
const barInput = document.getElementById("barInput");
const meterColorSelect = document.getElementById("meterColor");
const bgColorSelect = document.getElementById("bgColor");

// 色選択
const colors = [
  "#ffffff", // 100%
  "#e6e6e6", // 90%
  "#cccccc", // 80%
  "#b3b3b3", // 70%
  "#999999", // 60%
  "#808080", // 50%
  "#666666", // 40%
  "#4d4d4d", // 30%
  "#333333", // 20%
  "#1a1a1a", // 10%
  "#000000"  // 0%
];

// コンボボックスへ選択肢を追加
function populateColorSelectors() {
    colors.forEach(color => {
        let opt1 = document.createElement("option");
        opt1.value = color;
        opt1.textContent = color;
        meterColorSelect.appendChild(opt1);

        let opt2 = document.createElement("option");
        opt2.value = color;
        opt2.textContent = color;
        bgColorSelect.appendChild(opt2);
    });
    // 初期値
    meterColorSelect.value = "#ffffff";
    bgColorSelect.value = "#e6e6e6";
}
populateColorSelectors();

// 背景色更新
function updateBackgroundColor() {
  document.body.style.backgroundColor = bgColorSelect.value;
}
bgColorSelect.addEventListener("change", function(){
  updateBackgroundColor();
  drawMeter(parseFloat(barInput.value));
});
updateBackgroundColor();

// キャンバスのリサイズ
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
resizeCanvas();

// メモリの角度設定
// メモリ（0～100）の表示は 240度
// ギャップは 120度（360 - 240）
const startAngle = 240; // 油圧 0 のときの角度
const sweepAngle = 240; // 0～100 に対応する角度幅

// メーター描画
function drawMeter(oilVal) {
    // 入力値の補正：NaN や空欄 → 0、100 超は 100 に
    if (isNaN(oilVal)) { oilVal = 0; }
    if (oilVal < 0) { oilVal = 0; }
    if (oilVal > 100) { oilVal = 100; }
  
    const cw = canvas.width, ch = canvas.height;
    const cx = cw / 2, cy = ch / 2;
    const r = Math.min(cw, ch) * 0.45;  // メーター円の半径
  
    ctx.clearRect(0, 0, cw, ch);

    // 外円（メーター本体）：内部は選択中のメーター色、外枠は黒
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = meterColorSelect.value;
    ctx.fill();
    ctx.lineWidth = 16;
    ctx.strokeStyle = "black";
    ctx.stroke();

    // 目盛の描画
    // メモリ（0～100）の各値について、startAngle から sweepAngle 分割
    for (let val = 0; val <= 100; val += 2) {
        let meterAngle = startAngle + (val / 100) * sweepAngle;
        meterAngle = meterAngle % 360;
        const angle = (meterAngle - 90) * Math.PI / 180;
        
        // 外周上の点
        const xOuter = cx + r * Math.cos(angle);
        const yOuter = cy + r * Math.sin(angle);
        
        // 目盛線の長さ（val の値に応じて変更）
        let tickLen;
        if (val % 20 === 0) {
            tickLen = r * 0.2;
        } else if (val % 10 === 0) {
           tickLen = r * 0.15;
        } else {
            tickLen = r * 0.10;
        }
        const xInner = cx + (r - tickLen) * Math.cos(angle);
        const yInner = cy + (r - tickLen) * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(xOuter, yOuter);
        ctx.lineTo(xInner, yInner);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke();
        
        // 主目盛（20 単位）の場合、数値を描画
        if (val % 20 === 0) {
            // 数値の表示位置：内側にさらに少し離して配置
            const textR = r - tickLen - 30;
            const xText = cx + textR * Math.cos(angle);
            const yText = cy + textR * Math.sin(angle);
            ctx.fillStyle = "black";
            // 数値フォントサイズ
            ctx.font = "bold 40px Meiryo, 'メイリオ', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(val.toString(), xText, yText);
        }
    }

    // 赤針の描画（回転軸は中心、針全体の比率8:2）
    // 針の角度：油圧 0→ startAngle、油圧100→ startAngle+sweepAngle（mod 360）
    let needleMeterAngle = startAngle + (oilVal / 100) * sweepAngle;
    needleMeterAngle = needleMeterAngle % 360;
    const theta = (needleMeterAngle - 90) * Math.PI / 180;

    // 針の全長 L を、メーター直径の90%（＝1.8r）となるように設定
    // 先端部分 = 60% L, 後方部分 = 40% L なので L = 1.8r * 0.6 = 1.08r
    const L = r * 1.08;
    // 針先（中心から先端方向 0.8L = 1.8r）
    const tipX = L * 0.8;
    const tipY = 0;
    // 針後端（中心から後方方向 -0.2L = -0.45r）
    const backX = -L * 0.2;
    // 針の後端左右の幅（適宜調整、ここでは L の5%）
    const w = L * 0.05;
    const backTop = { x: backX, y: -w };
    const backBottom = { x: backX, y: w };

    // 回転関数：(x,y) を theta だけ回転
    function rotatePoint(x, y, theta) {
        return {
        x: x * Math.cos(theta) - y * Math.sin(theta),
        y: x * Math.sin(theta) + y * Math.cos(theta)
        };
    }
  
    const tipRot = rotatePoint(tipX, tipY, theta);
    const backTopRot = rotatePoint(backTop.x, backTop.y, theta);
    const backBottomRot = rotatePoint(backBottom.x, backBottom.y, theta);

    ctx.beginPath();
    ctx.moveTo(cx + tipRot.x, cy + tipRot.y);
    ctx.lineTo(cx + backTopRot.x, cy + backTopRot.y);
    ctx.lineTo(cx + backBottomRot.x, cy + backBottomRot.y);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();

    // 赤針の回転軸を示す赤丸（半径16px）
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();

    // --- 「Bar」文字の描画 ---
    // メモリのない部分は 360° - 240° = 120°。ここでは、ギャップを
    // メーター上の 120°～240°（中央 180°）とするので、ラベルは 180° の位置に配置
    const labelAngle = 180; // 度
    const labelCanvasAngle = (labelAngle - 90) * Math.PI / 180;
    const labelR = r * 0.70;
    const xLabel = cx + labelR * Math.cos(labelCanvasAngle);
    const yLabel = cy + labelR * Math.sin(labelCanvasAngle);
    ctx.fillStyle = "black";
    // フォントサイズ
    ctx.font = "bold 40px Meiryo, 'メイリオ', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Bar", xLabel, yLabel);

    // --- LED 表示（ラベル"Bar"の上、左右に配置） ---
    // LED の位置はラベルの y 座標から -30px、左右に ±20px
    const ledY = yLabel - 30;
    const ledOffsetX = 20;
    const ledRadius = 8;
    let greenOn = false, redOn = false;
    if(oilVal >= 20 && oilVal < 80) {
        greenOn = true;
    } else if(oilVal >= 80) {
        redOn = true;
    }
    // 左 LED（緑）
    ctx.beginPath();
    ctx.arc(xLabel - ledOffsetX, ledY, ledRadius, 0, 2 * Math.PI);
    ctx.fillStyle = greenOn ? "limegreen" : "#ccc";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    // 右 LED（赤）
    ctx.beginPath();
    ctx.arc(xLabel + ledOffsetX, ledY, ledRadius, 0, 2 * Math.PI);
    ctx.fillStyle = redOn ? "red" : "#ccc";
    ctx.fill();
    ctx.stroke();
}

// 初回描画
drawMeter(parseFloat(barInput.value));

// 各種イベント
// 入力欄：数値変更時（blur または Enter）に補正して再描画
barInput.addEventListener("change", function(){
    let val = parseFloat(barInput.value);
    if(isNaN(val)) { val = 0; }
    if(val > 100) { val = 100; }
    barInput.value = val;
    drawMeter(val);
});

// ウィンドウサイズ変更時：キャンバスリサイズ後に再描画
window.addEventListener("resize", function(){
    resizeCanvas();
    let val = parseFloat(barInput.value);
    drawMeter(val);
});

// メーター色変更時：再描画
meterColorSelect.addEventListener("change", function(){
    drawMeter(parseFloat(barInput.value));
});
