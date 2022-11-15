from django.shortcuts import render
from django.http import HttpResponse
from django.db import connection #default database connection

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import codecs
from .models import *
from .serializers import *

from crypto.hash import *
from crypto.aes import *

# Create your views here.

def home(request):
    return HttpResponse('Hejhej')

class UserApiView(APIView):

    # A new serializer is created for API input
    serializer_class = UserApiSerializer
  
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
            temp_encryption = encrypt_data(key, hashed_password[0].encode(), iv)
            #temp_encryption = decrypt_data(temp_encryption, hashed_password[0].encode(), iv)

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
            data = Users.objects.all()
            serializer = UsersSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)

class AdminsApiView(APIView):

    serializer_class = AdminsSerializerApi
  
    def get(self, request):
        if request.method == 'GET':
            data = Admins.objects.all()
            serializer = AdminsSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)

    def post(self, request):
        if request.method == 'POST':

            temp_dict = {}
            temp_dict = request.data.copy()

            hashed_password = hash_password(temp_dict.get("password"))

            key = generate_key()
            iv = generate_iv()

            temp_dict['hashed_pwd'] = hashed_password[0]
            temp_dict['salt'] = hashed_password[1]
                            
            # encrypting key
            temp_dict['encrypted_key'] = encrypt_data(key, hashed_password[0].encode(), iv)
            temp_dict['iv'] = iv

            serializer = AdminsSerializer(data=temp_dict)
            
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class SuperAdminsApiView(APIView):
    serializer_class = SuperAdminsSerializerApi
  
    def get(self, request):
        if request.method == 'GET':
            data = SuperAdmins.objects.all()
            serializer = SuperAdminsSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)

    def post(self, request):
        if request.method == 'POST':

            temp_dict = {}
            temp_dict = request.data.copy()

            hashed_password = hash_password(temp_dict.get("password"))

            key = generate_key()
            iv = generate_iv()

            temp_dict['hashed_pwd'] = hashed_password[0]
            temp_dict['salt'] = hashed_password[1]
                            
            # encrypting key
            temp_dict['encrypted_key'] = encrypt_data(key, hashed_password[0].encode(), iv)
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

    serializer_class = FeedbackSerializer
  
    def get(self, request):
        if request.method == 'GET':
            data =  Feedback.objects.all()
            serializer = FeedbackSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)

    def post(self, request):
        if request.method == 'POST':
            serializer = FeedbackSerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NewWebsitePasswordsApiView(APIView):

    serializer_class = PasswordsApiSerializer
  
    def post(self, request):

        if request.method == 'POST':
            try:
                userObj = Users.objects.get(uname=request.data.get('uname'))
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST) 

            temp_dict = {}
            temp_dict = request.data.copy()

            masterpwd_decrypted = temp_dict.get('yourPassword')
            masterpwd_hashed = hash_passwordSalt(masterpwd_decrypted, userObj.salt_1)
            masterpwd_hashedhashed = hash_passwordSalt(masterpwd_hashed, userObj.salt_2)

            if(masterpwd_hashedhashed != userObj.hashedhashed_masterpwd):
                return Response(status=status.HTTP_409_CONFLICT)

            key=codecs.decode(userObj.encrypted_key, 'hex_codec') #from hex to byte
            iv=codecs.decode(userObj.iv, 'hex_codec')
            decrypted_key = decrypt_data(key, masterpwd_hashed.encode(), iv)
            encrypted_password = encrypt_data(temp_dict.get('password').encode(), decrypted_key, iv)
            #print(decrypt_data(encrypted_password, decrypted_key, iv).decode())

            temp_dict['encrypted_pwd'] = encrypted_password.hex()

            # Add all the fields from the API call to the database
            serializer = PasswordsSerializer(data=temp_dict)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RemoveUserApiView(APIView):

    serializer_class = RemoveUserSerializer

    def post(self, request):
        if request.POST:
            try:
                userObj = Users.objects.get(uname=request.data.get('uname'))
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            userObj.delete()    
            return Response(status=status.HTTP_200_OK)

class RemoveAdminApiView(APIView):

    serializer_class = RemoveAdminSerializer

    def post(self, request):
        if request.POST:
            try:
                adminObj = Admins.objects.get(uname=request.data.get('uname'))
            except Admins.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            adminObj.delete()    
            return Response(status=status.HTTP_200_OK)

