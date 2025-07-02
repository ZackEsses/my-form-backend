from http.server import BaseHTTPRequestHandler
import json
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            # CORS headers
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Load Google credentials from environment
            creds_json = os.environ.get('GOOGLE_CREDENTIALS')
            creds_dict = json.loads(creds_json)
            
            credentials = service_account.Credentials.from_service_account_info(creds_dict)
            service = build('sheets', 'v4', credentials=credentials)
            
            # Add to Google Sheet - matching your exact columns
            SHEET_ID = '1qHEOKd3DlrPBFMv_HfZ_OgES1p-brYEOmg9RqJ-ne-Y'
            values = [[
                data.get('businessName', ''),
                data.get('firstName', ''), 
                data.get('lastName', ''),
                data.get('phone', ''),
                data.get('email', '')
            ]]
            body = {'values': values}
            
            service.spreadsheets().values().append(
                spreadsheetId=SHEET_ID,
                range='Sheet1!A:E',  # A to E for your 5 columns
                valueInputOption='RAW',
                body=body
            ).execute()
            
            response = {"success": True, "message": "Data added successfully"}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            response = {"success": False, "error": str(e)}
            self.wfile.write(json.dumps(response).encode())
