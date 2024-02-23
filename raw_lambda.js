import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDB();
const ddbDocClient = DynamoDBDocument.from(client);

const TABLE_NAME = <YOUR_TABLE_NAME>;



export const handler = async (event) => {
  console.log(event);
  const { book_id } = event.queryStringParameters ?? {};
  const { bookId, name, published_year } = JSON.parse(event.body) ?? {};

  try {
    if (book_id) {
      const getItemInput = {
        TableName: TABLE_NAME,
        Key: {
          book_id,
        },
      }
      const getData = await ddbDocClient.get(getItemInput);
      return {
        statusCode: 200,
        body: JSON.stringify(getData)
      };
    }

    if (bookId) {
      const putItemInput = {
        TableName: TABLE_NAME,
        Item: {
          book_id: bookId,
          name,
          published_year
        },
      };
      const getData = await ddbDocClient.put(putItemInput);
      return {
        statusCode: 200,
        body: JSON.stringify(getData)
      };
    }


    const getData = await ddbDocClient.scan({ TableName: TABLE_NAME });
    const response = {
      statusCode: 200,
      body: JSON.stringify(getData)
    };
    return response;
  }
  catch(error) {
   const response = {
      statusCode: 400,
      body: JSON.stringify(error)
    };
    return response;
  }
};
