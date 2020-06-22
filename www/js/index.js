function setData() {
    //ボタンが押されたとき実行する
    var wOptions = {
        "enableHighAccuracy": true, // true : 高精度
        "timeout": 10000, // タイムアウト : ミリ秒
        "maximumAge": 0, // データをキャッシュ時間 : ミリ秒
    };
    navigator.geolocation.getCurrentPosition(positionsOK, alert("ブラウザが対応していないか、位置情報の取得が許可されていません。\n 次の画面で許可して下さい。"), wOptions);
}
//ボタン押された時の処理
document.getElementById("getPositionButton").onclick = function() {
    setData();
}

function getEscapePlaces(lati, long) {
    //座標をいい感じに変換する
    const z = 10 //ズームレベル10固定(国土地理院APIの関係)
        //この辺難しい数学過ぎて正直よくわかってない
    let L = 85.05112878;
    let x = Math.floor((long / 180 + 1) * Math.pow(2, (z + 7)));
    let y = Math.floor((Math.pow(2, (z + 7)) / Math.PI) * (-1 * (Math.atanh(Math.sin(Math.PI * lati / 180))) + Math.atanh(Math.sin(Math.PI * L / 180))));
    var element = document.getElementById("target");
    const disaster = element.value;
    let url = "https://cyberjapandata.gsi.go.jp/xyz/skhb0" + disaster + "/" + z + "/" + Math.floor(x / 256) + "/" + Math.floor(y / 256) + ".geojson";
    var returnObject = { "siteName": "", "x": 0, "y": 0 };
    let distance = 99999999999999999999 //どう考えても距離より遠い値入れただけ
    fetch(url).then(function(responce) {
        if (responce.StatusCode = "404") {
            document.getElementById("siteName").innerHTML = "避難できる場所が見つかりませんでした。"
        }
        return responce.json();
    }).then(function(geojson) {
        geojson.features.forEach(element => {
            //座標と三平方の定理を使って最短場所を求める
            //TODO？　候補を1つではなく何個かやる
            let tmpLat = element.geometry.coordinates[1];
            let tmpLon = element.geometry.coordinates[0];
            let tmpSiteName = element.properties.name;
            let tmpDistance = Math.sqrt(Math.pow(lati - tmpLat, 2) + Math.pow(long - tmpLon, 2));
            if (distance > tmpDistance) {
                returnObject.siteName = tmpSiteName;
                distance = tmpDistance;
                returnObject.latitude = tmpLat;
                returnObject.longitude = tmpLon;
            }
        })
        return returnObject;
    }).then((obj) => {
        document.getElementById("siteName").innerHTML = obj.siteName;
        console.log(obj.latitude);
        console.log(obj.longitude);
    });
    //setEscapeRootに座標を渡すので、obj.latitude/obj.longitudeを返す
}

function setEscapeRoot(PrLat, PrLon, DnLat, DnLon) {
    //TODO GM APIを叩いて最短距離を求め、マップに設定
}

function positionsOK(positions) {
    const presentLatitude = positions.coords.latitude;
    const presentLongitude = positions.coords.longitude;
    //placeには名前、座標が必要
    getEscapePlaces(presentLatitude, presentLongitude);
}