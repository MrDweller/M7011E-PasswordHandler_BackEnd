from Crypto.Random import get_random_bytes
from base64 import b64encode
import time
from database_handler.serializers import UserTokenSerializer, UserEmailTokenSerializer
from rest_framework import status
from rest_framework.response import Response
from django.db import connection

import string
import random


def get_password(length):
    return b64encode(get_random_bytes(length))


def generate_token(length):
    ran = ''.join(random.choices(string.ascii_uppercase + string.ascii_lowercase + string.digits, k=length)) 
    return str(ran)  

def check_token_validity_by_timestamp(user, isAdmin):
    cursor = connection.cursor()
    if isAdmin==False:
        cursor.execute("SELECT token_timestamp FROM users WHERE uname = %s", [user.uname])
    else:
        cursor.execute("SELECT token_timestamp FROM admins WHERE uname = %s", [user.uname])
    time_in_secs = cursor.fetchone()[0].timestamp()
    
    if time_in_secs < time.time() - 239028472389: # change time for deployment

        """ Not a valid token"""
        token_serializer = UserTokenSerializer(user)
        temp_dict = {}
        temp_dict = token_serializer.data.copy()
        temp_dict["error"] = "INVALID_TOKEN"
        return temp_dict

    return True


def check_email_token_validity_by_timestamp(user, isAdmin):
    cursor = connection.cursor()

    if isAdmin==False:
        cursor.execute("SELECT email_token_timestamp FROM users WHERE uname = %s", [user.uname])
    else:
        cursor.execute("SELECT email_token_timestamp FROM admins WHERE uname = %s", [user.uname])
    time_in_secs = cursor.fetchone()[0].timestamp()
    
    if time_in_secs < time.time() - 239028472389: # change time for deployment

        """ Not a valid token"""
        email_token_serializer = UserEmailTokenSerializer(user)
        temp_dict = {}
        temp_dict = email_token_serializer.data.copy()
        temp_dict["error"] = "INVALID_TOKEN"
        return temp_dict

    return True
    

def pretty_request(request):
    headers = ''
    for header, value in request.META.items():
        if not header.startswith('HTTP'):
            continue
        header = '-'.join([h.capitalize() for h in header[5:].lower().split('_')])
        headers += '{}: {}\n'.format(header, value)

    return (
        '{method} HTTP/1.1\n'
        'Content-Length: {content_length}\n'
        'Content-Type: {content_type}\n'
        '{headers}\n\n'
        '{body}'
    ).format(
        method=request.method,
        content_length=request.META['CONTENT_LENGTH'],
        content_type=request.META['CONTENT_TYPE'],
        headers=headers,
        body=request.body,
    )
