const is = require("is_js");
const AWS = require("aws-sdk");
const TABLE = "Applause";
const dynamoClient = new AWS.DynamoDB.DocumentClient();

AWS.config.setPromisesDependency(Promise);

// see: https://github.com/arasatasaygin/is.js/issues/154
const isurl = url => url.match(/^http:\/\/localhost:\d*\/?$/) || is.url(url);

const getItem = url =>
  dynamoClient
    .get({
      TableName: TABLE,
      Key: {
        url
      }
    })
    .promise();

const putItem = (url, claps) =>
  dynamoClient
    .put({
      TableName: TABLE,
      Item: {
        url,
        claps
      }
    })
    .promise();

const incrementClaps = (url, claps) =>
  dynamoClient
    .update({
      TableName: TABLE,
      Key: {
        url
      },
      UpdateExpression: "SET claps = claps + :inc",
      ExpressionAttributeValues: {
        ":inc": claps
      }
    })
    .promise();

const getItems = urls =>
  dynamoClient
    .batchGet({
      RequestItems: {
        [TABLE]: {
          Keys: urls.map(url => ({
            url
          }))
        }
      }
    })
    .promise();

const response = body => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify(body)
});

const getSourceUrl = event => {
  const sourceUrl = event.headers && event.headers.Referer;
  if (!sourceUrl) {
    throw new Error("no referer specified");
  }
  return sourceUrl;
};

const clamp = (value, lower, upper) => Math.max(lower, Math.min(value, upper));

const assert = (truth, message) => {
  if (!truth) {
    throw new Error(`assertion failure: ${message}`);
  }
};

// creates a simpler lambda interface with generic error handling capabilities
const lambda = fn => {
  return async (event, context, callback) => {
    try {
      await fn(event, success => callback(null, response(success)));
    } catch (error) {
      console.error(JSON.stringify({ error, event }));
      callback("an error occured - bad luck!");
    }
  };
};

module.exports.getClaps = lambda(async (event, success) => {
  // robots do not include Referer, so fail fats
  if (!event.headers.Referer) {
    success("no referer set");
    return;
  }

  const sourceUrl = getSourceUrl(event);
  assert(isurl(sourceUrl), `Referer is not a URL [${sourceUrl}]`);

  const item = await getItem(sourceUrl);
  if (item.Item) {
    success(item.Item.claps);
  } else {
    success(0);
  }
});

module.exports.updateClaps = lambda(async (event, success) => {
  const sourceUrl = getSourceUrl(event);
  const claps = Number(event.body);
  assert(isurl(sourceUrl), `Referer is not a URL [${sourceUrl}]`);
  assert(is.not.nan(claps), `Clap count was not a number`);

  const clapIncrement = clamp(claps, 1, 10);
  let totalClaps;

  const item = await getItem(sourceUrl);

  if (item.Item) {
    totalClaps = item.Item.claps + clapIncrement;
    await incrementClaps(sourceUrl, clapIncrement);
  } else {
    totalClaps = clapIncrement;
    await putItem(sourceUrl, clapIncrement);
  }

  success(totalClaps);
});

module.exports.getMultiple = lambda(async (event, success) => {
  assert(is.array(event.body), "getMultiple requires an array");
  assert(event.body.every(isurl), "getMultiple requires an array of URLs");

  const items = await getItems(event.body);
  success(items.Responses.Applause);
});
