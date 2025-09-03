import { useState, useEffect, useCallback } from 'react';

const CACHE_EXPIRY = 10 * 60 * 1000; // 10분

const useSearchCache = () => {
    const [cache, setCache] = useState(new Map());
    
    // 캐시에서 데이터 조회
    const getFromCache = useCallback((key) => {
        const cached = cache.get(key);
        if (!cached) return null;
        
        // 만료 시간 확인
        if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
            cache.delete(key);
            setCache(new Map(cache));
            return null;
        }
        
        return cached.data;
    }, [cache]);
    
    // 캐시에 데이터 저장
    const setCacheData = useCallback((key, data) => {
        const newCache = new Map(cache);
        newCache.set(key, {
            data,
            timestamp: Date.now()
        });
        setCache(newCache);
    }, [cache]);
    
    // 캐시 키 생성
    const generateCacheKey = useCallback((searchForm) => {
        const keyParts = [
            searchForm.searchKeyword || '',
            searchForm.searchSigungu || '',
            searchForm.searchLegalDong || '',
            searchForm.searchComplexName || '',
            searchForm.propertyType || '',
            (searchForm.transactionTypes || []).join(',') || '',
            searchForm.rentType || ''
        ];
        return keyParts.join('|');
    }, []);
    
    // 캐시 정리 (만료된 항목 제거)
    const cleanupCache = useCallback(() => {
        const now = Date.now();
        const newCache = new Map();
        
        for (const [key, value] of cache.entries()) {
            if (now - value.timestamp <= CACHE_EXPIRY) {
                newCache.set(key, value);
            }
        }
        
        if (newCache.size !== cache.size) {
            setCache(newCache);
        }
    }, [cache]);
    
    // 주기적으로 캐시 정리
    useEffect(() => {
        const interval = setInterval(cleanupCache, 5 * 60 * 1000); // 5분마다
        return () => clearInterval(interval);
    }, [cleanupCache]);
    
    return {
        getFromCache,
        setCacheData,
        generateCacheKey,
        cleanupCache,
        cacheSize: cache.size
    };
};

export default useSearchCache;
