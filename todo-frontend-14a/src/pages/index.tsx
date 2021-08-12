import React, { useState, useRef, useEffect } from "react"
import { addTodo } from "../graphql/mutations"
import { getTodos } from "../graphql/queries"
import { deleteTodo } from "../graphql/mutations"
import { API, graphqlOperation } from "aws-amplify"
import shortid from "shortid"
import { onAddTodo } from "../graphql/subscriptions"

interface title {
  title: string
  id: string
}

interface incomingData {
  data: {
    getTodos: title[]
  }
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [todoData, setTodoData] = useState<incomingData | null>(null)
  const todoTitleRef = useRef<any>("")

  const addTodoMutation = async () => {
    alert("SNS Event Trigger Successfully")
    try {
      const todo = {
        id: shortid.generate(),
        title: todoTitleRef.current.value,
        done: false,
      }
      const data = await API.graphql({
        query: addTodo,
        variables: {
          todo: todo,
        },
      })
      todoTitleRef.current.value = ""
    } catch (e) {
      console.log(e)
    }
  }

  const fetchTodos = async () => {
    try {
      const data = await API.graphql({
        query: getTodos,
      })
      setTodoData(data as incomingData)
      setLoading(false)
    } catch (e) {
      console.log(e)
    }
  }

  const dltTodo = async id => {
    try {
      const todoId = id
      const deletedTodo = await API.graphql({
        query: deleteTodo,
        variables: { todoId: todoId },
      })
      fetchTodos()
    } catch (e) {
      console.log(e)
    }
  }
  return (
    <div>
      <div>
        <h1>Project 13+14A</h1>
        <label>Todo:-</label>

        <input ref={todoTitleRef} placeholder="Todo Title" required />

        <button onClick={() => addTodoMutation()}>Create Todo</button>

        {/* {todoData.data &&
            todoData.data.getTodos.map((item, ind) => (
              <div style={{ marginLeft: "1rem", marginTop: "2rem" }} key={ind}>
                {item.title}
                <button onClick={() => dltTodo(item.id)}>Delete</button>
              </div>
            ))} */}
      </div>
    </div>
  )
}
