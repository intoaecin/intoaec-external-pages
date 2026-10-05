import { useAxiosWithAuth } from "@/features/hooks/useAxios";
import { useEnv } from "@/features/hooks/useEnv";
import { useEffect, useState, useRef, useCallback } from "react";

interface GetShiftsPayload {
  page?: number;
  rowsPerPage?: number;
  projectId?: string | null;
  generatedShiftId?: string;
  linkedScheduleId?: string;
  linkedScheduleIds?: string[];
  isConvertedToExpense?: boolean;
  mode?: "DAY" | "WEEK" | "MONTH";
  startDate?: number;
  endDate?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  searchTerm?: string;
}

export interface WorkerType {
  organizationWorkerTypeId: string;
  organizationWorkerType: string;
  organizationWorkerTypeDisplayName: string;
  organizationId: string;
  organizationType: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string | null;
}

export interface ShiftWorker {
  shiftWorkerId: string;
  organizationId: string;
  organizationType: string;
  projectId: string;
  projectName: string;
  generatedShiftId: string;
  shiftId: string;
  shiftName: string;
  workerId: string;
  workerName: string;
  workerTypeId: string;
  type: "INDIVIDUAL" | "CONTRACTOR" | "ORGANIZATION_USER";
  organizationUserId: string | null;
  contractorWorkerId: string | null;
  contractorWorkerTypeId: string | null;
  contractorWorkerCount: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string | null;
  workerType: WorkerType;
  attendanceRecords: ShiftAttendanceRecord[];
  contractorWorkerType: WorkerType | null;
}

