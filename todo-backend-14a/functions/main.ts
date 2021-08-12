import Todo from "./Todo";
import addTodo from "./addTodo";
import getTodos from "./getTodos";
import deleteTodo from "./deleteTodo";
const AWS = require("aws-sdk");

type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    todoId: string;
    todo: Todo;
  };
};

function helper(body: Todo) {
  const eventBridge = new AWS.EventBridge();

  return eventBridge
    .putEvents({
      Entries: [
        {
          EventBusName: "default",
          Source: "topicEvent",
          DetailType: "Event trigger from Todo",
          Detail: `{ "Event": "${body.title}" }`,
        },
      ],
    })
    .promise();
}

exports.handler = async (event: AppSyncEvent) => {
  switch (event.info.fieldName) {
    case "addTodo":
      const e = await helper(event.arguments.todo);
      return await addTodo(event.arguments.todo);
    case "getTodos":
      return await getTodos();
    case "deleteTodo":
      return await deleteTodo(event.arguments.todoId);

    default:
      return null;
  }
};
