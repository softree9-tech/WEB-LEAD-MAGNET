import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'leads.db')

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            website TEXT,
            source TEXT,
            geo_score INTEGER,
            visibility_score INTEGER,
            status TEXT,
            pdf_path TEXT,
            json_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create indexes for efficient filtering
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_leads_website ON leads(website)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source)')
    
    conn.commit()
    conn.close()

def save_lead(name, email, website, source, geo_score, visibility_score, status, pdf_path, json_data):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Basic duplicate check for the same website within the last hour
    cursor.execute('''
        SELECT id FROM leads 
        WHERE website = ? AND created_at > datetime('now', '-1 hour')
    ''', (website,))
    
    if cursor.fetchone():
        conn.close()
        return None # Duplicate

    cursor.execute('''
        INSERT INTO leads (name, email, website, source, geo_score, visibility_score, status, pdf_path, json_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (name, email, website, source, geo_score, visibility_score, status, pdf_path, json_data))
    
    lead_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return lead_id

def get_leads(date_filter='All Time', search_term=None):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = 'SELECT * FROM leads WHERE 1=1'
    params = []
    
    if date_filter == 'Today':
        query += " AND date(created_at) = date('now')"
    elif date_filter == 'Yesterday':
        query += " AND date(created_at) = date('now', '-1 day')"
    elif date_filter == 'Last 7 Days':
        query += " AND created_at >= datetime('now', '-7 days')"
    elif date_filter == 'Last 30 Days':
        query += " AND created_at >= datetime('now', '-30 days')"
    elif date_filter == 'Last 90 Days':
        query += " AND created_at >= datetime('now', '-90 days')"
    elif date_filter == 'Last 1 Year':
        query += " AND created_at >= datetime('now', '-1 year')"
        
    if search_term:
        query += " AND (name LIKE ? OR email LIKE ? OR website LIKE ?)"
        params.extend([f'%{search_term}%', f'%{search_term}%', f'%{search_term}%'])
        
    query += " ORDER BY created_at DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    leads = []
    for row in rows:
        lead = dict(row)
        # Avoid loading full json_data into the list view to save memory
        lead['json_data'] = None 
        leads.append(lead)
        
    conn.close()
    return leads

def get_lead_by_id(lead_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM leads WHERE id = ?', (lead_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None
