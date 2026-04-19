'use client'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
}

export default function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="p-6 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
          {icon}
        </div>
      </div>
      {trend && <p className="text-xs text-green-600 font-medium">{trend}</p>}
    </div>
  )
}
