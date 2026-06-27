import { useCallback, useEffect, useRef, useState } from "react"
import axios from "axios"

import { getCourts, getFeaturedVenues, getSports } from "@/features/home/home-api"
import type { Court, CourtFilters, Sport, Venue } from "@/types/public-api"

type ResourceState<T> = {
  data: T
  isLoading: boolean
  error: string | null
}

const emptyResource = <T,>(data: T): ResourceState<T> => ({
  data,
  isLoading: true,
  error: null,
})

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? "Không thể kết nối đến máy chủ."
  }

  return error instanceof Error ? error.message : "Đã có lỗi xảy ra."
}

export function useHomeDiscovery() {
  const [sports, setSports] = useState<ResourceState<Sport[]>>(emptyResource([]))
  const [venues, setVenues] = useState<ResourceState<Venue[]>>(emptyResource([]))
  const [courts, setCourts] = useState<ResourceState<Court[]>>(emptyResource([]))
  const courtRequest = useRef<AbortController | null>(null)

  const loadSports = useCallback(async (signal?: AbortSignal) => {
    setSports((current) => ({ ...current, isLoading: true, error: null }))
    try {
      const data = await getSports(signal)
      setSports({ data, isLoading: false, error: null })
    } catch (error) {
      if (!axios.isCancel(error)) {
        setSports({ data: [], isLoading: false, error: getErrorMessage(error) })
      }
    }
  }, [])

  const loadVenues = useCallback(async (signal?: AbortSignal) => {
    setVenues((current) => ({ ...current, isLoading: true, error: null }))
    try {
      const response = await getFeaturedVenues(signal)
      setVenues({ data: response.items, isLoading: false, error: null })
    } catch (error) {
      if (!axios.isCancel(error)) {
        setVenues({ data: [], isLoading: false, error: getErrorMessage(error) })
      }
    }
  }, [])

  const loadCourts = useCallback(async (filters: CourtFilters = {}) => {
    courtRequest.current?.abort()
    const controller = new AbortController()
    courtRequest.current = controller
    setCourts((current) => ({ ...current, isLoading: true, error: null }))

    try {
      const response = await getCourts(filters, controller.signal)
      setCourts({ data: response.items, isLoading: false, error: null })
    } catch (error) {
      if (!axios.isCancel(error)) {
        setCourts({ data: [], isLoading: false, error: getErrorMessage(error) })
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const initialCourtRequest = new AbortController()
    courtRequest.current = initialCourtRequest

    void getSports(controller.signal)
      .then((data) => setSports({ data, isLoading: false, error: null }))
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setSports({ data: [], isLoading: false, error: getErrorMessage(error) })
        }
      })

    void getFeaturedVenues(controller.signal)
      .then((response) => setVenues({ data: response.items, isLoading: false, error: null }))
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setVenues({ data: [], isLoading: false, error: getErrorMessage(error) })
        }
      })

    void getCourts({}, initialCourtRequest.signal)
      .then((response) => setCourts({ data: response.items, isLoading: false, error: null }))
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setCourts({ data: [], isLoading: false, error: getErrorMessage(error) })
        }
      })

    return () => {
      controller.abort()
      courtRequest.current?.abort()
    }
  }, [])

  return {
    sports,
    venues,
    courts,
    searchCourts: loadCourts,
    retrySports: loadSports,
    retryVenues: loadVenues,
    retryCourts: loadCourts,
  }
}
