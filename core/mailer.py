import os
import base64
import httpx
from msal import ConfidentialClientApplication

def get_graph_token():
    AZURE_CLIENT_ID = os.getenv("AZURE_CLIENT_ID")
    AZURE_TENANT_ID = os.getenv("AZURE_TENANT_ID")
    AZURE_CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET")
    
    if not AZURE_CLIENT_ID or not AZURE_TENANT_ID or not AZURE_CLIENT_SECRET:
        raise ValueError("Missing Azure AD configuration")
        
    AUTHORITY = f"https://login.microsoftonline.com/{AZURE_TENANT_ID}"
    SCOPES = ["https://graph.microsoft.com/.default"]
        
    app = ConfidentialClientApplication(
        client_id=AZURE_CLIENT_ID,
        client_credential=AZURE_CLIENT_SECRET,
        authority=AUTHORITY
    )
    
    result = app.acquire_token_silent(SCOPES, account=None)
    if not result:
        result = app.acquire_token_for_client(scopes=SCOPES)
        
    if "access_token" in result:
        return result["access_token"]
    else:
        raise Exception(f"Failed to acquire token: {result.get('error_description', 'Unknown error')}")

    
async def send_report_email(to_email: str, subject: str, body_html: str, pdf_bytes: bytes, pdf_filename: str):
    SENDER_EMAIL = os.getenv("SENDER_EMAIL", "sales@softreetechnology.com")
    token = get_graph_token()
    
    attachment_b64 = base64.b64encode(pdf_bytes).decode('utf-8')
    
    email_msg = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "HTML",
                "content": body_html
            },
            "toRecipients": [
                {
                    "emailAddress": {
                        "address": to_email
                    }
                }
            ],
            "attachments": [
                {
                    "@odata.type": "#microsoft.graph.fileAttachment",
                    "name": pdf_filename,
                    "contentType": "application/pdf",
                    "contentBytes": attachment_b64
                }
            ]
        },
        "saveToSentItems": "false"
    }
    
    url = f"https://graph.microsoft.com/v1.0/users/{SENDER_EMAIL}/sendMail"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json=email_msg
        )
        
        if response.status_code != 202:
            print("Graph API Error:", response.text)
            raise Exception(f"Failed to send email: {response.status_code} {response.text}")
    
    return True
