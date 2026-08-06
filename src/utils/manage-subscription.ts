import prisma from "@/lib/prisma";
import { stripe } from "@/utils/stripe";
import { Plan } from "@/generated/prisma/client";

/**
 * Salvar, atualizar ou deletar informações das assinaturas no banco de dados
 */
export async function manageSubscription(
  subscriptionId: string,
  customerId: string,
  _createAction = false,
  deleteAction = false,
  type?: Plan,
  userId?: string
) {
  // Cancelamento: apaga pelo ID da assinatura mesmo se o user não for encontrado
  if (subscriptionId && deleteAction) {
    const findUser = await prisma.user.findFirst({
      where: userId
        ? { OR: [{ stripe_customer_id: customerId }, { id: userId }] }
        : { stripe_customer_id: customerId },
    });

    await prisma.subscription.deleteMany({
      where: findUser
        ? { OR: [{ id: subscriptionId }, { userId: findUser.id }] }
        : { id: subscriptionId },
    });
    return;
  }

  const findUser = await prisma.user.findFirst({
    where: userId
      ? { OR: [{ stripe_customer_id: customerId }, { id: userId }] }
      : { stripe_customer_id: customerId },
  });

  if (!findUser) {
    console.error("Usuário não encontrado para assinatura", {
      customerId,
      userId,
      subscriptionId,
    });
    return;
  }

  if (findUser.stripe_customer_id !== customerId) {
    await prisma.user.update({
      where: { id: findUser.id },
      data: { stripe_customer_id: customerId },
    });
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const inactiveStatuses = new Set([
    "canceled",
    "unpaid",
    "incomplete_expired",
  ]);

  if (inactiveStatuses.has(subscription.status)) {
    await prisma.subscription.deleteMany({
      where: {
        OR: [{ id: subscriptionId }, { userId: findUser.id }],
      },
    });
    return;
  }

  const subscriptionData = {
    id: subscription.id,
    userId: findUser.id,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    plan: type ?? "BASIC",
  };

  const existingByUser = await prisma.subscription.findUnique({
    where: { userId: findUser.id },
  });

  try {
    if (existingByUser) {
      if (existingByUser.id !== subscription.id) {
        await prisma.subscription.delete({
          where: { userId: findUser.id },
        });
        await prisma.subscription.create({
          data: subscriptionData,
        });
      } else {
        await prisma.subscription.update({
          where: { userId: findUser.id },
          data: {
            status: subscription.status,
            priceId: subscription.items.data[0].price.id,
            plan: type ?? existingByUser.plan ?? "BASIC",
          },
        });
      }
      return;
    }

    await prisma.subscription.create({
      data: subscriptionData,
    });
  } catch (error) {
    console.error("Falha ao salvar assinatura no banco", error);
    throw error;
  }
}
