import psycopg2
import csv
import os
from dotenv import load_dotenv

# Load database credentials from your .env file
load_dotenv()

def migrate_csv_to_postgres(csv_file_path):
    # 1. Establish the connection
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432")
        )
        cursor = conn.cursor()
        print("✅ Connected to PostgreSQL successfully.")

        # 2. Open and read the CSV file
        with open(csv_file_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # Check if headers match: medicine_name, uses
            for row in reader:
                try:
                    # 3. Insert or Update data (UPSERT)
                    cursor.execute(
                        """
                        INSERT INTO medicines (medicine_name, uses)
                        VALUES (%s, %s)
                        ON CONFLICT (medicine_name) 
                        DO UPDATE SET uses = EXCLUDED.uses;
                        """,
                        (row['medicine_name'], row['uses'])
                    )
                except Exception as e:
                    print(f"❌ Error inserting {row.get('medicine_name')}: {e}")
                    continue

        # 4. Commit changes and close
        conn.commit()
        print(f"🎉 Data from '{csv_file_path}' has been successfully merged into the database.")
        
    except Exception as e:
        print(f"❌ Database connection error: {e}")
    finally:
        if conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    # Ensure this matches your uploaded filename
    file_name = 'medicine_uses_detailed_ocr_dataset.csv'
    migrate_csv_to_postgres(file_name)