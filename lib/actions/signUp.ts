"use server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prismaConnection } from "../prisma";

 // defining the zod schema
    const userSchema = z.object({
       userName: z.string(),
       userEmail: z.email(),
       password: z.string().min(8, "Password must be at least 8 characters")
    })

export const signUpConfig = async ({userName, userEmail , password} : {userName: string, userEmail: string, password: string}) =>  {
    
   try {
        //parsed the schema
        const result = userSchema.safeParse({userName, userEmail, password})
        // returned formated error 
        if(!result.success){
            return {
                success: false,
                error: result.error.issues.map((issue) => ({
                    field: issue.path[0],
                    errors: [{ field: "userEmail", message: issue.message }],
                }))
            }
        }

        // checks the existing user
        const existingUser = await prismaConnection.user.findFirst({
            where: {
                email: userEmail
            }
        })
        if(existingUser){
            return {
                success: false,
                errors: [{ field: "userEmail", message: "Email already registered" }],
            }
        }
        // hashing the password
        const hashPassword = await bcrypt.hash(password, 10);
        // create a new User
        const newUser = await prismaConnection.user.create({
            data: {
               email: userEmail,
               userName: userName,
               password: hashPassword
            }
        })
        return {
            success: true,
            user: {
                id: newUser.id,
                name: newUser.userName,
                email: newUser.email,
            },
        }
    } catch (error) {
        if(error instanceof z.ZodError){
           return {
             success: false,
             errors: error.issues.map((issue) => ({
                field: issue.path[0],
                message: issue.message
             }))
           }
        }
        
    }
}