import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, User } from "next-auth";
import bcrypt from "bcrypt";
import { prismaConnection } from "./prisma";


export const handleAuthOption : NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text", placeholder: "john@gmail.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req): Promise<User | null>  {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const { email, password} = credentials;

                // check whether the user exists or not
                try {
                    const userExisting = await prismaConnection.user.findFirst({
                        where: {
                            email: email
                        }
                    })
                    if(userExisting){
                        const isValid = await bcrypt.compare(password, userExisting.password);
                        if(!isValid) return null;
                        return {
                            id: userExisting.id.toString(),
                            email: userExisting.email
                        }
                    }
                } catch (error) {
                    console.error("the error is ", error)
                    return null
                }
                return null
            }
        })
    ],
    secret: process.env.JWT_SECRET,
    
    callbacks: {
        async jwt({token , user}) {
            if(user){
                console.log("the user is ", user)
                token.sub = user.id
            }
           return token
        },
        async session({token, session}) {
            console.log("the session is ", session)
            if(session.user && token.sub){
                session.user.id = token.sub
            }
            return session
        }
    }
}
