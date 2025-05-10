'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { PageLoader } from '@/components/ui/page-loader'

interface PageTransitionProviderProps {
  children: React.ReactNode
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [previousPathname, setPreviousPathname] = useState<string | null>(null)
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null)

  // Handle route changes
  useEffect(() => {
    // Only show loader if the path has changed (not just search params)
    if (previousPathname && previousPathname !== pathname) {
      setIsLoading(true)
      
      // Set a minimum display time for the loader (prevents flashing)
      const timeout = setTimeout(() => {
        setIsLoading(false)
      }, 1200) // Minimum display time in ms
      
      setLoadingTimeout(timeout)
    }
    
    // Update previous pathname
    setPreviousPathname(pathname)
    
    // Cleanup timeout
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
    }
  }, [pathname, searchParams, previousPathname, loadingTimeout])

  // Determine loading message based on the route
  const getLoadingMessage = () => {
    if (pathname.includes('/client/dashboard')) {
      return 'Preparing your dashboard...'
    } else if (pathname.includes('/client/services')) {
      return 'Loading services...'
    } else if (pathname.includes('/client/orders')) {
      return 'Fetching your orders...'
    } else if (pathname.includes('/client/profile')) {
      return 'Loading your profile...'
    } else if (pathname.includes('/auth')) {
      return 'Preparing authentication...'
    }
    return 'Loading, please wait...'
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <PageLoader 
            variant="gradient" 
            text={getLoadingMessage()}
          />
        )}
      </AnimatePresence>
      
      {children}
    </>
  )
} 