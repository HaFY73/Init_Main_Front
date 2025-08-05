'use client';
import GlobalSidebar from "@/components/GlobalSidebar/GlobalSidebar"
import SpecManagementView from "./spec-management-view"

export default function SpecManagementPage() {
  return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <GlobalSidebar />
        <main className="flex-1 overflow-x-hidden">
          <SpecManagementView />
        </main>
      </div>
  )
}