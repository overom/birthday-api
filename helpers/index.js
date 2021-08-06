const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
});

const getByEmail = async (email) => {
  // Validate
  if (!email) {
    throw new Error(`"email" is required`);
  }
  const params = {
    TableName: process.env.USERS_TABLE,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: { ":userId": email },
  };

  let user = await dynamodb.query(params).promise();
  user = user.Items && user.Items[0] ? user.Items[0] : null;

  return user;
};

module.exports = {
  getByEmail,
};