class RemoveFeedbackApiView(APIView):

    serializer_class = RemoveFeedbackApiSerializer

    def post(self, request):
        if request.POST:
            try:
                feedbackObj = Feedback.objects.get(id=request.data.get('id'))
                feedbackObj.delete()    
                return Response(status=status.HTTP_200_OK)
            except Feedback.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

class RemoveIpsApiView(APIView):

    serializer_class = IpsSerializer

    def post(self, request):
        if request.POST:
            try:
                ipsObjs = Ips.objects.filter(uname=request.data.get('uname'), ip=request.data.get('ip'))
            except Ips.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            ipsObjs.delete()  
            return Response(status=status.HTTP_200_OK)

class RemoveUserFromIpsApiView(APIView):

    serializer_class = RemoveIpsSerializer

    def post(self, request):
        if request.POST:
            try:
                ipsObjs = Ips.objects.filter(uname=request.data.get('uname'))
            except Ips.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            ipsObjs.delete()  
            return Response(status=status.HTTP_200_OK)

class ChangeUserPasswordApiView(APIView):

    serializer_class = ChangePasswordUserSerializer

    def post(self, request):
        if request.POST:
            try:
                userObj = Users.objects.get(uname=request.data.get('uname'))
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            temp_dict = {}
            temp_dict = request.data.copy()

            old_masterpwd_decrypted = temp_dict.get('oldPassword')
            old_masterpwd_hashed = hash_passwordSalt(old_masterpwd_decrypted, userObj.salt_1)
            old_masterpwd_hashedhashed = hash_passwordSalt(old_masterpwd_hashed, userObj.salt_2)

            if(old_masterpwd_hashedhashed != userObj.hashedhashed_masterpwd):
                return Response(status=status.HTTP_409_CONFLICT)

            hashed_password = hash_password(temp_dict.get("newPassword"))
            hashed_hashed_password = hash_password(hashed_password[0])

            key=codecs.decode(userObj.encrypted_key, 'hex_codec')
            iv=codecs.decode(userObj.iv, 'hex_codec')
            decrypted_key = decrypt_data(key, old_masterpwd_hashed.encode(), iv)
            encrypted_key = encrypt_data(decrypted_key, hashed_password[0].encode(), iv)

            userObj.hashedhashed_masterpwd=hashed_hashed_password[0]
            userObj.salt_1=hashed_password[1]
            userObj.salt_2=hashed_hashed_password[1]
            userObj.encrypted_key=encrypted_key.hex()
            userObj.save()
            return Response(status=status.HTTP_200_OK)

class ChangeWebsitePasswordsApiView(APIView):

    serializer_class = PasswordsApiSerializer
  
    def post(self, request):

        if request.method == 'POST':
            try:
                userObj = Users.objects.get(uname=request.data.get('uname'))
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            temp_dict = {}
            temp_dict = request.data.copy()

            masterpwd_decrypted = temp_dict.get('yourPassword')
            masterpwd_hashed = hash_passwordSalt(masterpwd_decrypted, userObj.salt_1)
            masterpwd_hashedhashed = hash_passwordSalt(masterpwd_hashed, userObj.salt_2)

            if(masterpwd_hashedhashed != userObj.hashedhashed_masterpwd):
                return Response(status=status.HTTP_409_CONFLICT)

            key = codecs.decode(userObj.encrypted_key, 'hex_codec') #from hex to byte
            iv = codecs.decode(userObj.iv, 'hex_codec')
            decrypted_key = decrypt_data(key, masterpwd_hashed.encode(), iv)
            encrypted_password = encrypt_data(temp_dict.get('password').encode(), decrypted_key, iv)

            cursor = connection.cursor() #get cursor object so can commit 

            #FINALLY WORKS fuck
            passwordObj = cursor.execute('UPDATE passwords SET encrypted_pwd = %s WHERE uname = %s AND website_url = %s AND website_uname = %s', [encrypted_password.hex(), request.data.get('uname'), request.data.get('website_url'), request.data.get('website_uname')])
            connection.commit()
            return Response(status=status.HTTP_200_OK)
        

           

        