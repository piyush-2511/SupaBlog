import React,{useState} from 'react'
import authService from '../appwrite/auth'
import {Link, NavLink, useNavigate} from 'react-router-dom'
import {login as authLogin} from '../Features/auth/auth' 
import {Button, Input, Logo} from './index'
import { useDispatch } from 'react-redux'
import {useForm} from 'react-hook-form'

function Signup() {

  const navigate = useNavigate()
  const [error, setError] = useState("")
  const dispatch = useDispatch()
  const {register, handleSubmit} = useForm()

  const create = async (data) => {
    setError("")
    try {
      const account = await authService.createAccount(data)
      if (account){
        const currentUser = await authService.getCurrentUser()
        if (currentUser) dispatch(authLogin(userData))
        navigate('/')
      }
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className='flex items-center justify-center w-full'>
          <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>
            <div className='mb-2 flex justify-center'>
              <span className='inline-block w-full max-w-[100px]'>
                <Logo width='100%' className='text-black' />
              </span>
    
            </div>
    
            <h2 className='text-center text-2xl font-bold leading-tight'>
              Create your account 
            </h2>
            <p className='mt-2 text-center text-base text-black/60'>
              Already have an aaccount ? &nbsp;
              <Link
              to='/login'
              className='font-medium text-primary transition-all duration-200 hover:underline'
              >
                Sign In
              </Link>
            </p>
    
            {error && <p className='text-red-500 mt-8 text-center'>{error}</p>}
    
            <form onSubmit={handleSubmit(create)} className='mt-8' >
              <div className='space-y-5'>
                <Input
                label = 'Full Name:'
                placeholder = 'Enter your Full Name'
                type = 'text'
                {...register('name', {
                  required : true,
                })}
                />

                <Input
                label = 'Email :'
                placeholder = 'Enter your Email'
                type = 'email'
                {...register('email', {
                  required : true,
                  validate : {
                    matchPattern : (value)=> /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) || "Email address mst be a valid address"
                  }
                })}
                />
    
                <Input
                label = 'Password:'
                placeholder = 'Enter your Password'
                type = 'password'
                {...register('password', {required : true,})}
                />
    
                <Button
                className='w-full'
                type='submit'
                >
                  Create Account
                </Button>
                
    
              </div>
            </form>
    
    
          </div>
        </div>
  )
}

export default Signup