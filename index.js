const aws = require('aws-sdk');
// const studentpath = '/student';
const dynamodb = new aws.DynamoDB.DocumentClient();
const dynamodbTableName = 'Student';
var logger = require('logger.js');


exports.handler = async function(event) {
  
  
  
 
  // console.log("eventbody type is ", typeof(event.body), event);
  // console.log("body: ", event.body, event.body.sid );
  // console.log("JASON convertsion:, ", JSON.stringify(event.body), JSON.parse(event.body), event);
   
   console.log("event: ", event);
   console.log("event triggered is : ", event.httpMethod);
   let operation  = event.httpMethod;
   console.log("operation: ", operation);
  let response;
  switch(true) {
    case event.httpMethod === 'GET': // && event.path === studentpath:
      console.log("inside the get case");
      response = await getData(event.queryStringParameters.sid);
      break;
    case event.httpMethod === 'POST': //  && event.path === studentpath:
      console.log("eventbodysid: ", event.body);
      response = await saveData(JSON.parse(event.body));
      break;
    case event.httpMethod === 'DELETE' :
      console.log("into the delete case")
      response = await deleteData(JSON.parse(event.body).sid);
      break;
    case event.httpMethod === 'PATCH' :
      console.log("inside the patch");
      const requestBody = JSON.parse(event.body);
      console.log("request body: ", requestBody);
      response = await modifyData(requestBody.sid, requestBody.updateKey, requestBody.updateValue);
      break;
    default:
      
      
  }
  return response;
};
async function getData(sid) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      'sid': sid
    }
  };
  return await dynamodb.get(params).promise().then((response) => {
    return buildResponse(200, response.Item);
  }, (error) => {
    console.log(error);
  });
}

//This function will insert the data into the student table
async function saveData(requestBody) {
  console.log(" requestBody is ", typeof(requestBody ), requestBody);
  console.log("requestbody ", requestBody.sid );
  const params = {
    TableName: dynamodbTableName,
     Item: requestBody
  }
  return await dynamodb.put(params).promise().then(() => {
    const body = {
      Operation: 'SAVE',
      Message: 'SUCCESS',
     Item: requestBody
    };
    return buildResponse(200, body);
  }, (error) => {
    console.error('Do your custom error handling here. I am just gonna log it: ', error);
  });
}
async function deleteData(productId) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      'sid': productId
    },
    ReturnValues: 'ALL_OLD'
  }
  return await dynamodb.delete(params).promise().then((response) => {
    const body = {
      Operation: 'DELETE',
      Message: 'SUCCESS',
      Item: response
    }
    return buildResponse(200, body);
  }, (error) => {
    console.error('Do your custom error handling here. I am just gonna log it: ', error);
  })
}
async function modifyData(sid, updateKey, updateValue) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      'sid': sid
    },
    UpdateExpression: `set ${updateKey} = :value`,
    ExpressionAttributeValues: {
      ':value': updateValue
    },
    ReturnValues: 'UPDATED_NEW'
  }
  return await dynamodb.update(params).promise().then((response) => {
    const body = {
      Operation: 'UPDATE',
      Message: 'SUCCESS',
      UpdatedAttributes: response
    }
    return buildResponse(200, body);
  }, (error) => {
    console.error('Do your custom error handling here. I am just gonna log it: ', error);
  })
}
function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}
