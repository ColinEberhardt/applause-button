const AWS = require("aws-sdk");
const TABLE = "Applause";
const dynamoClient = new AWS.DynamoDB.DocumentClient();

AWS.config.setPromisesDependency(Promise);

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

module.exports.getClaps = async (event, context, callback) => {
  const sourceUrl = getSourceUrl(event);

  const item = await getItem(sourceUrl);
  if (item.Item) {
    callback(null, response(item.Item.claps));
  } else {
    callback(null, response(0));
  }
};

module.exports.updateClaps = async (event, context, callback) => {
  const sourceUrl = getSourceUrl(event);

  const clapIncrement = Math.min(Number(event.body), 10);
  let totalClaps;

  const item = await getItem(sourceUrl);

  if (item.Item) {
    totalClaps = item.Item.claps + clapIncrement;
    await incrementClaps(sourceUrl, clapIncrement);
  } else {
    totalClaps = clapIncrement;
    await putItem(sourceUrl, clapIncrement);
  }

  callback(null, response(totalClaps));
};

module.exports.getMultiple = async (event, context, callback) => {
  const items = await getItems(event.body);
  callback(null, response(items.Responses.Applause));
};
