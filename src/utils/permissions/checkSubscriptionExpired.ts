import {Session} from "next-auth" 
import {addDays, differenceInDays, isAfter, isBefore} from "date-fns" 
import { ResultPermissionProps } from "@/utils/permissions/canPermission" 
import { TRAIL_LIMITS } from "@/utils/permissions/trial-limits"




export async function checkSubscriptionExpired(session: Session): 
Promise<ResultPermissionProps> { 
    const  trailEndDate = addDays((session.user as {createdAt: Date})?.createdAt! ?? new Date(), TRAIL_LIMITS)

    if(isBefore(new Date(), trailEndDate)) { 
        return{
            hasPermission: false,
            planId: "EXPIRED",
            expired:  true,
            plan: null,
        }
    }

    return{
        hasPermission: true,
        planId: 'TRIAL',
        expired: false,
        plan: null,
    }
}
