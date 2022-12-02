import codecs
import json
from crypto.aes import *
from crypto.hash import *
from crypto.generate import *

from django.db import connection  # default database connection
from django.core.mail import send_mail
from django.conf import settings
from smtplib import SMTPException

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import *
from .serializers import *


# generic select query
# def post(self, request):
#         if request.POST:
#             data = Users.objects.get(uname=request.data.get('uname'))
#             print(data.email)
#             return Response(status=201)

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

            temp_dict['encrypted_key'] = temp_encryption.hex()
            temp_dict['iv'] = iv.hex()

            # Add all the fields from the API call to the database
            serializer = UserSerializer(data=temp_dict)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsersApiView(APIView):

    def get(self, request):
        if request.method == 'GET':
            data = Users.objects.all()
            serializer = UsersSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)


class AdminsApiView(APIView):

    def get(self, request):
        if request.method == 'GET':
            data = Admins.objects.all()
            serializer = AdminsSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)


class AdminApiView(APIView):

    serializer_class = AdminsSerializerApi

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
            temp_encryption = encrypt_data(key, hashed_password[0].encode(), iv)
            temp_dict['encrypted_key'] = temp_encryption.hex()
            temp_dict['iv'] = iv.hex()

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
            try:
               Admins.objects.get(uname=request.data.get('uname'))
            except Admins.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)


            cursor = connection.cursor()  # get cursor object so can commit

            cursor.execute('INSERT INTO super_admins (uname) VALUES (%s)', [request.data.get('uname')])
            connection.commit()

            # temp_dict = {}
            # temp_dict = request.data.copy()

            # hashed_password = hash_password(temp_dict.get("password"))

            # key = generate_key()
            # iv = generate_iv()

            # temp_dict['hashed_pwd'] = hashed_password[0]
            # temp_dict['salt'] = hashed_password[1]

            # # encrypting key
            # temp_encryption = encrypt_data(key, hashed_password[0].encode(), iv)
            # temp_dict['encrypted_key'] = temp_encryption.hex()
            # temp_dict['iv'] = iv.hex()

            # serializer = SuperAdminsSerializer(data=request.data)

            # if serializer.is_valid(raise_exception=True):
            #     serializer.save()
            return Response(status=status.HTTP_201_CREATED) 
            # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


""" TODO:
    1. Prettify the response
    2. Query for a certain user
    3. Get the money
"""
class IpsApiView(APIView):

    def get(self, request):
        if request.method == 'GET':

            cursor = connection.cursor()
            # ORM does not work as intended. Manually constructed a query for updating an existing password for a website.
            # TODO: Check for alternate solution or why ORM doesn't work
            cursor.execute('SELECT * FROM ips')
            connection.commit()
            row = cursor.fetchall()
            return Response(json.dumps(row))

            # data = Ips.objects.all()
            # serializer = IpsSerializer(data, context={'request': request}, many=True)
            # return Response(serializer.data)
            # return Response(status=status.HTTP_200_OK)


class IpApiView(APIView):

    serializer_class = IpsSerializer

    def post(self, request):
        if request.method == 'POST':
            serializer = IpsSerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FeedbacksApiView(APIView):

    def get(self, request):
        if request.method == 'GET':
            data = Feedback.objects.all()
            serializer = FeedbackSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)


class FeedbackApiView(APIView):

    serializer_class = FeedbackSerializer

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
                user_object = Users.objects.get(uname=request.data.get('uname'))
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            temp_dict = {}
            temp_dict = request.data.copy()

            masterpwd_decrypted = temp_dict.get('your_password')
            masterpwd_hashed = hash_password_salt(masterpwd_decrypted, user_object.salt_1)
            masterpwd_hashedhashed = hash_password_salt(masterpwd_hashed, user_object.salt_2)

            if (masterpwd_hashedhashed != user_object.hashedhashed_masterpwd):
                return Response(status=status.HTTP_409_CONFLICT)

            key = codecs.decode(user_object.encrypted_key, 'hex_codec')  # from hex to byte
            iv = codecs.decode(user_object.iv, 'hex_codec')

            new_iv = generate_iv()

            decrypted_key = decrypt_data(key, masterpwd_hashed.encode(), iv)
            encrypted_password = encrypt_data(get_password(32), decrypted_key, new_iv)

            temp_dict['encrypted_pwd'] = encrypted_password.hex()
            temp_dict['iv'] = new_iv.hex()

            # Add all the fields from the API call to the database
            serializer = PasswordsSerializer(data=temp_dict)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RemoveUserApiView(APIView):

    serializer_class = RemoveUserSerializer

    def post(self, request):
        if request.method == 'POST':
            try:
                user_object = Users.objects.get(uname=request.data.get('uname'))
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            user_object.delete()
            return Response(status=status.HTTP_200_OK)


