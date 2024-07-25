import { useEffect, useState, FC } from 'react'
import './App.css'
import {getGoals} from './ApiServices'
import {Goal} from './Types'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import GoalDetail from './components/GoalDetail'


const App: FC = (): JSX.Element => {
  const [goals, setGoals] = useState<Goal[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const goals = await getGoals();
      setGoals(goals)
    }
    fetchData()
  }, [])

  // ^more elegant way?
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Dashboard goals={goals}/>
    },
    {
      path: '/goal/:goalId',
      element: <GoalDetail/> // ^is there a way to pass variable prop? // helper funct that filters goal by id from router params?
    }

  ])

  return (
    <>
      <div className='flex w-full'>
        <Navbar />
        <RouterProvider router={router} />
      </div>
    </>
  )
}

export default App
