import Link from "next/link";

export function LabelSubscription({ expired }: { expired: boolean }) {
  return (
    <div className="my-4 flex justify-between gap-1 rounded-md bg-red-400 px-3 py-2 text-white md:items-center">
      <div>
        {expired ? (
          <h3 className="font-semibold">
            Seu plano está expirado ou você não tem um plano ativo
          </h3>
        ) : (
          <h3>Você excedeu o limite de serviços</h3>
        )}

        <p className="text-sm text-gray-100">
          Acesse o painel de planos para selecionar um plano
        </p>
      </div>

      <Link
        href="/dashboard/plans"
        className="text-white hover:text-gray-300"
      >
        Selecione um plano
      </Link>
    </div>
  );
}
