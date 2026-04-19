'use client'

import dynamic from 'next/dynamic'
import DashboardSkeleton from './DashboardSkeleton'

const Dashboard = dynamic(() => import('./Dashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false
})

export default function DashboardPage() {
  return <Dashboard />
}