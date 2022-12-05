from Crypto.Random import get_random_bytes
from base64 import b64encode
import time
from database_handler.serializers import UserTokenSerializer
from rest_framework import status
from rest_framework.response import Response
from django.db import connection


def get_password(length):
    return b64encode(get_random_bytes(length))

def generate_token(length):
    return b64encode(get_random_bytes(length))

def check_token_validity_by_timestamp(user):
    cursor = connection.cursor()
    cursor.execute("SELECT token_timestamp FROM users WHERE uname = %s", [user.uname])
    time_in_secs = cursor.fetchone()[0].timestamp()
    
    if time_in_secs < time.time() - 10: # change time for deployment

        """ Not a valid token"""
        token_serializer = UserTokenSerializer(user)
        temp_dict = {}
        temp_dict = token_serializer.data.copy()
        temp_dict["error"] = "INVALID_TOKEN"
        return temp_dict

    return True


    

