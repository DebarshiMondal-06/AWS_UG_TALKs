import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const clientSMS = new SNSClient({});
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocument.from(client);

// Generate a random UUID
const generateUUID = () => randomUUID();

const sendSMS = async (name, phoneNumber) => {
  const input = {
    PhoneNumber: `+91${phoneNumber}`,
    Message: `${name} your Order from Amazon is confirmed!`,
    Subject: "Order Confirmed!",
  };
  const command = new PublishCommand(input);
  await clientSMS.send(command);
};

export const handler = async (event) => {
  console.log(event);
  try {
    // const getMessages = event.Records[0].body;
    const { name, order_name, brand, category, price, phoneNumber } = event;
    // const { name, order_name, brand, category, price, phoneNumber } = JSON.parse(getMessages);

    if (!name || !order_name || !brand || !category || !phoneNumber) {
      throw "Missing Attributes, Failed to Create Order!";
    }

    const params = {
      Item: {
        order_id: generateUUID(),
        name,
        order_name,
        brand,
        category,
        price,
        phoneNumber,
      },
      TableName: "Order_Table",
    };

    const result = await ddbDocClient.put(params);

    await sendSMS(name, phoneNumber);

    console.log("Order Created!");
  } catch (error) {
    console.log(error);
    throw error;
  }
};
