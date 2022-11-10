from django.shortcuts import render
from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *

from crypto.hash import hash_password
from crypto.aes import *

# Create your views here.

def home(request):
    return HttpResponse('Hejhej')

class UserApiView(APIView):

    # A new serializer is created for API input
    serializer_class = UserSerializerApi
  
    def post(self, request):

        if request.method == 'POST':

            temp_dict = {}
            temp_dict = request.data.copy()
            hashed_password = hash_password(temp_dict.get("password"))
            hashed_hashed_password = hash_password(hashed_password[0])

            key = generate_key()
            iv = generate_iv()

            temp_dict['hashedhashed_masterpwd'] = hashed_hashed_password[0]
            temp_dict['salt_1'] = hashed_password[1]
            temp_dict['salt_2'] = hashed_hashed_password[1]
                            
            # encrypting key
            temp_encryption = encrypt_data(key, hashed_password[0], iv)
            temp_encryption = decrypt_data(temp_encryption, hashed_password[0], iv)
        

            temp_dict['encrypted_key'] = temp_encryption.hex()
            temp_dict['iv'] = iv.hex()

            # Add all the fields from the API call to the database
            serializer = UserSerializer(data=temp_dict)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# generic select query
# def post(self, request):
#         if request.POST:
#             data = Users.objects.get(uname=request.data.get('uname'))
#             print(data.email)
#             return Response(status=201)

class UsersApiView(APIView):

    def get(self, request):
        if request.method == 'GET':
            data = Users.objects.get(uname="bson")
            serializer = UsersSerializer(data)
            return Response(serializer.data)

class AdminsApiView(APIView):

    serializer_class = AdminsSerializer
  
    def get(self, request):
        if request.method == 'GET':
            data = Admins.objects.all()
            serializer = AdminsSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)

    def post(self, request):
        if request.method == 'POST':

            temp_dict = {}
            temp_dict = request.data.copy()

            hashed_password = hash_password(temp_dict.get("hashed_pwd"))

            key = generate_key()
            iv = generate_iv()

            temp_dict['hashed_pwd'] = hashed_password[0]
            temp_dict['salt'] = hashed_password[1]
                            
            # encrypting key
            temp_dict['encrypted_key'] = encrypt_data(key, hashed_password[0], iv)
            temp_dict['iv'] = iv

            serializer = AdminsSerializer(data=temp_dict)
            
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class SuperAdminsApiView(APIView):
    serializer_class = SuperAdminsSerializer
  
    def get(self, request):
        if request.method == 'GET':
            data = SuperAdmins.objects.all()
            serializer = SuperAdminsSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)

    def post(self, request):
        if request.method == 'POST':

            temp_dict = {}
            temp_dict = request.data.copy()

            hashed_password = hash_password(temp_dict.get("hashed_pwd"))

            key = generate_key()
            iv = generate_iv()

            temp_dict['hashed_pwd'] = hashed_password[0]
            temp_dict['salt'] = hashed_password[1]
                            
            # encrypting key
            temp_dict['encrypted_key'] = encrypt_data(key, hashed_password[0], iv)
            temp_dict['iv'] = iv

            serializer = SuperAdminsSerializer(data=temp_dict)
            
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class IpsApiView(APIView):

    serializer_class = IpsSerializer
  
    def get(self, request):
        if request.method == 'GET':
            data =  Ips.objects.all()
            serializer = IpsSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)

    def post(self, request):
        if request.method == 'POST':
            serializer = IpsSerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FeedbacksApiView(APIView):

    serializer_class = FeedbacksSerializer
  
    def get(self, request):
        if request.method == 'GET':
            data =  Feedback.objects.all()
            serializer = FeedbacksSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)

    def post(self, request):
        if request.method == 'POST':
            serializer = FeedbacksSerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


