
import { getServerSession } from "next-auth";
import { handleAuthOption } from "@/lib/auth";
import { redirect } from 'next/navigation';
export default async function Home() {
  const session =  await getServerSession(handleAuthOption);
  console.log(session?.user.email);
     if(session?.user){
       
        redirect('/dashboard')
     }
     else{
       redirect('api/auth/signUp')
     }
}
