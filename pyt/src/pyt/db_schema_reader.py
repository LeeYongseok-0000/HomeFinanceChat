#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
데이터베이스 스키마 리더
실제 데이터베이스의 테이블 구조를 파악하고 동적으로 쿼리 생성
"""

import pymysql
import os
from typing import Dict, List, Any, Optional
from datetime import datetime

class DatabaseSchemaReader:
    """데이터베이스 스키마 리더 클래스"""
    
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
        self.schema_info = {}
        self.test_connection()
    
    def test_connection(self) -> bool:
        """데이터베이스 연결 테스트"""
        try:
            self.connection = pymysql.connect(**self.db_config)
            print("✅ 데이터베이스 직접 연결 성공")
            self.read_schema()
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
    
    def read_schema(self):
        """데이터베이스 스키마 정보 읽기"""
        try:
            conn = self.get_connection()
            if not conn:
                return
            
            with conn.cursor() as cursor:
                # 모든 테이블 목록 조회
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                
                print(f"📊 발견된 테이블: {len(tables)}개")
                
                for table_info in tables:
                    table_name = list(table_info.values())[0]
                    print(f"  - {table_name}")
                    
                    # 테이블 구조 조회
                    cursor.execute(f"DESCRIBE {table_name}")
                    columns = cursor.fetchall()
                    
                    self.schema_info[table_name] = {
                        'columns': columns,  # 원본 컬럼 정보 (dict 형태)
                        'column_names': [col['Field'] for col in columns],  # 컬럼명 리스트
                        'column_types': {col['Field']: col['Type'] for col in columns},  # 컬럼명:타입 매핑
                        'primary_key': [col['Field'] for col in columns if col['Key'] == 'PRI']
                    }
                    
                    print(f"    컬럼: {', '.join(self.schema_info[table_name]['column_names'])}")
                    
        except Exception as e:
            print(f"스키마 읽기 오류: {str(e)}")
    

    
    def _convert_value_for_json(self, value):
        """JSON 직렬화를 위한 값 변환"""
        if value is None:
            return None
        elif isinstance(value, datetime):
            return value.isoformat()
        elif isinstance(value, bytes):
            try:
                # bytes를 UTF-8 문자열로 변환 시도
                return value.decode('utf-8')
            except UnicodeDecodeError:
                try:
                    # UTF-8 실패 시 다른 인코딩 시도
                    return value.decode('latin-1')
                except:
                    # 모든 변환 실패 시 hex 문자열로 변환
                    return value.hex()
        elif isinstance(value, (int, float, str, bool)):
            return value
        else:
            # 기타 타입은 문자열로 변환
            return str(value)
    
    def get_all_tables_data(self) -> Dict[str, Any]:
        """모든 테이블의 데이터 조회"""
        try:
            if not self.schema_info:
                print("⚠️ 스키마 정보가 없습니다.")
                return {}
            
            print(f"🔍 {len(self.schema_info)}개 테이블에서 데이터 조회 시작...")
            all_data = {}
            for table_name, table_info in self.schema_info.items():
                print(f"  📊 {table_name} 테이블 처리 중...")
                try:
                    conn = self.get_connection()
                    if not conn:
                        continue
                    
                    with conn.cursor() as cursor:
                        # 테이블의 전체 데이터 개수 조회
                        cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
                        count_result = cursor.fetchone()
                        total_count = count_result['count'] if count_result else 0
                        
                        # 최근 데이터 조회 (최대 10개)
                        if total_count > 0:
                            # ORDER BY 절에서 첫 번째 컬럼을 사용 (테이블마다 다를 수 있음)
                            first_column = table_info['column_names'][0] if table_info['column_names'] else 'id'
                            cursor.execute(f"SELECT * FROM {table_name} ORDER BY {first_column} DESC LIMIT 10")
                            recent_data = cursor.fetchall()
                        else:
                            recent_data = []
                        
                        # 데이터 타입 변환
                        converted_data = []
                        for row in recent_data:
                            converted_row = {}
                            for key, value in row.items():
                                converted_row[key] = self._convert_value_for_json(value)
                            converted_data.append(converted_row)
                        
                        all_data[table_name] = {
                            'total_count': total_count,
                            'recent_data': converted_data,
                            'columns': table_info['column_names']
                        }
                        
                except Exception as e:
                    print(f"테이블 {table_name} 데이터 조회 오류: {str(e)}")
                    all_data[table_name] = {
                        'total_count': 0,
                        'recent_data': [],
                        'columns': table_info['column_names']
                    }
            
            return all_data
            
        except Exception as e:
            print(f"전체 테이블 데이터 조회 오류: {str(e)}")
            return {}
    
    def search_data_by_keyword(self, keyword: str) -> Dict[str, List[Dict[str, Any]]]:
        """키워드로 모든 테이블에서 데이터 검색"""
        try:
            if not self.schema_info:
                return {}
            
            search_results = {}
            
            for table_name, table_info in self.schema_info.items():
                try:
                    conn = self.get_connection()
                    if not conn:
                        continue
                    
                    with conn.cursor() as cursor:
                        # 문자열 컬럼만 검색 대상으로 선정
                        string_columns = []
                        for col_name, col_type in table_info['column_types'].items():
                            if 'char' in col_type.lower() or 'text' in col_type.lower():
                                string_columns.append(col_name)
                        
                        if not string_columns:
                            continue
                        
                        # 검색 쿼리 생성
                        search_conditions = []
                        params = []
                        for col in string_columns:
                            search_conditions.append(f"{col} LIKE %s")
                            params.append(f"%{keyword}%")
                        
                        query = f"SELECT * FROM {table_name} WHERE {' OR '.join(search_conditions)} LIMIT 5"
                        cursor.execute(query, params)
                        result = cursor.fetchall()
                        
                        if result:
                            # 데이터 타입 변환
                            converted_result = []
                            for row in result:
                                converted_row = {}
                                for key, value in row.items():
                                    converted_row[key] = self._convert_value_for_json(value)
                                converted_result.append(converted_row)
                            
                            search_results[table_name] = converted_result
                        
                except Exception as e:
                    print(f"테이블 {table_name} 검색 오류: {str(e)}")
                    continue
            
            return search_results
            
        except Exception as e:
            print(f"키워드 검색 오류: {str(e)}")
            return {}
    
    def get_table_summary(self) -> str:
        """데이터베이스 테이블 요약 정보 생성"""
        if not self.schema_info:
            return "데이터베이스 스키마 정보를 읽을 수 없습니다."
        
        summary = "📊 데이터베이스 테이블 구조:\n\n"
        
        for table_name, table_info in self.schema_info.items():
            summary += f"**{table_name}** 테이블:\n"
            summary += f"- 컬럼: {', '.join(table_info['column_names'])}\n"

            
            summary += "\n"
        
        return summary
    
    def close_connection(self):
        """데이터베이스 연결 종료"""
        try:
            if self.connection and self.connection.open:
                self.connection.close()
        except Exception as e:
            print(f"데이터베이스 연결 종료 오류: {str(e)}") 