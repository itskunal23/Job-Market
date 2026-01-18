import HeaderGreeting from '@/components/HeaderGreeting'
import KPIBar from '@/components/KPIBar'
import JobCard from '@/components/JobCard'
import StatusLedger from '@/components/StatusLedger'
import { getMarketInsight, getMockJobs } from '@/lib/mockData'

export default async function Home() {
  const marketInsight = await getMarketInsight()
  const jobs = await getMockJobs()

  // Extract vitals from market insight
  const hiringVelocity = marketInsight.hiringChange
  const ghostingRate = marketInsight.ghostingChange
  const impactPoints = 127 // This would come from user data

  return (
    <main className="min-h-screen pb-20 bg-latte">
      {/* Full-Width Container */}
      <div className="w-full px-8 max-w-[1920px] mx-auto pt-8">
        {/* Header Section - Full Width */}
        <HeaderGreeting />

        {/* KPI Bar - Full Width Horizontal */}
        <KPIBar
          impactPoints={impactPoints}
          hiringVelocity={hiringVelocity}
          ghostingRate={ghostingRate}
        />

        {/* Main Content - Two Column Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Active Matches (66% width = col-span-8) */}
          <div className="col-span-12 lg:col-span-8">
            <h2 className="text-2xl font-semibold text-espresso mb-6 font-serif">
              Active Matches
            </h2>
            <div className="space-y-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>

          {/* Right Column: Status Ledger (33% width = col-span-4) - Sticky Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-8">
              <StatusLedger />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
