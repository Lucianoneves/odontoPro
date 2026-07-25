"use server"

import prisma from "@/lib/prisma";  

interface getUserDataProps {
    userId: string;
}


export async function getUserData ({userId}: getUserDataProps){
    try{


        if(!userId){
           return null;
        }

          const user = await prisma.user.findFirst({
            where: {
                id: userId,
            },
            include: {
                subscription: true,
            },
          });

          if(!user){
            return null;
          }

         
          return user;


    }catch(err){
        console.log(err)
        return null
    }
}