"use server"

import { auth, db } from "@/firebase/admin"
import { cookies } from "next/headers"

const five_days = 60 * 60 * 24 * 5 // 5 days

export async function signUp(params: SignUpParams){
    const { uid, name, email } = params

    try {

        const userRecord = await db.collection('users').doc(uid).get()
        if(userRecord.exists){
            return {
                success: false,
                message: 'User already exists'
            }
        }

        await db.collection('users').doc(uid).set({
            name,
            email,
        })

        return {
            success: true,
            message: 'User created successfully'
        }
    } catch (error: any) {
        console.log("Error creating a user", error)

        if(error.code === 'auth/email-already-exists'){
            return {
                success: false,
                message: 'Email already exists'
            }
        }

        return {
            success: false,
            message: 'Error creating a user'
        }
    }
}

export async function signIn(params: SignInParams){
    const { email, idToken } = params

    try {
        const userRecord = await auth.getUserByEmail(email)

        if(!userRecord){
            return {
                success: false,
                message: 'User not found'
            }
        }

        await setSessionCookie(idToken)
    }
    catch (error: any) {
        console.log("Error signing in", error)

        return {
            success: false,
            message: 'Error signing in'
        }
    }
}

export async function setSessionCookie(idToken: string){
    const cookieStore = await cookies()

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: five_days * 1000,
    })

    cookieStore.set('session', sessionCookie, {
        maxAge: five_days,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    })
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if(!sessionCookie){
        return null
    }

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)

        const userRecord = await db.collection('users').doc(decodedClaims.uid).get()

        if(!userRecord.exists){
            return null
        }

        return {
            ...userRecord.data(),
            id: userRecord.id
        } as User
    } catch (error: any) {
        console.log("Error getting current user", error)

        return null
    }
}

export async function isAuthenticated(){
    const user = await getCurrentUser()

    return !!user
}