export interface ShiftAttendanceRecord {
  shiftAttendanceId: string;
  shiftWorkerId: string;
  generatedShiftId: string;
  organizationId: string;
  organizationType: string;
  projectId: string;
  projectName: string;
  shiftWorkerStatus: "PRESENT" | "ABSENT" | "HALF_PRESENT" | "LATE" | "ON_TIME";
  totalWorkedDuration: number;
  overtimeDuration: number | null;
  overtimeDurationType: string | null;
  contractorWorkerPresentCount: number | null;
  contractorWorkerOverTimeCount: number | null;
  contractorWorkerOverTimeDuration: number | null;
  workerRate: number;
  overTimeRate: number;
  workerRateType: string;
  overTimeRateType: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Shift {
  isConvertedToExpense?: boolean;
  convertedWage?: number;
  shiftId: string;
  organizationId: string;
  organizationType: string;
  projectId: string;
  projectName: string;
  shiftName: string;
  startDate: number;
  startTime: number;
  endTime: number;
  shiftDuration: number;
  shiftDurationType: string;
  description: string | null;
  pinLocationId: string | null;
  pinLocationAddress: string | null;
  linkedScheduleId: string | null;
  linkedScheduleName: string | null;
  linkedTaskId: string | null;
  linkedTaskName: string | null;
  shiftColor: string;
  organizationTimezone: string;
  isRecurring: boolean;
  repeatEvery: number;
  repeatUnit: "DAY" | "WEEK" | "MONTH";
  repeatOnDays: string;
  monthlyRecurrenceType: "DAY_OF_WEEK";
  monthlyRecurrenceValue: number | null;
  monthlyRecurrenceWeek: number | null;
  endType: "ON";
  endDate: number;
  endAfterOccurrences: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string | null;
}

export interface GeneratedShift {
  generatedShiftId: string;
  organizationId: string;
  organizationType: string;
  projectId: string;
  projectName: string;
  shiftId: string;
  shiftName: string;
  generatedShiftName: string;
  startDate: number;
  startTime: number;
  endTime: number;
  isConvertedToExpense: boolean;
  convertedToExpenseOn: number | null;
  totalRate: number;
  convertedRate: number;
  notes: string | null;
  generatedShiftDuration: number;
  generatedShiftDurationType: string;
  description: string | null;
  pinLocationId: string | null;
  pinLocationAddress: string | null;
  linkedScheduleId: string | null;
  linkedScheduleName: string | null;
  linkedTaskId: string | null;
  linkedTaskName: string | null;
  generatedShiftColor: string;
  organizationTimezone: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  updatedBy: string | null;
  workers: ShiftWorker[];
  shift: Shift;
}

interface ShiftsResponseBody {
  result: GeneratedShift[];
}

interface ShiftsApiResponse {
  code: string;
  message: string;
  body: ShiftsResponseBody;
}

// Cache interface
interface CacheEntry {
  data: ShiftsResponseBody;
  timestamp: number;
  expiresAt: number;
}

interface Cache {
  [key: string]: CacheEntry;
}

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Global cache instance
let globalCache: Cache = {};
let lastCleanup = Date.now();

// Cache utility functions
const generateCacheKey = (payload: GetShiftsPayload): string => {
  const sortedPayload = Object.keys(payload)
    .sort()
    .reduce((acc, key) => {
      const value = payload[key as keyof GetShiftsPayload];
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

  return `shifts_${JSON.stringify(sortedPayload)}`;
};

const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() < entry.expiresAt;
};

const cleanupExpiredCache = (): void => {
  const now = Date.now();
  if (now - lastCleanup < CACHE_CLEANUP_INTERVAL) return;

  Object.keys(globalCache).forEach((key) => {
    if (!isCacheValid(globalCache[key])) {
      delete globalCache[key];
    }
  });

  lastCleanup = now;
};

const getCachedData = (cacheKey: string): ShiftsResponseBody | null => {
  cleanupExpiredCache();

  const entry = globalCache[cacheKey];
  if (entry && isCacheValid(entry)) {
    return entry.data;
  }

  return null;
};

const setCachedData = (cacheKey: string, data: ShiftsResponseBody): void => {
  globalCache[cacheKey] = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_DURATION,
  };
};

type GeneratedShiftUpdater = (shift: GeneratedShift) => GeneratedShift;
type GeneratedShiftListener = (
  generatedShiftId: string,
  updater: GeneratedShiftUpdater,
) => void;

const generatedShiftListeners = new Set<GeneratedShiftListener>();

const patchShiftList = (
  shifts: GeneratedShift[],
  generatedShiftId: string,
  updater: GeneratedShiftUpdater,
): GeneratedShift[] =>
  shifts.map((shift) =>
    shift.generatedShiftId === generatedShiftId ? updater(shift) : shift,
  );

/**
 * Applies a local change to one generated shift everywhere it is held — the
 * shared response cache and every mounted `useGetShifts` instance — so an
 * edit made in one view (e.g. attendance) survives remounts and shows up in
 * the others without refetching the whole list.
 */
export const patchGeneratedShift = (
  generatedShiftId: string,
  updater: GeneratedShiftUpdater,
): void => {
  Object.values(globalCache).forEach((entry) => {
    entry.data = {
      ...entry.data,
      result: patchShiftList(entry.data.result, generatedShiftId, updater),
    };
  });
  generatedShiftListeners.forEach((listener) =>
    listener(generatedShiftId, updater),
  );
};

export const useGetShifts = (payload: GetShiftsPayload, skip = false) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [data, setData] = useState<GeneratedShift[]>([]);
  const [pagination, setPagination] = useState<{
    totalCount: number;
    pageCount: number;
    currentPage: number;
  }>({
    totalCount: 0,
    pageCount: 0,
    currentPage: 1,
  });
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [error, setError] = useState<any>(null);
  const { NEXT_PUBLIC_PROCUREMENT_ENDPOINT } = useEnv();
  const { post: workerManagementApi } = useAxiosWithAuth(
    NEXT_PUBLIC_PROCUREMENT_ENDPOINT + "/worker-management"
  );

  const isMountedRef = useRef(true);

  const getShifts = useCallback(
    async (forceRefresh = false, loadMore = false) => {
      const cacheKey = generateCacheKey(payload);

      // Check cache first (unless force refresh is requested or loading more)
      if (!forceRefresh && !loadMore) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setData(cachedData.result);
          // Since cached data doesn't have pagination metadata, estimate it
          const estimatedTotalCount = cachedData.result.length;
          setPagination({
            totalCount: estimatedTotalCount,
            pageCount: Math.ceil(estimatedTotalCount / (payload.rowsPerPage || 10)),
            currentPage: payload.page || 1,
          });
          setError(null);
          return;
        }
      }

      const request = {
        eventType: "GET_GENERATED_SHIFTS",
        ...payload,
      };