class RemoveAdminApiView(APIView):

    serializer_class = RemoveAdminSerializer

    def post(self, request):
        if request.method == 'POST':
            try:
                admin_oject = Admins.objects.get(uname=request.data.get('uname'))
            except Admins.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            admin_oject.delete()
            return Response(status=status.HTTP_200_OK)


class RemoveFeedbackApiView(APIView):

    serializer_class = RemoveFeedbackApiSerializer

    def post(self, request):
        if request.method == 'POST':
            try:
                feedback_object = Feedback.objects.get(id=request.data.get('id'))
                feedback_object.delete()
                return Response(status=status.HTTP_200_OK)
            except Feedback.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)


class RemoveIpsApiView(APIView):

    serializer_class = IpsSerializer

    def post(self, request):
        if request.method == 'POST':
            try:
                ip_object = Ips.objects.filter(uname=request.data.get(
                    'uname'), ip=request.data.get('ip'))
            except Ips.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            ip_object.delete()
            return Response(status=status.HTTP_200_OK)


class RemoveUserFromIpsApiView(APIView):

    serializer_class = RemoveIpsSerializer

    def post(self, request):
        if request.method == 'POST':
            try:
                ip_object = Ips.objects.filter(uname=request.data.get('uname'))
            except Ips.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            ip_object.delete()
            return Response(status=status.HTTP_200_OK)


class ChangeUserPasswordApiView(APIView):

    serializer_class = ChangePasswordUserSerializer

    def post(self, request):
        if request.method == 'POST':
            try:
                user_object = Users.objects.get(uname=request.data.get('uname'))
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            temp_dict = {}
            temp_dict = request.data.copy()

            old_masterpwd_decrypted = temp_dict.get('old_password')
            old_masterpwd_hashed = hash_password_salt(old_masterpwd_decrypted, user_object.salt_1)
            old_masterpwd_hashedhashed = hash_password_salt(old_masterpwd_hashed, user_object.salt_2)

            if (old_masterpwd_hashedhashed != user_object.hashedhashed_masterpwd):
                return Response(status=status.HTTP_409_CONFLICT)

            hashed_password = hash_password(temp_dict.get("new_password"))
            hashed_hashed_password = hash_password(hashed_password[0])

            key = codecs.decode(user_object.encrypted_key, 'hex_codec')
            iv = codecs.decode(user_object.iv, 'hex_codec')
            decrypted_key = decrypt_data(key, old_masterpwd_hashed.encode(), iv)
            encrypted_key = encrypt_data(decrypted_key, hashed_password[0].encode(), iv)

            user_object.hashedhashed_masterpwd = hashed_hashed_password[0]
            user_object.salt_1 = hashed_password[1]
            user_object.salt_2 = hashed_hashed_password[1]
            user_object.encrypted_key = encrypted_key.hex()
            user_object.save()
            return Response(status=status.HTTP_200_OK)


