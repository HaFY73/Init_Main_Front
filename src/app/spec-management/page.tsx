'use client';
import GlobalSidebar from "@/components/GlobalSidebar/GlobalSidebar"
import SpecManagementView from "./spec-management-view"

export default function SpecManagementPage() {
  return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <GlobalSidebar />
        {/* 사이드바 여백을 고려한 메인 컨텐츠 영역 */}
        <main className="flex-1 ml-0 md:ml-280 transition-all duration-300 ease-in-out overflow-x-hidden">
          <SpecManagementView />
        </main>
      </div>
  )
}