from Crypto.Random import get_random_bytes
from base64 import b64encode
import time
from database_handler.serializers import UserTokenApiSerializer
from rest_framework import status
from rest_framework.response import Response


def get_password(length):
    return b64encode(get_random_bytes(length))

def generate_token(length):
    return b64encode(get_random_bytes(length))

def token_shit(user):
    
    if user.token_timestamp > time.time() - 10:

        user.token = None
        user.save()
    
        token_serializer= UserTokenApiSerializer(user)
        return Response(token_serializer.data, status=status.HTTP_200_OK) 


# def set_token_null(user):
    
#     token_lifetime = time.time() + 10   

#     while time.time() < token_lifetime:
#         continue

#     user.token = None
#     user.save()



    

