import mysql.connector
from elasticsearch import Elasticsearch, helpers
import time

es = Elasticsearch(
    ['https://127.0.0.1:9200'],
    timeout=30,  # 30초 타임아웃
    max_retries=1,
    retry_on_timeout=True,
    verify_certs=False,
    basic_auth=('', '')
)

INDEX_NAME = "company_color_search_idx_v2502"
BATCH_SIZE = 20000

def get_db_connection():
    return mysql.connector.connect(
        host='0.0.0.0',
        user='',
        password='',
        database='',
        charset='utf8mb4',
        collation='utf8mb4_general_ci'
    )


# 총 레코드 수 조회
def get_total_records():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM COMPANY_INFO")
        total = cursor.fetchone()[0]
        return total
    except mysql.connector.Error as err:
        print(f"데이터베이스 오류: {err}")
        return 0
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


def fetch_batch(offset, limit):
    print(f'{offset} 시작')
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = f"""
        SELECT COMPANY_NM,
               ADDRESS,
               LOCATION,
               HASH,
               (   SELECT A.SUBSCRIBER_CNT 
                   FROM GUKMIN_YUNGUM_DATA A 
                   WHERE A.HASH = B.HASH ORDER BY CREATED_DT DESC LIMIT 1
               ) SUBSCRIBER
        FROM COMPANY_INFO B
        LIMIT {limit} OFFSET {offset}
            """
        cursor.execute(query)
        batch = cursor.fetchall()
        return batch
    except mysql.connector.Error as err:
        print(f"데이터베이스 오류: {err}")
        return []
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


def index_batch(batch):
    actions = [
        {
            "_index": INDEX_NAME,
            "_source": {
                "CompanyNm": row["COMPANY_NM"],
                "Address": row["ADDRESS"],
                "Location": row["LOCATION"],
                "Subscriber": row["SUBSCRIBER"],
                "Hash": row["HASH"]
            }
        }
        for row in batch
    ]
    helpers.bulk(es, actions)


def recreate_index():
    # 기존 인덱스가 있다면 삭제
    if es.indices.exists(index=INDEX_NAME):
        es.indices.delete(index=INDEX_NAME)
        print(f"기존 인덱스 '{INDEX_NAME}' 삭제")

    # 새 인덱스 생성
    es.indices.create(
        index=INDEX_NAME,
        body={
            "settings": {
                "analysis": {
                    "char_filter": {
                        "remove_corp": {
                            "type": "pattern_replace",
                            "pattern": "\\(주\\)|주식회사|㈜",
                            "replacement": ""
                        }
                    },
                    "analyzer": {
                        "ngram_analyzer": {
                            "type": "custom",
                            "tokenizer": "ngram_tokenizer",
                            "filter": ["lowercase"]
                        }
                    },
                    "tokenizer": {
                        "ngram_tokenizer": {
                            "type": "ngram",
                            "min_gram": 2,
                            "max_gram": 3,
                            "token_chars": ["letter", "digit"]
                        }
                    }
                }
            },
            "mappings": {
                "properties": {
                    "CompanyNm": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {
                            "keyword": {
                                "type": "keyword"
                            },
                            "ngram": {
                                "type": "text",
                                "analyzer": "ngram_analyzer"
                            }
                        }
                    },
                    "Location": {
                        "type": "keyword"
                    },
                    "Address": {
                        "type": "keyword"
                    },
                    "Subscriber": {
                        "type": "integer"
                    },
                    "Hash": {
                        "type": "keyword"
                    }
                }
            }
        }
    )
    print(f"새 인덱스 '{INDEX_NAME}' 생성.")


def reindex_data():
    start_time = time.time()
    total_indexed = 0
    total_records = get_total_records()

    if total_records == 0:
        print("데이터를 가져오는데 실패했습니다.")
        return

    print(f"총 레코드 수: {total_records}")

    for offset in range(0, total_records, BATCH_SIZE):
        batch = fetch_batch(offset, BATCH_SIZE)
        if not batch:
            break
        index_batch(batch)
        total_indexed += len(batch)

        progress = (total_indexed / total_records) * 100
        print(f"진행률: {progress:.2f}%")

    end_time = time.time()
    total_time = end_time - start_time
    print(f"인덱싱 완료. 총 {total_indexed}개 레코드 처리됨. 소요 시간: {total_time:.2f}초")


if __name__ == "__main__":
    recreate_index()
    reindex_data()
    print("전체 프로세스 완료")