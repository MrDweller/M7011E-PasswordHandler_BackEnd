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

def token_shit(user):
    cursor = connection.cursor()
    cursor.execute("SELECT token_timestamp FROM users WHERE uname = %s", [user.uname])
    time_in_secs = cursor.fetchone()[0].timestamp()
    
    if time_in_secs < time.time() - 100:

        user.token = None
        user.save()
    
        token_serializer= UserTokenSerializer(user)
        return Response(token_serializer.data, status=status.HTTP_200_OK) 


# def set_token_null(user):
    
#     token_lifetime = time.time() + 10   

#     while time.time() < token_lifetime:
#         continue

#     user.token = None
#     user.save()



    

