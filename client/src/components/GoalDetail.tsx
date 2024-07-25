import {FC, useEffect, useState} from "react";
import TodoCard from "./TodoCard";
import {useParams} from "react-router-dom";
import {getGoalById} from "../ApiServices";
import {Goal} from '../Types'



interface props {
}

const GoalDetail: FC<props> = (): JSX.Element => {
  const [goal, setGoal] = useState<Goal[]>([]) // ^better workaround?
  // get param from router & convert to number
  const {goalId} = useParams();
  const id = Number(goalId);


  useEffect(() => {
    // fetch goal data based on id from param
    const fetchGoal = async () => {
      const goal = await getGoalById(id)
      setGoal([goal])
    }
    fetchGoal()
  }, [])


  // get goal
  const todoList = goal[0].Todos.map(todo => {
    return (
      <TodoCard key={todo.id} todo={todo} />
    )
  })


  return (
    <>
      <div className="flex flex-col pt-16 px-10 w-full">
        <div className="flex mb-5 w-400 items-end">
          <h1>Your goal: {goal[0].title} 🚀</h1>
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
