/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type TodoInput = {
  id: string,
  title: string,
  done: boolean,
  result?: string | null,
};

export type Todo = {
  __typename: "Todo",
  id: string,
  title: string,
  done: boolean,
  result?: string | null,
};

export type AddTodoMutationVariables = {
  todo: TodoInput,
};

export type AddTodoMutation = {
  addTodo?:  {
    __typename: "Todo",
    id: string,
    title: string,
    done: boolean,
    result?: string | null,
  } | null,
};

export type DeleteTodoMutationVariables = {
  todoId: string,
};

export type DeleteTodoMutation = {
  deleteTodo?: string | null,
};

export type GetTodosQuery = {
  getTodos?:  Array< {
    __typename: "Todo",
    id: string,
    title: string,
    done: boolean,
    result?: string | null,
  } | null > | null,
};
