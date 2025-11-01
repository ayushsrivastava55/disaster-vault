import { VaultCreator } from "../../components/VaultCreator"

export const metadata = {
  title: "Create vault · DisasterVault"
}

export default function CreatePage() {
  return (
    <section className="py-12">
      <h1 className="text-3xl font-semibold text-white">Create a disaster response vault</h1>
      <p className="mt-3 max-w-2xl text-slate-300">
        Connect your Flow wallet, deposit FLOW, and set the trigger parameters for automated Red Cross donations. The
        scheduled transaction workflow checks new events every six hours.
      </p>
      <div className="mt-10">
        <VaultCreator />
      </div>
    </section>
  )
}
