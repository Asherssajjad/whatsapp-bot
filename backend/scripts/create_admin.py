"""
One-off script to set a user as admin. Run from backend dir:
  python scripts/create_admin.py admin@example.com
"""
import os
import sys

# Add parent so we can import app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.config import settings

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/create_admin.py <email>")
        sys.exit(1)
    email = sys.argv[1]
    # Use sync URL for script
    url = settings.sync_database_url
    engine = create_engine(url)
    with engine.connect() as conn:
        r = conn.execute(text("UPDATE users SET role = 'admin' WHERE email = :e RETURNING id"), {"e": email})
        row = r.fetchone()
        if row:
            print(f"User {email} is now admin.")
        else:
            print(f"No user found with email {email}. Register first via API or frontend.")
    engine.dispose()

if __name__ == "__main__":
    main()
