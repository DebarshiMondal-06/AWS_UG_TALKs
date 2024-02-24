import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocument.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

// helper return function...
const helperReturn = (code, message) => {
  return {
    statusCode: code,
    body: JSON.stringify({ message })
  };
};

export const handler = async (event) => {
  const { book_id } = event.queryStringParameters ?? {};
  const httpMethod = event.httpMethod;
  const { bookId, name, published_year } = JSON.parse(event.body) ?? {};

  try {
    switch (httpMethod) {
      case 'GET':
        if (book_id) {
          const getItemInput = {
            TableName: TABLE_NAME,
            Key: {
              book_id,
            },
          };
          const getData = await ddbDocClient.get(getItemInput);
          return helperReturn(200, getData);
        }
        const getAllData = await ddbDocClient.scan({ TableName: TABLE_NAME });
        return helperReturn(200, getAllData);
      case 'POST':
        if (!bookId) throw "bookId Not Found";
        const putItemInput = {
          TableName: TABLE_NAME,
          Item: {
            book_id: bookId,
            name,
            published_year
          },
        };
        await ddbDocClient.put(putItemInput);
        return helperReturn(201, "Record Inserted!");
      case 'DELETE':
        if (!bookId) throw "bookId Not Found";
        const deleteItemInput = {
          TableName: TABLE_NAME,
          Key: {
            book_id: bookId,
          },
        };
        await ddbDocClient.delete(deleteItemInput);
        return helperReturn(200, "Record Deleted!");
      default:
        return helperReturn(400, 'Something Went Wrong!');
    }
  }
  catch (error) {
    return helperReturn(400, error);
  }
};
