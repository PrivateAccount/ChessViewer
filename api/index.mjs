import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    ScanCommand,
    PutCommand,
    GetCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "chess";

export const handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        "Access-Control-Allow-Origin": "https://master.d2mlbkja551bj3.amplifyapp.com",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    };

    try {
        switch (event.routeKey) {
            case "GET /games":
                body = await dynamo.send(
                    new ScanCommand({ TableName: tableName })
                );
                const sortedItems = body.Items.sort((a, b) => {
                    return parseInt(b.id) - parseInt(a.id);
                });
                body = sortedItems;
                if (event.rawQueryString != "") {
                    body = body.find(item => item.id == event.rawQueryString.replace("id=", ""));
                }
                body = { data: body, message: "Loaded successfully." };
                break;
            case "POST /games":
                let requestJSON = JSON.parse(event.body);
                await dynamo.send(
                    new PutCommand({
                        TableName: tableName,
                        Item: {
                            id: requestJSON.id,
                            saved: requestJSON.saved,
                            user: requestJSON.user,
                            email: requestJSON.email,
                            sequences: requestJSON.sequences,
                            details: requestJSON.details,
                        },
                    })
                );
                body = { data: "Posted id: " + requestJSON.id, message: "Saved successfully." };
                break;
            default:
                throw new Error(`Unsupported route: "${event.routeKey}"`);
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
