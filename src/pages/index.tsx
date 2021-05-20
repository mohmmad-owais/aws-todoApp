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
  const [loading, setLoading] = useState(true)
  const [todoData, setTodoData] = useState<incomingData | null>(null)
  const [subscriptionTitle, setSubscriptiontitle] = useState<string>(
    "nothing available right now"
  )
  const subscription = API.graphql(graphqlOperation(onAddTodo)) as any
  const todoTitleRef = useRef<any>("")

  const addTodoMutation = async () => {
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
      fetchTodos()
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

  function handleSubscription() {
    subscription.subscribe({
      next: status => {
        // when mutation will run the next will trigger
        console.log("New SUBSCRIPTION ==> ", status.value.data)
        setSubscriptiontitle(status.value.data.onAddTodo.title)
        fetchTodos()
      },
    })
  }

  useEffect(() => {
    fetchTodos()
    handleSubscription()
  }, [])

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
      {loading ? (
        <h1>Loading ...</h1>
      ) : (
        <div>
          <label>
            Todo:-
            <input ref={todoTitleRef} />
          </label>
          <button onClick={() => addTodoMutation()}>Create Todo</button>
          {todoData.data &&
            todoData.data.getTodos.map((item, ind) => (
              <div style={{ marginLeft: "1rem", marginTop: "2rem" }} key={ind}>
                {item.title}
                <button onClick={() => dltTodo(item.id)}>Delete</button>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
