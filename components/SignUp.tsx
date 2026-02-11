"use client";
import { signUpConfig } from "@/lib/actions/signUp";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {useRouter} from "next/navigation"
import { useState } from "react";

export default function SignUp() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setError] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>)=>  {
    e.preventDefault(); // prevent browser from reloading page
    setError({})
    setIsLoading(true);
    const result =  await signUpConfig({ userName, userEmail, password })

    if(result?.success){
      router.push('/api/auth/signin')
    }
    else {
      console.log(" Signup failed with errors:", result?.error);
       const errorMap: Record<string, string> = {}
       result?.errors?.forEach((err) => {
         errorMap[err.field as string] = err.message
       })
       setError(errorMap)
    }
    setIsLoading(false)
  }
  return (
    <section className="relative flex items-center mt-12">
       <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Sign Up to your account</CardTitle>
            <CardDescription>
              Enter your details below to signUp to your account
            </CardDescription>
            
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                 <div className="grid gap-2">
                    <Label htmlFor="email">UserName</Label>
                    <Input
                      id="userName"
                      type="text"
                      value={userName}
                      placeholder="John Deo"
                      onChange={(e :  React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
                      required
                    />
                    {errors.userName && (
                      <p className="text-red-500 text-sm">{errors.userName}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userEmail}
                      placeholder="m@example.com"
                      onChange={(e :  React.ChangeEvent<HTMLInputElement>) => setUserEmail(e.target.value)}
                      required
                    />
                    {errors.userEmail && (
                      <p className="text-red-500 text-sm">{errors.userEmail}</p>
                    )}
                  </div>
               
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input id="password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required />
                    {errors.password && (
                      <p className="text-red-500 text-sm">{errors.password}</p>
                    )}
                </div>
              </div>
              <Button type="submit" className="w-full mt-4">
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <CardDescription className="flex flex-row gap-2">
              Already have an account? 
              <button className="underline text-md tracking-wide font-semibold" onClick={() => router.push('/api/auth/signin')}>Log In</button>
            </CardDescription>
          </CardFooter>
        </Card>
    </section>
   
  )
}
