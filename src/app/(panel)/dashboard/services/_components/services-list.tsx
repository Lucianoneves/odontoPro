"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import { DialogService } from "./dialog-service";
import type { Service } from "@/generated/prisma/client";
import { formatCurrency } from "@/utils/formatCurrency";
import { deleteService } from "../_actions/delete-service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { ResultPermissionProps } from "@/utils/permissions/canPermission";

interface ServicesListProps {
  services: Service[];
  permissions: ResultPermissionProps;
}

export function ServicesList({ services, permissions }: ServicesListProps) {
  const router = useRouter();
  const [editingService, setEditingService] = useState<Service | undefined>(
    undefined
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const maxServices = permissions.plan?.maxServices ?? 3;
  const visibleServices = services.slice(0, maxServices);
  const excessServices = services.slice(maxServices);
  const isOverLimit = excessServices.length > 0;

  async function handleDeleteService(serviceId: string) {
    const response = await deleteService({ serviceId });

    if (response.error) {
      toast.error(response.error);
      return;
    }

    toast.success(response.data);
    router.refresh();
  }

  function handleEditService(service: Service) {
    setEditingService(service);
    setIsDialogOpen(true);
  }

  function handleNewService() {
    setEditingService(undefined);
    setIsDialogOpen(true);
  }

  function handleDialogChange(open: boolean) {
    setIsDialogOpen(open);
    if (!open) {
      setEditingService(undefined);
    }
  }

  const initialValues = editingService
    ? {
        name: editingService.name,
        price: (editingService.price / 100).toFixed(2).replace(".", ","),
        hours: Math.floor(editingService.duration / 60).toString(),
        minutes: (editingService.duration % 60).toString(),
      }
    : undefined;

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingService(undefined);
        }
      }}
    >
      <section className="mx-auto space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-2xl font-bold md:text-3xl">
                Lista de serviços
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {visibleServices.length} de {maxServices} no seu plano
              </p>
            </div>
            {permissions.hasPermission && (
              <Button type="button" size="icon" onClick={handleNewService}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>

          {!permissions.hasPermission && (
            <div className="px-6 pb-2">
              <Link
                href="/dashboard/plans"
                className="text-sm font-medium text-red-500 hover:underline"
              >
                Limite de {maxServices} serviços atingido — veja os planos
              </Link>
            </div>
          )}

          <CardContent className="space-y-3">
            {visibleServices.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum serviço cadastrado.
              </p>
            )}

            {visibleServices.map((service) => (
              <article
                key={service.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-gray-400">
                      {formatCurrency(service.price / 100)}
                    </span>
                    <span> - {service.duration}</span> min
                  </p>
                </div>
                <div>
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => handleEditService(service)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    size="icon"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            ))}
          </CardContent>
        </Card>

        {isOverLimit && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-600">
                Serviços acima do limite do plano
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Seu plano permite {maxServices} serviços. Exclua os extras ou{" "}
                <Link
                  href="/dashboard/plans"
                  className="font-medium text-red-500 hover:underline"
                >
                  faça upgrade
                </Link>
                .
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {excessServices.map((service) => (
                <article
                  key={service.id}
                  className="flex items-center justify-between opacity-70"
                >
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-gray-400">
                        {formatCurrency(service.price / 100)}
                      </span>
                      <span> - {service.duration}</span> min
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </article>
              ))}
            </CardContent>
          </Card>
        )}

        <DialogContent>
          <DialogService
            key={editingService?.id ?? "new"}
            closeModal={() => handleDialogChange(false)}
            serviceId={editingService?.id}
            initialValues={initialValues}
          />
        </DialogContent>
      </section>
    </Dialog>
  );
}