      try {
        if (loadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);
        const res: ShiftsApiResponse = await workerManagementApi(request);

        if (res.code === "GENERATED_SHIFTS_FOUND") {
          // Only update state if component is still mounted
          if (isMountedRef.current) {
            if (loadMore) {
              // Append new data to existing data
              setData((prevData) => [...prevData, ...res.body.result]);
            } else {
              // Replace data for new search/filter
              setData(res.body.result);
            }
            // Since the API doesn't provide pagination metadata, we'll estimate based on data length
            const estimatedTotalCount = res.body.result.length;
            setPagination({
              totalCount: estimatedTotalCount,
              pageCount: Math.ceil(estimatedTotalCount / (payload.rowsPerPage || 10)),
              currentPage: payload.page || 1,
            });
          }

          // Cache the successful response (only for initial loads, not load more)
          if (!loadMore) {
            setCachedData(cacheKey, res.body);
          }
        } else {
          throw new Error(res?.code || "Something went wrong");
        }
      } catch (error: any) {
        if (isMountedRef.current) {
          if (error instanceof Error) {
            console.error("Error getting shifts:", error.message);
            setError(error.message);
          } else {
            console.error("Unknown error:", error);
            setError("An unknown error occurred");
          }
        }
      } finally {
        if (isMountedRef.current) {
          if (loadMore) {
            setIsLoadingMore(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    },
    [payload, workerManagementApi]
  );

  // Force refresh function
  const refetch = useCallback(() => {
    return getShifts(true);
  }, [getShifts]);

  // Main effect to handle all payload and pagination changes (include skip so we fetch when skip becomes false)
  useEffect(() => {
    if (isMountedRef.current && !skip) {
      getShifts(false, false);
    }
  }, [
    skip,
    payload.projectId,
    payload.generatedShiftId,
    payload.linkedScheduleId,
    payload.linkedScheduleIds?.join(","),
    payload.isConvertedToExpense,
    payload.mode,
    payload.startDate,
    payload.endDate,
    payload.sortBy,
    payload.sortOrder,
    payload.page,
    payload.rowsPerPage,
    rowsPerPage,
    pagination.currentPage,
    payload.searchTerm,
  ]);

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    // Only load more if we're not already loading and there are more pages
    if (
      !isLoadingMore &&
      !isLoading &&
      pagination.currentPage < pagination.pageCount
    ) {
      // Create a new payload with the next page
      const nextPagePayload = {
        ...payload,
        page: (payload.page || 1) + 1,
      };

      // Call the API with the next page payload
      const request = {
        eventType: "GET_GENERATED_SHIFTS",
        ...nextPagePayload,
      };

      return workerManagementApi(request)
        .then((res: ShiftsApiResponse) => {
          if (res.code === "GENERATED_SHIFTS_FOUND" && isMountedRef.current) {
            // Append new data to existing data
            setData((prevData) => [...prevData, ...res.body.result]);
            // Update pagination based on current data length
            setPagination(prevPagination => ({
              ...prevPagination,
              currentPage: prevPagination.currentPage + 1,
            }));
          }
        })
        .catch((error: any) => {
          if (isMountedRef.current) {
            console.error("Error loading more shifts:", error);
            setError(error.message || "Failed to load more shifts");
          }
        })
        .finally(() => {
          if (isMountedRef.current) {
            setIsLoadingMore(false);
          }
        });
    }
  }, [
    workerManagementApi,
    isLoadingMore,
    isLoading,
    pagination.currentPage,
    pagination.pageCount,
    payload,
  ]);

  // Clear cache for specific payload
  const clearCache = useCallback(() => {
    const cacheKey = generateCacheKey(payload);
    delete globalCache[cacheKey];
  }, [payload]);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    globalCache = {};
    lastCleanup = Date.now();
  }, []);

  // Reset in-memory data for this hook instance
  const reset = useCallback(() => {
    setData([]);
    setPagination({ totalCount: 0, pageCount: 0, currentPage: 1 });
    setError(null);
  }, []);

  useEffect(() => {
    const listener: GeneratedShiftListener = (generatedShiftId, updater) => {
      setData((previous) => patchShiftList(previous, generatedShiftId, updater));
    };
    generatedShiftListeners.add(listener);

    return () => {
      generatedShiftListeners.delete(listener);
    };
  }, []);

  // Component mount/unmount effect
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    pagination,
    setPagination,
    isLoading,
    isLoadingMore,
    error,
    refetch,
    loadMore,
    clearCache,
    clearAllCache,
    reset,
    hasMore: pagination.currentPage < pagination.pageCount,
  };
};

// Export cache utilities for external use
export const shiftCacheUtils = {
  clearAllCache: () => {
    globalCache = {};
    lastCleanup = Date.now();
  },
  getCacheStats: () => {
    cleanupExpiredCache();
    const keys = Object.keys(globalCache);
    return {
      totalEntries: keys.length,
      cacheKeys: keys,
    };
  },
};
