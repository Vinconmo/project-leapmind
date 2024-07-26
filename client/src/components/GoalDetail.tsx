import {FC, useEffect, useState} from "react";
import TodoCard from "./TodoCard";
import {useParams} from "react-router-dom";
import {getGoalById} from "../ApiServices";
import {Goal, Todo} from '../Types'



interface props {
}

const GoalDetail: FC<props> = (): JSX.Element => {
  const [goal, setGoal] = useState<any>({Todos: []}) // ^solution? can't set empty with type or I can't map over todos
  // get param from router & convert to number
  const params = useParams();
  const id = Number(params.goalId);

  useEffect(() => {
    // fetch goal data based on id from param
    const fetchGoal = async () => {
      const goal = await getGoalById(id)
      setGoal(goal)
    }
    fetchGoal()
  }, [])
  // console.log('goal', goal)


  // get goal
  const todoList = goal.Todos.map((todo: Todo) => {
    return (
      <TodoCard key={todo.id} todo={todo} />
    )
  })


  return (
    <>
      <div className="flex flex-col pt-16 px-10 w-full">
        <div className="flex mb-5 w-400 items-end">
          <h1>Your goal: {goal.title} 🚀</h1>
          <button className="ml-auto bg-[color:var(--highlight-light-color)] px-4 py-0.5 rounded-md"><span className="font-semibold mr-3">+</span>New</button>
        </div>
        <div className="flex flex-col gap-y-5">
          {
            todoList
          }
        </div>
      </div>
    </>
  )
}

export default GoalDetail