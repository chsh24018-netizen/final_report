// netlify/functions/weather.mjs
export default async (req) => {
  try {
    // ★ここが修正ポイント！
    // URLが省略されていても読み取れるように "http://localhost" を追加しました
    const url = new URL(req.url, "http://localhost");
    const params = url.searchParams;
    
    const q = params.get("q");       
    const lat = params.get("lat");   
    const lon = params.get("lon");   
    const type = params.get("type"); 

    // あなたのAPIキー（画像のものをセット済みです）
    const API_KEY = "6b74bbaf4bce337b746fe35f546e781e";
    
    const baseUrl = "https://api.openweathermap.org/data/2.5/";
    let apiUrl = "";

    // リクエストの組み立て
    if (type === "forecast") {
      if (lat && lon) {
        apiUrl = `${baseUrl}forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${API_KEY}`;
      } else {
        apiUrl = `${baseUrl}forecast?q=${q}&units=metric&lang=ja&appid=${API_KEY}`;
      }
    } else if (type === "air_pollution") {
      if (lat && lon) {
        apiUrl = `${baseUrl}air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
      } else {
        return new Response(JSON.stringify({ error: "Lat/Lon required for air pollution" }), { status: 400 });
      }
    } else {
      // type="weather" またはその他
      if (lat && lon) {
        apiUrl = `${baseUrl}weather?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${API_KEY}`;
      } else {
        apiUrl = `${baseUrl}weather?q=${q}&units=metric&lang=ja&appid=${API_KEY}`;
      }
    }

    // デバッグ用: どんなURLを叩こうとしているかコンソールに出す
    console.log(`Requesting OpenWeatherMap: ${apiUrl}`);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenWeatherMap Error: ${response.status}`, errorText);
        return new Response(JSON.stringify({ error: "API Error", details: errorText }), { status: response.status });
    }
    
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    // どんなエラーで止まったかをVSCodeのターミナルに表示する
    console.error("Function Crashed:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", message: error.toString() }), { status: 500 });
  }
};