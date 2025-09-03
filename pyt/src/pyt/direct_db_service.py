#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
직접 데이터베이스 연결 서비스
Flask 서버에서 직접 MariaDB/MySQL에 연결하여 부동산 데이터 조회
"""

import pymysql
import os
from typing import Dict, List, Any, Optional
from datetime import datetime

class DirectDatabaseService:
    """직접 데이터베이스 서비스 클래스"""
    
    def __init__(self):
        # 데이터베이스 연결 설정
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'user': os.getenv('DB_USER', 'yonguser1'),
            'password': os.getenv('DB_PASSWORD', 'yonguser1'),
            'database': os.getenv('DB_NAME', 'yong_db'),
            'charset': 'utf8mb4',
            'cursorclass': pymysql.cursors.DictCursor
        }
        
        self.connection = None
        self.test_connection()
    
    def test_connection(self) -> bool:
        """데이터베이스 연결 테스트"""
        try:
            self.connection = pymysql.connect(**self.db_config)
            print("✅ 데이터베이스 직접 연결 성공")
            return True
        except Exception as e:
            print(f"❌ 데이터베이스 직접 연결 실패: {str(e)}")
            return False
    
    def get_connection(self):
        """데이터베이스 연결 반환"""
        try:
            if not self.connection or not self.connection.open:
                self.connection = pymysql.connect(**self.db_config)
            return self.connection
        except Exception as e:
            print(f"데이터베이스 연결 오류: {str(e)}")
            return None
    
    def get_apartments(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """아파트 목록 조회"""
        try:
            conn = self.get_connection()
            if not conn:
                return []
            
            with conn.cursor() as cursor:
                # 기본 쿼리
                query = """
                SELECT 
                    id, name, location, price, area, rooms, bathrooms, 
                    built_year, description, created_at
                FROM properties 
                WHERE 1=1
                """
                params = []
                
                # 필터 적용
                if filters:
                    if 'location' in filters and filters['location']:
                        query += " AND location LIKE %s"
                        params.append(f"%{filters['location']}%")
                    
                    if 'price_min' in filters and filters['price_min']:
                        query += " AND CAST(REPLACE(REPLACE(price, '억', ''), '천만원', '000') AS UNSIGNED) >= %s"
                        params.append(filters['price_min'])
                    
                    if 'price_max' in filters and filters['price_max']:
                        query += " AND CAST(REPLACE(REPLACE(price, '억', ''), '천만원', '000') AS UNSIGNED) <= %s"
                        params.append(filters['price_max'])
                    
                    if 'area_min' in filters and filters['area_min']:
                        query += " AND CAST(REPLACE(area, '평', '') AS UNSIGNED) >= %s"
                        params.append(filters['area_min'])
                    
                    if 'area_max' in filters and filters['area_max']:
                        query += " AND CAST(REPLACE(area, '평', '') AS UNSIGNED) <= %s"
                        params.append(filters['area_max'])
                
                query += " ORDER BY created_at DESC LIMIT 20"
                
                cursor.execute(query, params)
                result = cursor.fetchall()
                
                # 결과 처리
                apartments = []
                for row in result:
                    apartment = {
                        'id': row['id'],
                        'name': row['name'] or 'N/A',
                        'location': row['location'] or 'N/A',
                        'price': row['price'] or 'N/A',
                        'area': row['area'] or 'N/A',
                        'rooms': row['rooms'] or 0,
                        'bathrooms': row['bathrooms'] or 0,
                        'built_year': row['built_year'] or 'N/A',
                        'description': row['description'] or 'N/A'
                    }
                    apartments.append(apartment)
                
                return apartments
                
        except Exception as e:
            print(f"아파트 조회 오류: {str(e)}")
            return []
    
    def get_apartment_by_id(self, apartment_id: str) -> Optional[Dict[str, Any]]:
        """특정 아파트 상세 정보 조회"""
        try:
            conn = self.get_connection()
            if not conn:
                return None
            
            with conn.cursor() as cursor:
                query = """
                SELECT 
                    id, name, location, price, area, rooms, bathrooms, 
                    built_year, description, created_at
                FROM properties 
                WHERE id = %s
                """
                
                cursor.execute(query, (apartment_id,))
                result = cursor.fetchone()
                
                if result:
                    return {
                        'id': result['id'],
                        'name': result['name'] or 'N/A',
                        'location': result['location'] or 'N/A',
                        'price': result['price'] or 'N/A',
                        'area': result['area'] or 'N/A',
                        'rooms': result['rooms'] or 0,
                        'bathrooms': result['bathrooms'] or 0,
                        'built_year': result['built_year'] or 'N/A',
                        'description': result['description'] or 'N/A'
                    }
                
                return None
                
        except Exception as e:
            print(f"아파트 상세 조회 오류: {str(e)}")
            return None
    
    def search_apartments(self, keyword: str) -> List[Dict[str, Any]]:
        """키워드로 아파트 검색"""
        try:
            conn = self.get_connection()
            if not conn:
                return []
            
            with conn.cursor() as cursor:
                query = """
                SELECT 
                    id, name, location, price, area, rooms, bathrooms, 
                    built_year, description, created_at
                FROM properties 
                WHERE name LIKE %s OR location LIKE %s OR description LIKE %s
                ORDER BY created_at DESC
                LIMIT 15
                """
                
                search_term = f"%{keyword}%"
                cursor.execute(query, (search_term, search_term, search_term))
                result = cursor.fetchall()
                
                apartments = []
                for row in result:
                    apartment = {
                        'id': row['id'],
                        'name': row['name'] or 'N/A',
                        'location': row['location'] or 'N/A',
                        'price': row['price'] or 'N/A',
                        'area': row['area'] or 'N/A',
                        'rooms': row['rooms'] or 0,
                        'bathrooms': row['bathrooms'] or 0,
                        'built_year': row['built_year'] or 'N/A',
                        'description': row['description'] or 'N/A'
                    }
                    apartments.append(apartment)
                
                return apartments
                
        except Exception as e:
            print(f"아파트 검색 오류: {str(e)}")
            return []
    
    def get_market_trends(self, location: str = None) -> Dict[str, Any]:
        """부동산 시장 동향 조회"""
        try:
            conn = self.get_connection()
            if not conn:
                return {}
            
            with conn.cursor() as cursor:
                if location:
                    query = """
                    SELECT 
                        location, avg_price, price_change, market_trend, updated_at
                    FROM market_trends 
                    WHERE location LIKE %s
                    ORDER BY updated_at DESC
                    LIMIT 5
                    """
                    cursor.execute(query, (f"%{location}%",))
                else:
                    query = """
                    SELECT 
                        location, avg_price, price_change, market_trend, updated_at
                    FROM market_trends 
                    ORDER BY updated_at DESC
                    LIMIT 10
                    """
                    cursor.execute(query)
                
                result = cursor.fetchall()
                
                trends = {}
                for row in result:
                    trends[row['location']] = {
                        'avg_price': row['avg_price'] or 'N/A',
                        'price_change': row['price_change'] or 'N/A',
                        'market_trend': row['market_trend'] or 'N/A',
                        'updated_at': row['updated_at'].isoformat() if row['updated_at'] else 'N/A'
                    }
                
                return trends
                
        except Exception as e:
            print(f"시장 동향 조회 오류: {str(e)}")
            return {}
    
    def get_recent_transactions(self, location: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """최근 실거래 정보 조회"""
        try:
            conn = self.get_connection()
            if not conn:
                return []
            
            with conn.cursor() as cursor:
                if location:
                    query = """
                    SELECT 
                        id, property_name, location, transaction_price, 
                        transaction_date, area, transaction_type
                    FROM transactions 
                    WHERE location LIKE %s
                    ORDER BY transaction_date DESC
                    LIMIT %s
                    """
                    cursor.execute(query, (f"%{location}%", limit))
                else:
                    query = """
                    SELECT 
                        id, property_name, location, transaction_price, 
                        transaction_date, area, transaction_type
                    FROM transactions 
                    ORDER BY transaction_date DESC
                    LIMIT %s
                    """
                    cursor.execute(query, (limit,))
                
                result = cursor.fetchall()
                
                transactions = []
                for row in result:
                    transaction = {
                        'id': row['id'],
                        'property_name': row['property_name'] or 'N/A',
                        'location': row['location'] or 'N/A',
                        'transaction_price': row['transaction_price'] or 'N/A',
                        'transaction_date': row['transaction_date'].isoformat() if row['transaction_date'] else 'N/A',
                        'area': row['area'] or 'N/A',
                        'transaction_type': row['transaction_type'] or 'N/A'
                    }
                    transactions.append(transaction)
                
                return transactions
                
        except Exception as e:
            print(f"실거래 정보 조회 오류: {str(e)}")
            return []
    

    
    def close_connection(self):
        """데이터베이스 연결 종료"""
        try:
            if self.connection and self.connection.open:
                self.connection.close()
        except Exception as e:
            print(f"데이터베이스 연결 종료 오류: {str(e)}") 