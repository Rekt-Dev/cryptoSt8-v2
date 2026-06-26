const KEY = "2aff88f599b076bfc154efdd93aebfd0";

exports.handler = async (event) => {
  const { series_id, units } = event.queryStringParameters ?? {};
  if (!series_id) return { statusCode: 400, body: "missing series_id" };

  const unitsParam = units ? `&units=${units}` : "";
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${KEY}&file_type=json&sort_order=desc&limit=2${unitsParam}`;

  try {
    const r = await fetch(url);
    const d = await r.json();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(d),
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
};
