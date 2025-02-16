window.addEventListener('DOMContentLoaded', function() {
    // 設定時刻のコンボボックスを初期化
    const setHour = document.getElementById('setHour');
    const setMinute = document.getElementById('setMinute');
    const setSecond = document.getElementById('setSecond');
    for (let i = 0; i < 24; i++) {
        let val = i < 10 ? '0' + i : '' + i;
        let opt = document.createElement('option');
        opt.value = val;
        opt.text = val;
        setHour.appendChild(opt);
    }
    for (let i = 0; i < 60; i++) {
        let val = i < 10 ? '0' + i : '' + i;
        let optM = document.createElement('option');
        optM.value = val;
        optM.text = val;
        setMinute.appendChild(optM);
        let optS = document.createElement('option');
        optS.value = val;
        optS.text = val;
        setSecond.appendChild(optS);
    }

    // 背景色・文字盤の明るさのコンボボックスを初期化
    const bgBrightness = document.getElementById('bgBrightness');
    const clockBrightness = document.getElementById('clockBrightness');
    for (let i = 0; i <= 100; i += 10) {
        let text = i + '%';
        let optBg = document.createElement('option');
        optBg.value = i;
        optBg.text = text;
        bgBrightness.appendChild(optBg);
        let optClock = document.createElement('option');
        optClock.value = i;
        optClock.text = text;
        clockBrightness.appendChild(optClock);
    }
    // 初期設定
    bgBrightness.value = 100;
    clockBrightness.value = 100;
    updateBackgroundBrightness();
    updateClockBrightness();

    // 明るさ変更時の処理
    bgBrightness.addEventListener('change', updateBackgroundBrightness);
    clockBrightness.addEventListener('change', updateClockBrightness);

    // ラジオボタン切替で設定時刻の入力欄表示を制御
    const currentRadio = document.getElementById('current');
    const setRadio = document.getElementById('set');
    const setTimeControls = document.getElementById('setTimeControls');
    setTimeControls.style.display = setRadio.checked ? 'block' : 'none';

    currentRadio.addEventListener('change', function() {
        if (currentRadio.checked) {
            setTimeControls.style.display = 'none';
        }
    });
    setRadio.addEventListener('change', function() {
        if (setRadio.checked) {
            setTimeControls.style.display = 'block';
        }
    });

    // 毎秒時計を更新
    setInterval(updateClock, 1000);
    updateClock();
});

function updateBackgroundBrightness() {
    const bgSelect = document.getElementById('bgBrightness');
    let brightness = parseInt(bgSelect.value, 10);
    let value = Math.round(brightness / 100 * 255);
    document.body.style.backgroundColor = 'rgb(' + value + ',' + value + ',' + value + ')';
}

function updateClockBrightness() {
    const clockSelect = document.getElementById('clockBrightness');
    let brightness = parseInt(clockSelect.value, 10);
    let value = Math.round(brightness / 100 * 255);
    const clockElem = document.getElementById('clock');
    clockElem.style.backgroundColor = 'rgb(' + value + ',' + value + ',' + value + ')';
}

function updateClock() {
    let hours, minutes, seconds;
    const currentRadio = document.getElementById('current');
    if (currentRadio.checked) {
        let now = new Date();
        hours = now.getHours();
        minutes = now.getMinutes();
        seconds = now.getSeconds();
    } else {
        hours = parseInt(document.getElementById('setHour').value, 10);
        minutes = parseInt(document.getElementById('setMinute').value, 10);
        seconds = parseInt(document.getElementById('setSecond').value, 10);
    }
    let hStr = hours < 10 ? '0' + hours : '' + hours;
    let mStr = minutes < 10 ? '0' + minutes : '' + minutes;
    let sStr = seconds < 10 ? '0' + seconds : '' + seconds;
    let timeStr = hStr + mStr + sStr;

    // 画像で表示 (d0～d5)
    for (let i = 0; i < 6; i++) {
        let digit = timeStr.charAt(i);
        let imgElem = document.getElementById('d' + i);
        imgElem.src = 'images/' + digit + '.png';
        imgElem.alt = digit;
    }
}
