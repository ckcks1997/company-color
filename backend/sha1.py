import sqlite3
import hashlib

# DB DATA 해시 생성
def sha1_hash(s):
    """문자열을 SHA1 해시로 변환"""
    return hashlib.sha1(s.encode('utf-8')).hexdigest()

# SQLite 데이터베이스 연결
conn = sqlite3.connect("sqlite:///../sqlite")
cursor = conn.cursor()

# SHA1 해시를 저장할 새 컬럼 추가 (아직 없다면)

# 모든 행을 가져와서 SHA1 해시 계산 및 업데이트
cursor.execute("SELECT id, 사업장명, 사업자등록번호, 사업장지번상세주소 FROM GUKMIN_YUNGUM_DATA")
for row in cursor.fetchall():
    id, col1, col2, col3 = row
    # 컬럼 값들을 연결하여 해시 입력 생성
    hash_input = f"{col1}|{col2}|{col3}"
    # SHA1 해시 계산
    hash_value = sha1_hash(hash_input)
    # 해시 값 업데이트
    cursor.execute("UPDATE GUKMIN_YUNGUM_DATA SET HASH = ? WHERE id = ?", (hash_value, id))

# 변경사항 저장 및 연결 종료
conn.commit()
conn.close()

print("SHA1 해시 업데이트 완료")