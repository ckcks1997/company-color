import sqlite3
import mysql.connector
from mysql.connector import Error
import re
import os

# hash 업데이트
#UPDATE GUKMIN_YUNGUM_DATA
#SET hash = MD5(CONCAT(COMPANY_NM, '|', BUSINESS_NUM, '|', BUSINESS_LOCATION))
#where hash = null;

# elastic 데이터 세팅
# INSERT IGNORE INTO COMPANY_INFO
#     (COMPANY_NM, ADDRESS, BUSINESS_NUM, LOCATION, HASH)
# SELECT DISTINCT
#     TRIM(COMPANY_NM),
#     TRIM(BUSINESS_LOCATION),
#     TRIM(BUSINESS_NUM),
#     TRIM(SUBSTRING_INDEX(BUSINESS_LOCATION, ' ', 1)),
#     TRIM(HASH)
# FROM GUKMIN_YUNGUM_DATA;

# 불필요한 데이터 삭제
#delete from COMPANY_INFO WHERE COMPANY_NM like '%(일용%';
#delete from COMPANY_INFO WHERE COMPANY_NM like '%/일용%';
#delete from COMPANY_INFO WHERE COMPANY_NM like '%(상용%';
#delete from COMPANY_INFO WHERE COMPANY_NM like '%/상용%';

# SQLite -> Maria 이동 관련 코드
def sqlite_connect(db_file):
    if not os.path.exists(db_file):
        print(f"SQLite 파일 없음")
        return None
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)
    return None


def mariadb_connect(host, database, user, password):
    try:
        conn = mysql.connector.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            charset='utf8mb4',
            collation='utf8mb4_unicode_ci'
        )
        return conn
    except Error as e:
        print(f"MariaDB 연결 오류: {e}")
    return None


def modify_create_table_sql(create_table_sql):
    create_table_sql = re.sub(r'"(\w+)"', r'`\1`', create_table_sql)
    create_table_sql = re.sub(r'INTEGER\s+primary\s+key\s+autoincrement', 'INT PRIMARY KEY AUTO_INCREMENT',
                              create_table_sql, flags=re.IGNORECASE)
    create_table_sql = create_table_sql.replace('TEXT', 'VARCHAR(255)')
    create_table_sql = re.sub(r'\s+', ' ', create_table_sql)
    create_table_sql = create_table_sql.replace(' ,', ',')
    create_table_sql = re.sub(r',\s*\)', ')', create_table_sql)
    return create_table_sql


def migrate_table(sqlite_conn, mariadb_conn, table_name, batch_size=10000):
    try:
        sqlite_cursor = sqlite_conn.cursor()
        mariadb_cursor = mariadb_conn.cursor()

        sqlite_cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
        create_table_sql = sqlite_cursor.fetchone()[0]
        create_table_sql = modify_create_table_sql(create_table_sql)

        mariadb_cursor.execute(f"DROP TABLE IF EXISTS `{table_name}`")
        print("Modified CREATE TABLE SQL:", create_table_sql)
        mariadb_cursor.execute(create_table_sql)

        sqlite_cursor.execute(f"PRAGMA table_info('{table_name}')")
        columns = [f"`{column[1]}`" for column in sqlite_cursor.fetchall()]

        placeholders = ', '.join(['%s'] * len(columns))
        insert_query = f"INSERT INTO `{table_name}` ({', '.join(columns)}) VALUES ({placeholders})"

        sqlite_cursor.execute(f"SELECT COUNT(*) FROM '{table_name}'")
        total_rows = sqlite_cursor.fetchone()[0]

        print(f"총 {total_rows}개-")
        mariadb_cursor.execute(f"ALTER TABLE `{table_name}` DISABLE KEYS")
        mariadb_conn.start_transaction()

        offset = 0
        while offset < total_rows:
            sqlite_cursor.execute(f"SELECT * FROM '{table_name}' LIMIT {batch_size} OFFSET {offset}")
            batch = sqlite_cursor.fetchall()

            if not batch:
                break

            mariadb_cursor.executemany(insert_query, batch)
            offset += len(batch)
            print(f"{offset}/{total_rows} 완료")

        mariadb_conn.commit()
        mariadb_cursor.execute(f"ALTER TABLE `{table_name}` ENABLE KEYS")

        print(f"{table_name} 완료")

    except Error as e:
        print(f"오류 발생: {e}")
        mariadb_conn.rollback()


def main():
    sqlite_db = "C:/"
    mariadb_host = ""
    mariadb_db = ""
    mariadb_user = ""
    mariadb_password = ""
    table_to_migrate = ""

    sqlite_conn = sqlite_connect(sqlite_db)
    mariadb_conn = mariadb_connect(mariadb_host, mariadb_db, mariadb_user, mariadb_password)

    if sqlite_conn and mariadb_conn:
        migrate_table(sqlite_conn, mariadb_conn, table_to_migrate)
        sqlite_conn.close()
        mariadb_conn.close()
    else:
        print("데이터베이스 연결 실패")


if __name__ == "__main__":
    main()