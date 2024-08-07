import {FC, useEffect, useState, Dispatch, SetStateAction, MouseEvent} from "react";
import TodoCard from "./TodoCard";
import AddTodo from "./AddTodo"
import {useParams, useNavigate} from "react-router-dom";
import {deleteTodo, getGoalById, updateGoal, updateTodo} from "../ApiServices";
import {Todo, Goal} from '../Types'
import {IconContext} from "react-icons";
import {IoIosArrowBack} from "react-icons/io";
import {VscWand} from "react-icons/vsc";
import AddAiTodos from "./AddAiTodos";
import EmptyList from "./EmptyList";


interface props {
  setGoals: Dispatch<SetStateAction<Goal[]>>
}

const GoalDetail: FC<props> = ({setGoals}): JSX.Element => {
  const navigate = useNavigate();

  const initialGoalState = {title: '', dueDate: new Date(), Todos: []} // ^solution? can't set empty with type or I can't map over todos
  const [goal, setGoal] = useState<Goal>(initialGoalState)
  const [isAddTodo, setIsAddTodo] = useState<boolean>(false)
  const [isAddAiTodo, setIsAddAiTodo] = useState<boolean>(false)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  // get param from router & convert to number
  const params = useParams();
  const id = Number(params.goalId);

  let completedTodos: Todo[] | [] = [];
  let openTodos: Todo[] | [] = []; // ^maybe state?

  useEffect(() => {
    // fetch goal data based on id from param
    const fetchGoal = async () => {
      const goal = await getGoalById(id)
      if (goal) {
        setGoal(goal)
        // check completion status of goal after fetching
        if (isCompleted !== goal.isCompleted) setIsCompleted(true)
      } else console.log('Error fetching goal in GoalDetail')
    }
    fetchGoal()
  }, [])

  // filter todos by completion
  if (goal.Todos.length > 0) {
    completedTodos = goal.Todos.filter((todo: Todo) => todo.isCompletedTodo)
    openTodos = goal.Todos.filter((todo: Todo) => !todo.isCompletedTodo)
  }

  async function handleTodoComplete (todo: Todo): Promise<void> {
    const isCompletedTodo = true;
    const updatedTodo = {...todo, isCompletedTodo};
    let resTodo: Todo[] | [] = [];
    const res = await updateTodo(updatedTodo)
    if (res) resTodo = [res];
    const filteredTodos = goal.Todos.filter((todoEl: Todo) => todoEl.id !== todo.id)
    let updatedGoal = {...goal, Todos: [...filteredTodos, ...resTodo]}
    if (goal.Todos.length > 0 && !isCompleted && openTodos.length === 1) {
      const res = await updateGoal({...goal, isCompleted: true})
      if (res) {
        updatedGoal = res
      }
      setIsCompleted(true)
    }
    setGoal(updatedGoal)
    setGoals((prev: Goal[]) => {
      const filteredGoals = prev.filter((item: Goal) => item.id !== goal.id)
      return [...filteredGoals, updatedGoal]
    })
  }

  async function handleTodoRecover (todo: Todo): Promise<void> {
    const isCompletedTodo = false;
    const updatedTodo = {...todo, isCompletedTodo};
    let resTodo: Todo[] | [] = [];
    const res = await updateTodo(updatedTodo)
    if (res) resTodo = [res];
    const filteredTodos = goal.Todos.filter((todoEl: Todo) => todoEl.id !== todo.id)
    // if todo is reverted to open but goal was completed -> update goal in db
    // updatedGoal stays the old Goal or is updated after fetch
    let updatedGoal = {...goal, Todos: [...filteredTodos, ... resTodo]}
    if (todo.isCompletedTodo && isCompleted) {
      const res = await updateGoal({...goal, isCompleted: true})
      if (res) {
        updatedGoal = res
      }
      setIsCompleted(false)
    }
    setGoal(updatedGoal)
    setGoals((prev: Goal[]) => {
      const filteredGoals = prev.filter((item: Goal) => item.id !== goal.id)
      return [...filteredGoals, updatedGoal]
    })
  }

  // list factory for both todo list types
  function createTodoList (todos: Todo[], completed: boolean): JSX.Element[] {
    // sort todo list by date
    const sortedTodos = todos.sort((a: Todo, b: Todo) => Date.parse(a.dueDateTodo.toString()) - Date.parse(b.dueDateTodo.toString()))
    // create todo list for rendering todo cards
    return sortedTodos.map((todo: Todo): JSX.Element => {
      return (
        <TodoCard key={todo.id} todo={todo} onDelete={handleDeleteClick} handleTodoComplete={handleTodoComplete} handleTodoRecover={handleTodoRecover} todoCompleted={completed} />
      )
    })
  }


  function handleClickNew () {
    setIsAddTodo(true)
  }

  function handleClickGenerate () {
    setIsAddAiTodo(true)
  }

  async function handleDeleteClick (e: MouseEvent<HTMLButtonElement>, todo: Todo) {
    e.stopPropagation()
    await deleteTodo(todo)
    const Todos = goal.Todos.filter((todoEl: Todo) => todoEl.id !== todo.id)
    setGoal((prev: Goal) => ({...prev, Todos}))
  }

  // Todo: refactor
  return (
    <>
      <div className={`flex flex-col pt-16 px-10 w-10/12 ${openTodos.length > 0 ? 'gap-y-8' : 'gap-y-0'}`}>
        {
          !isCompleted ?
            <div className="flex flex-col px-10">
              <div className="flex mb-5 w-400 items-end">

                <h1 className="text-left">
                  <span className="text-gray-400 text-sm">Your goal</span><br />
                  <div className="flex gap-x-1 items-center">
                    <button onClick={() => navigate('/')}>
                      <IconContext.Provider value={{color: 'var(--highlight-light-color)'}}>
                        <IoIosArrowBack />
                      </IconContext.Provider>
                    </button>
                    {goal.title} 🚀
                  </div>
                </h1>
                <div className="flex ml-auto gap-x-3">
                  <button onClick={handleClickGenerate} className="flex items-center bg-[color:var(--highlight-dark-color)] px-4 py-0.5 rounded-md">
                    <IconContext.Provider value={{color: 'white'}}>
                      <VscWand className="mr-3"/>
                    </IconContext.Provider>
                      Generate
                  </button>
                  <button onClick={handleClickNew} className="bg-[color:var(--highlight-light-color)] px-4 py-0.5 rounded-md"><span className="font-semibold mr-3">+</span>Add New</button>
                </div>
              </div>
              <div className="flex flex-col gap-y-5 my-5">
                {
                  createTodoList(openTodos, false)
                }
              </div>
            </div> :
            <div className="flex flex-col px-10">
              <div className="flex mb-5 w-400 items-end">
                <h1 className="text-left">
                  <span className="text-gray-400 text-sm font-semibold">You reached your goal 🚀</span><br />
                  <div className="flex gap-x-1 items-center">
                    <button onClick={() => navigate('/')}>
                      <IconContext.Provider value={{color: 'var(--highlight-light-color)'}}>
                        <IoIosArrowBack />
                      </IconContext.Provider>
                    </button>
                    {goal.title}
                  </div>
                </h1>
              </div>
            </div>
        }
        {completedTodos.length > 0 &&
          <div className="flex flex-col px-10">
            <div className="flex mb-5 w-400 items-end">
              <h2>Completed Todos 💪</h2>
            </div>
            <div className="flex flex-col gap-y-5">
              {
                createTodoList(completedTodos, true)
              }
            </div>
          </div>
        }
      {
        goal.Todos.length === 0 &&
        <EmptyList listName="todo" setIsAddTodo={setIsAddTodo} />
      }
      </div>
      {isAddTodo && <AddTodo setIsAddTodo={setIsAddTodo} GoalId={goal.id} setGoal={setGoal} setGoals={setGoals} />}
      {isAddAiTodo && <AddAiTodos setIsAddAiTodo={setIsAddAiTodo} goal={goal} setGoal={setGoal} setGoals={setGoals} />}
    </>
  )
}

export default GoalDetail
