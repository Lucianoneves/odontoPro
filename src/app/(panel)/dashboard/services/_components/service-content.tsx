import { getAllServices } from "../_data-access/get-all-services";
import { ServicesList } from "./services-list";
import { canPermission } from "@/utils/permissions/canPermission";
import { LabelSubscription } from "@/components/ui/label-sbscription";



interface ServiceContentProps {
    userId: string;
}

export async function ServiceContent({ userId }: ServiceContentProps) {
    const services = await getAllServices({ userId });
    const permissions = await canPermission({ type: "service" });

    return (
        <>  
        {!permissions.hasPermission &&(
            <LabelSubscription expired={permissions.expired}/>
        )}
     <ServicesList services={services.data || []} permissions={permissions}/>
     </>

    )
}
