import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432")
    )

def fetch_all_medicine_names():
    """Fetch the list of all medicines for fuzzy matching."""
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT medicine_name FROM medicines")
            # Returns a flat list of strings
            names = [row[0] for row in cur.fetchall()]
        conn.close()
        return names
    except Exception as e:
        print(f"❌ DB Error: {e}")
        return []

def get_medicine_uses(medicine_name):
    """Fetch the specific 'uses' text for a medicine."""
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Case-insensitive search using ILIKE
            cur.execute("SELECT uses FROM medicines WHERE medicine_name ILIKE %s", (medicine_name,))
            result = cur.fetchone()
        conn.close()
        return result['uses'] if result else None
    except Exception as e:
        print(f"❌ DB Error: {e}")
        return None