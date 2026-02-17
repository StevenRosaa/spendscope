import os
import uuid
import boto3
from fastapi import UploadFile

# Load configuration from environment variables
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "receipt-radar-bucket")
S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL") 
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Initialize the S3 client
s3_client = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT_URL,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

async def upload_file_to_s3(file: UploadFile, user_id: int) -> str:
    """
    Uploads an image or PDF to the S3 bucket and returns the file URL.
    """
    file_extension = file.filename.split(".")[-1]
    # Organize files by user ID to avoid collisions
    unique_filename = f"users/{user_id}/{uuid.uuid4()}.{file_extension}"
    
    # Read file content asynchronously (doesn't block the main thread)
    file_content = await file.read()
    
    # Upload to S3
    s3_client.put_object(
        Bucket=S3_BUCKET_NAME,
        Key=unique_filename,
        Body=file_content,
        ContentType=file.content_type
    )
    
    # Construct and return the public or accessible URL
    return f"{S3_ENDPOINT_URL}/{S3_BUCKET_NAME}/{unique_filename}"