class ChangeWebsitePasswordsApiView(APIView):

    serializer_class = PasswordsApiSerializer

    def post(self, request):

        if request.method == 'POST':
            cursor = connection.cursor()  # get cursor object so can commit

            try:
                user_object = Users.objects.get(uname=request.data.get('uname'))
                cursor.execute('SELECT * FROM passwords WHERE uname=%s AND website_url=%s AND website_uname=%s',
                [request.data.get('uname'), request.data.get('website_url'), request.data.get('website_uname')])

                password_object = cursor.fetchone()
                print(password_object)

                # password_object = Passwords.objects.get(
                #     uname=request.data.get('uname'), 
                #     website_url=request.data.get('website_url'), 
                #     website_uname=request.data.get('website_uname'))
                    
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            temp_dict = {}
            temp_dict = request.data.copy()

            masterpwd_decrypted = temp_dict.get('your_password')
            masterpwd_hashed = hash_password_salt(masterpwd_decrypted, user_object.salt_1)
            masterpwd_hashedhashed = hash_password_salt(masterpwd_hashed, user_object.salt_2)

            if (masterpwd_hashedhashed != user_object.hashedhashed_masterpwd):
                return Response(status=status.HTTP_409_CONFLICT)

            key = codecs.decode(user_object.encrypted_key,'hex_codec')  # from hex to byte
            iv = codecs.decode(user_object.iv, 'hex_codec')

            iv_password = codecs.decode(password_object[-1], 'hex_codec')

            decrypted_key = decrypt_data(key, masterpwd_hashed.encode(), iv)
            encrypted_password = encrypt_data(get_password(32), decrypted_key, iv_password)

            # ORM did not work. Manually constructed a query for updating an existing password for a website.
            # TODO: Check for alternate solution or why ORM doesn't work
            cursor.execute('UPDATE passwords SET encrypted_pwd = %s WHERE uname = %s AND website_url = %s AND website_uname = %s', 
            [encrypted_password.hex(), request.data.get('uname'), request.data.get('website_url'), request.data.get('website_uname')])
            connection.commit()
            return Response(status=status.HTTP_200_OK)


# in progress
class LoginApiView(APIView):

    serializer_class = LoginApiSerializer

    def post(self, request):

        if request.method == 'POST':
            temp_dict = {}
            temp_dict = request.data.copy()

            try:
                user_object = Users.objects.get(uname=request.data.get('identification'))
                temp_dict['uname'] = request.data.get('identification')
            except Users.DoesNotExist:
                user_object = Users.objects.get(email=request.data.get('identification'))
                temp_dict['email'] = request.data.get('identification')
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            masterpwd_decrypted = request.data.get('password')
            masterpwd_hashed = hash_password_salt(masterpwd_decrypted, user_object.salt_1)
            masterpwd_hashedhashed = hash_password_salt(masterpwd_hashed, user_object.salt_2)

            if (masterpwd_hashedhashed != user_object.hashedhashed_masterpwd):
                return Response(status=status.HTTP_409_CONFLICT)

            token = generate_token(32)
            user_object.token = token
            user_object.token_timestamp = None
            user_object.save()
            print("HÄR")
            print(user_object.token_timestamp)

            token_serializer= UserTokenApiSerializer(user_object)
            # token_shit(user_object)
            return Response(token_serializer.data, status=status.HTTP_200_OK) 


class SendPasswordResetMailApiView(APIView):

    serializer_class = SendPasswordResetMailApiSerializer

    def post(self, request):

        if request.method == 'POST':

            try:
                user_object = Users.objects.get(email=request.data.get('email'))

                send_mail(
                    subject='Your Password Handler account has been requested to reset your password',
                    message='Hi ' + user_object.uname + ',' + '\n' +
                            'We are confirming that you requested to change your PasswordHandler account password for ' +
                            user_object.email + '. ' +
                            'Click the link and follow the instructions to change your password. \n' +
                            'Link: ' + 'http://localhost:3000/passwordhandler/reset-password?token=' + str(user_object.token) + '\n' +
                            
                            'If you did not request this change, you can ignore this message.' + '\n'+
                            'Regards, The PasswordHandler Team!',
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user_object.email],
                    fail_silently=False,
                )
                  
            except SMTPException:
                return Response(status=status.HTTP_404_NOT_FOUND)
    
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            return Response(status=status.HTTP_200_OK)


class ResetUserPasswordApiView(APIView):

    serializer_class = ResetPasswordUserApiSerializer

    def post(self, request):
        if request.method == 'POST':
            try:
                user_object = Users.objects.get(token=request.data.get('token'))
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            # if (request.data.get('new_password') != request.data.get('confirm_new_password')):
            #     return Response(status=status.HTTP_409_CONFLICT)

            hashed_password = hash_password(request.data.get("new_password"))
            hashed_hashed_password = hash_password(hashed_password[0])

            key = generate_key()
            iv = generate_iv()

            # encrypting key
            temp_encryption = encrypt_data(key, hashed_password[0].encode(), iv)

            user_object.hashedhashed_masterpwd = hashed_hashed_password[0]
            user_object.salt_1 = hashed_password[1]
            user_object.salt_2 = hashed_hashed_password[1]
            user_object.encrypted_key = temp_encryption.hex()
            user_object.iv = iv.hex()
            user_object.save()
            return Response(status=status.HTTP_200_OK)

