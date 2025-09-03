import React, { useState, useEffect } from 'react';
import { searchStatisticsApi } from '../api/searchStatisticsApi';

const SearchRankingComponent = () => {
    const [rankingData, setRankingData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchRankingData = async (isManualRefresh = false) => {
        setLoading(true);
        try {
            const data = await searchStatisticsApi.getTopSearches();
            
            // 5위까지만 표시
            const top5Data = data.slice(0, 5);
            setRankingData(top5Data);
            setLastUpdated(new Date());
            
            // 수동 새로고침인 경우 성공 메시지 표시
            if (isManualRefresh) {
                console.log('검색 순위 새로고침 완료');
            }
        } catch (error) {
            console.error('검색 순위 조회 실패:', error);
            // 수동 새로고침인 경우 에러 메시지 표시
            if (isManualRefresh) {
                alert('새로고침 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRankingData();
        
        // 15초마다 자동 업데이트
        const interval = setInterval(() => {
            fetchRankingData();
        }, 15 * 1000);
        
        return () => clearInterval(interval);
    }, []);



    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-800">인기 검색어 순위</h3>
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                        loading ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-xs text-gray-500">
                        {loading ? '업데이트 중...' : '실시간'}
                    </span>
                </div>
            </div>

            {/* 검색 순위 목록 */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-xs text-gray-500 mt-2">순위 업데이트 중...</p>
                    </div>
                ) : rankingData.length > 0 ? (
                    rankingData.map((item, index) => (
                        <div
                            key={`${item.searchKeyword}-${item.searchType}`}
                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-base font-bold text-gray-600 min-w-[40px]">
                                {index + 1}.
                            </span>
                            <div className="text-sm font-medium text-gray-900 overflow-hidden whitespace-nowrap relative">
                                <span className="truncate block">{item.searchKeyword}</span>
                                <div 
                                    className="absolute px-3 py-2 bg-red-500 text-white text-xs rounded-lg pointer-events-none whitespace-nowrap z-50 shadow-lg max-w-xs break-words"
                                    style={{
                                        position: 'absolute',
                                        top: '-40px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        pointerEvents: 'none',
                                        whiteSpace: 'nowrap',
                                        zIndex: 50,
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        maxWidth: '320px',
                                        wordBreak: 'break-word',
                                        display: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        console.log('Mouse enter');
                                        e.target.style.display = 'block';
                                    }}
                                    onMouseLeave={(e) => {
                                        console.log('Mouse leave');
                                        e.target.style.display = 'none';
                                    }}
                                >
                                    {item.searchKeyword}
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 0,
                                        height: 0,
                                        borderLeft: '4px solid transparent',
                                        borderRight: '4px solid transparent',
                                        borderTop: '4px solid #ef4444'
                                    }}></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-xs text-gray-500">
                        검색 데이터가 없습니다.
                    </div>
                )}
            </div>

            {/* 마지막 업데이트 시간 */}
            {lastUpdated && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-400">
                        마지막 업데이트: {lastUpdated.toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        })}
                    </p>
                </div>
            )}

            {/* 수동 새로고침 버튼 */}
            <button
                onClick={() => fetchRankingData(true)}
                disabled={loading}
                className="w-full mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors text-xs font-medium flex items-center justify-center space-x-2"
            >
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                        <span>업데이트 중...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>새로고침</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default SearchRankingComponent;
