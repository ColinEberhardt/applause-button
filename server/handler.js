const AWS = require("aws-sdk");
const TABLE = "Applause";
const dynamoClient = new AWS.DynamoDB.DocumentClient();

AWS.config.setPromisesDependency(Promise);

const getItemByKey = url =>
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

const response = body => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify(body)
});

module.exports.hello = async (event, context, callback) => {
  const sourceUrl = event.headers && event.headers.Referer;
  if (!sourceUrl) {
    console.error(event);
    callback(null, response({ error: "no referer specified", event }));
  }

  const claps = event.body ? JSON.parse(event.body).claps : undefined;

  const item = await getItemByKey(sourceUrl);

  if (claps) {
    if (item.Item) {
      await incrementClaps(sourceUrl, claps);
    } else {
      await putItem(sourceUrl, claps);
    }
    callback(
      null,
      response({ claps: item.Item ? item.Item.claps + claps : claps, event })
    );
  } else {
    if (item.Item) {
      callback(null, response({ claps: item.Item.claps, event }));
    } else {
      callback(null, response({ claps: 0, event }));
    }
  }
};
