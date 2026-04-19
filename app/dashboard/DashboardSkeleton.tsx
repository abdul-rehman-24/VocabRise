import Navbar from '@/app/components/shared/Navbar'

export default function DashboardSkeleton() {
  const shimmerStyle = {
    background: 'linear-gradient(90deg, #1a1a2e 25%, #2a2a3e 50%, #1a1a2e 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeletonShimmer 1.5s infinite',
  };

  return (
    <div className="bg-[#0D0B1A] min-h-screen overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}} />
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <div className="h-5 w-32 rounded-md mb-3" style={shimmerStyle}></div>
          <div className="flex gap-4 mb-6">
            <div className="h-12 w-64 rounded-xl" style={shimmerStyle}></div>
            <div className="h-8 w-48 rounded-full hidden md:block" style={shimmerStyle}></div>
          </div>
          <div className="h-4 w-72 rounded-md" style={shimmerStyle}></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl border border-white/5" style={shimmerStyle}></div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-8 w-48 rounded-md mb-6" style={shimmerStyle}></div>
            <div className="h-80 rounded-[2rem] border border-white/5" style={shimmerStyle}></div>
          </div>
          <div>
            <div className="h-8 w-32 rounded-md mb-6" style={shimmerStyle}></div>
            <div className="h-80 rounded-[2rem] border border-white/5" style={shimmerStyle}></div>
          </div>
        </div>
      </main>
    </div>
  )
}
