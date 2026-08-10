import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";
import ActivityCard from "../components/ActivityCard";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">

        <div>
          <h1 className="text-4xl font-bold text-white">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-400">
            Willkommen zurück 👋
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <StatCard title="Posts erstellt" value="128" />
          <StatCard title="KI Bilder" value="347" />
          <StatCard title="Geplante Beiträge" value="24" />
          <StatCard title="Follower" value="18.4k" />
        </div>

        <div className="grid grid-cols-3 gap-6">

          <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              Letzte Aktivitäten
            </h2>

            <div className="space-y-4">
              <ActivityCard title="Beitrag erstellt" subtitle="Instagram · BerlinBrick" />
              <ActivityCard title="Bild generiert" subtitle="Content Studio" />
              <ActivityCard title="Beitrag geplant" subtitle="Facebook · Cat-2-Go" />
              <ActivityCard title="Kampagne erstellt" subtitle="Content Studio" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              KI Assistent
            </h2>

            <textarea
              className="h-56 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none"
              placeholder="Beschreibe deinen Beitrag..."
            />

            <button className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 transition">
              Generieren
            </button>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
