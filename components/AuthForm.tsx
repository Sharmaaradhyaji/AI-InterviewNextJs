"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"

import { Button } from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import FormField from "./FormField"
import { useRouter } from "next/navigation"
import { create } from "domain"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase/client"
import { signIn, signUp } from "@/lib/actions/auth.action"


const formSchema = z.object({
    username: z.string().min(2).max(50),
})

const authFormSchema = (type: FormType) => {
    return z.object({
        name: type === 'sign-up' ? z.string().min(2).max(50) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(3),
    })
}

const AuthForm = ({type} : {type: FormType}) => {
  const router = useRouter()
    const formSchema = authFormSchema(type)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
          if(type === 'sign-up') {
            const { name, email, password } = values

            const userCredentials = await createUserWithEmailAndPassword(auth, email, password)

            const result = await signUp({
                uid: userCredentials.user.uid,
                name: name!,
                email,
                password
            })

            if(!result?.success){
                toast.error(result?.message)
                return
            }

            toast.success('Account created successfully')
            router.push('/sign-in')
          }
          else {
            const { email, password } = values

            const userCredentials = await signInWithEmailAndPassword(auth, email, password)
            const idToken = await userCredentials.user.getIdToken()

            if(!idToken){
              toast.error('Error signing in')
              return
            }

            await signIn({
              email, idToken
            })

            toast.success('Logged in successfully')
            router.push('/')
          }
          console.log(values)
        } catch (error) {
          console.log(error)
          toast.error(`Error: ${error}`)
        }
    }

    const isSignin = type === 'sign-in';

    return (
    <div className="card-border lg:min-w-[566px]">
        <div className="flex flex-col gap-6 card py-14 px-10">
            <div className="flex flex-row gap-2 justify-center">
                <Image src="/logo.svg" alt="logo" height={32} width={38}/>
                <h2 className="text-primary-100">PrepWise</h2>
            </div>

            <h3>Practise Job Interviews with AI</h3>
        
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
          {!isSignin && (
            <FormField
              control={form.control}
              name="name"
              label="Name"
              placeholder="Your Name"
              />
          )}
          <FormField
            control={form.control}
            name="email"
            label="Email"
            placeholder="Your Email"
            type="email"
          />
          <FormField
            control={form.control}
            name="password"
            label="Password"
            placeholder="Your Password"
            type="password"
          />

          <Button type="submit" className="btn">{isSignin ? 'Sign in' : 'Create an Account'}</Button>
        </form>
      </Form>

      <p className="text-center">
        {isSignin ? 'No account yet?' : 'Have an account already?'}
        <Link className='font-bold text-user-primary ml-1' href={!isSignin ? '/sign-in' : '/sign-up'}>
            {!isSignin ? "Sign-in" : "Sign-up"}
        </Link>
      </p>
      </div>
    </div>
  )
}

export default AuthForm
