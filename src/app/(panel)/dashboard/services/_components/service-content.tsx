import { getAllServices } from "../_data-access/get-all-services";
import { ServicesList } from "./services-list";

interface ServiceContentProps {
    userId: string;
}

export async function ServiceContent({ userId }: ServiceContentProps) {
    const services = await getAllServices({ userId });

    return <ServicesList services={services.data || []} />;
}
