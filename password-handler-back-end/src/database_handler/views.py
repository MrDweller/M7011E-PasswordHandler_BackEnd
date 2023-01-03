import codecs
import json
from crypto.aes import *
from crypto.hash import *
from crypto.generate import *

from django.db import connection  # default database connection
from django.core.mail import send_mail
from django.conf import settings
from smtplib import SMTPException

import boto3
from botocore.client import Config

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import *
from .serializers import *

import os
from dotenv import load_dotenv
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

#Använder
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
            temp_dict["ip"] = request.data.get('ip')
            temp_dict["pfpid"] = generate_token(20)
            temp_dict["pfpURL"] = "https://passwordhandler.s3.eu-north-1.amazonaws.com/user_tab.png"

            # Add all the fields from the API call to the database
            serializer = UserSerializer(data=temp_dict)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
            
            serializer = IpsSerializer(data=temp_dict)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetUserApiView(APIView):

    def get(self, request, uname, format=None):

        admin = False
        try:
            user_object = Users.objects.get(uname=uname)
        except Users.DoesNotExist:
            user_object = Admins.objects.get(uname=uname)
            admin = True
        except:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        if admin == False:
            userToken = request.headers.get("user-token")
        else:
            userToken = request.headers.get("admin-token")
            
        if userToken != user_object.token:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        valid_token = check_token_validity_by_timestamp(user_object, admin)
        if valid_token != True:
            return Response(valid_token, status.HTTP_403_FORBIDDEN)

        if request.method == 'GET': 
            if admin == False:
                serializer = UsersSerializer(user_object)
            else:
                serializer = AdminSerializer(user_object)

            temp_dict = {}
            temp_dict = serializer.data.copy()

            isSuperAdmin = False
            try:
                superAdmin_object = SuperAdmins.objects.get(uname=user_object.uname)
                isSuperAdmin = True
            except SuperAdmins.DoesNotExist:
                pass

            temp_dict['isSuperAdmin'] = isSuperAdmin
            return Response(temp_dict, status.HTTP_200_OK)

    def put(self, request, uname, format=None):
        
        admin = False
        try:
            user_object = Users.objects.get(uname=uname)
        except Users.DoesNotExist:
            user_object = Admins.objects.get(uname=uname)
            admin = True
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        if admin == False:
            userToken = request.headers.get("user-token")
        else:
            userToken = request.headers.get("admin-token")
            
        if userToken != user_object.token:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        valid_token = check_token_validity_by_timestamp(user_object, admin)
        if valid_token != True:
            return Response(valid_token, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'PUT': 
            if request.data.get('uname') != None:
                if admin == False:
                    Users.objects.filter(token=userToken).update(uname=request.data.get('uname'))
                else:
                    Admins.objects.filter(token=userToken).update(uname=request.data.get('uname'))
                return Response(status=status.HTTP_200_OK)
            
            if request.data.get('email') != None:
                # user_object.email = request.data.get('email')
                # user_object.save()
                if admin == False:
                    Users.objects.filter(token=userToken).update(email=request.data.get('email'))
                else:
                    Admins.objects.filter(token=userToken).update(email=request.data.get('email'))
                return Response(status=status.HTTP_200_OK)

            if request.data.get('password') != None:

                try:
                    user_object_passwords = Passwords.objects.filter(uname=user_object.uname)
                except Passwords.DoesNotExist:
                    return Response(status=status.HTTP_404_NOT_FOUND)
                
                temp_dict = {}
                temp_dict = request.data.copy()

                if admin==False:
                    old_masterpwd_decrypted = temp_dict.get('password')
                    old_masterpwd_hashed = hash_password_salt(old_masterpwd_decrypted, user_object.salt_1)
                    old_masterpwd_hashedhashed = hash_password_salt(old_masterpwd_hashed, user_object.salt_2)

                    if (old_masterpwd_hashedhashed != user_object.hashedhashed_masterpwd):
                        return Response(status=status.HTTP_403_FORBIDDEN)

                    hashed_password = hash_password(temp_dict.get("newPassword"))
                    hashed_hashed_password = hash_password(hashed_password[0])

                    key = codecs.decode(user_object.encrypted_key, 'hex_codec')
                    iv = codecs.decode(user_object.iv, 'hex_codec')
                    decrypted_key = decrypt_data(key, old_masterpwd_hashed.encode(), iv)
                    encrypted_key = encrypt_data(decrypted_key, hashed_password[0].encode(), iv)
                    
                    for password in user_object_passwords:

                        website_password_iv = codecs.decode(password.iv, 'hex_codec')

                        dehexed_password = codecs.decode(password.encrypted_pwd, 'hex_codec')
                        decrypted_website_password = decrypt_data(dehexed_password, decrypted_key, website_password_iv)
                        encrypted_website_password = encrypt_data(decrypted_website_password, decrypted_key, website_password_iv)
                        password.encrypted_pwd = encrypted_website_password.hex()
                        password.save()

                    user_object.hashedhashed_masterpwd = hashed_hashed_password[0]
                    user_object.salt_1 = hashed_password[1]
                    user_object.salt_2 = hashed_hashed_password[1]
                    user_object.encrypted_key = encrypted_key.hex()
                    user_object.save()
                    return Response(status=status.HTTP_200_OK)

                else:
                    old_masterpwd_decrypted = temp_dict.get('password')
                    old_masterpwd_hashed = hash_password_salt(old_masterpwd_decrypted, user_object.salt)

                    if (old_masterpwd_hashed != user_object.hashed_pwd):
                        return Response(status=status.HTTP_403_FORBIDDEN)
                    
                    hashed_password = hash_password(temp_dict.get("newPassword"))
                    user_object.hashed_pwd = hashed_password[0]
                    user_object.salt = hashed_password[1]
                    user_object.save()
                    return Response(status=status.HTTP_200_OK)

    def delete(self, request, uname, format=None):
        admin = False
        try:
            user_object = Users.objects.get(uname=uname)
        except Users.DoesNotExist:
            user_object = Admins.objects.get(uname=uname)
            admin = True
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        if 'HTTP_SUPER_ADMIN_TOKEN' in request.META:
            userToken = request.headers.get("super-admin-token")
            superAdmin_object = Admins.objects.get(uname=request.headers.get('super-admin-uname'))
        else:
            if admin == False:
                userToken = request.headers.get("user-token")
            else:
                userToken = request.headers.get("admin-token")

        if userToken != superAdmin_object.token:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        valid_token = check_token_validity_by_timestamp(superAdmin_object, True)
        if valid_token != True:
            return Response(valid_token, status=status.HTTP_200_OK)


        if request.method == 'DELETE':
            user_object.delete()
            return Response(status=status.HTTP_200_OK)

    def post(self, request, uname, format=None):
        serializer_class = WriteAdminPasswordApiSerializer

        if request.method == 'POST':
            try:
                admin_object = Admins.objects.get(uname=uname)
            except Admins.DoesNotExist:
                 return Response(status=status.HTTP_404_NOT_FOUND)

            if request.headers.get("email-token") != admin_object.email_token:
                return Response(status=status.HTTP_403_FORBIDDEN)

            temp_dict = {}
            temp_dict = request.data.copy()

            hashed_password = hash_password(request.data.get('password'))

            admin_object.hashed_pwd = hashed_password[0]
            admin_object.salt = hashed_password[1]
            admin_object.save()

            temp_dict['uname'] = uname
            
            return Response(status=status.HTTP_200_OK)


class UsersApiView(APIView):

    def get(self, request):
        if request.method == 'GET':
            try:
                admin_object = Admins.objects.get(uname=request.headers.get('admin-uname'))
            except Admins.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

            token = check_token_validity_by_timestamp(admin_object, True)
            if admin_object.token != request.headers.get('admin-token') or token != True:
                return Response(status=status.HTTP_403_FORBIDDEN)
            
            data = Users.objects.all()
            serializer = UsersSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)


class PFPView(APIView):
    def get(self, request, uname, format=None):
        try:
            user_object = Users.objects.get(uname=uname)
        except Users.DoesNotExist:
            return Response(status=status.HTTP_403_FORBIDDEN)

        userToken = request.headers.get("user-token")
        if userToken != user_object.token:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        valid_token = check_token_validity_by_timestamp(user_object, False)
        if valid_token != True:
            return Response(valid_token, status.HTTP_403_FORBIDDEN)

        if request.method == 'GET':
            temp_dict = {}
            print(user_object.pfpURL)
            temp_dict["pfpURL"] = user_object.pfpURL
            return Response(temp_dict, status.HTTP_200_OK)

    def post(self, request, uname, format=None):
        try:
            user_object = Users.objects.get(uname=uname)
        except Users.DoesNotExist:
            return Response(status=status.HTTP_403_FORBIDDEN)

        userToken = request.headers.get("user-token")
        if userToken != user_object.token:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        valid_token = check_token_validity_by_timestamp(user_object, False)
        if valid_token != True:
            return Response(valid_token, status.HTTP_403_FORBIDDEN)

        #serializer_class = PFPApiSerializer

        if request.method == 'POST':
            temp_dict = {}

            user_object.pfpURL = "https://passwordhandler.s3.eu-north-1.amazonaws.com/" + user_object.pfpid
            user_object.save()

            s3_client = boto3.client('s3', aws_access_key_id=str(os.getenv('AWS_ACCESS_KEY_ID')),
                                     aws_secret_access_key=str(os.getenv('AWS_SECRET_ACCESS_KEY')),
                                     region_name=str(os.getenv('AWS_S3_REGION_NAME')), 
                                     config=Config(signature_version='s3v4'))

            response = s3_client.generate_presigned_url('put_object', Params={
                'Bucket': str(os.getenv('AWS_STORAGE_BUCKET_NAME')),
                'Key': user_object.pfpid
            },
                ExpiresIn=604700)
            
            temp_dict["pfp"] = response
            temp_dict["pfpURL"] = user_object.pfpURL
            print(temp_dict)
            return Response(temp_dict, status=status.HTTP_200_OK)


class ChangeUsernameApiView(APIView):

    serializer_class = ChangeUsernameApiSerializer

    def post(self, request):
        if request.method == 'POST':
            try:
                valid_token = check_token_validity_by_timestamp(Users.objects.get(token=request.data.get('token')), False)
                if valid_token != True:
                    return Response(valid_token, status=status.HTTP_200_OK)

                Users.objects.filter(token=request.data.get('token')).update(uname=request.data.get('new_uname'))
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            return Response(status=status.HTTP_200_OK)


class ChangeEmailApiView(APIView):

    serializer_class = ChangeEmailApiSerializer

    def post(self, request):
        if request.method == 'POST':
            try:
                valid_token = check_token_validity_by_timestamp(Users.objects.get(token=request.data.get('token')), False)
                if valid_token != True:
                    return Response(valid_token, status=status.HTTP_200_OK)

                Users.objects.filter(token=request.data.get('token')).update(email=request.data.get('new_email'))
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
                
            return Response(status=status.HTTP_200_OK)


class AdminsApiView(APIView):

    def get(self, request):
        if request.method == 'GET':
            try:
                admin_object = Admins.objects.get(uname=request.headers.get('super-admin-uname'))
                superAdmin_object = SuperAdmins.objects.get(uname=request.headers.get('super-admin-uname'))
            except Admins.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            except:
                return Response(status=status.HTTP_404_NOT_FOUND)

            token = check_token_validity_by_timestamp(admin_object, True)
            if admin_object.token != request.headers.get('super-admin-token') or token != True:
                return Response(status=status.HTTP_403_FORBIDDEN)   

            admins = Admins.objects.all()
            serializer = AdminsSerializer(admins, context={'request': request}, many=True)
            temp_dict = serializer.data.copy()
            count = 0

            for admin in admins:
                superAdmin = SuperAdmins.objects.filter(uname=admin.uname)

                if not superAdmin:
                    temp_dict[count]["isSuperAdmin"] = False
                else:
                    temp_dict[count]["isSuperAdmin"] = True
                count = count +1

            return Response(temp_dict)


class AdminApiView(APIView):

    serializer_class = AdminsSerializerApi

    def post(self, request):
        superAdminToken = request.headers.get("super-admin-token")
        try:
            admin_object = Admins.objects.get(token=superAdminToken)
            superAdmin_object = SuperAdmins.objects.get(uname=request.headers.get("super-admin-uname"))
        except Admins.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if superAdminToken != admin_object.token:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        valid_token = check_token_validity_by_timestamp(admin_object, True)
        if valid_token != True:
            return Response(valid_token, status=status.HTTP_200_OK)

        if request.method == 'POST':
            temp_dict = {}
            temp_dict = request.data.copy()

            serializer = AdminsSerializer(data=temp_dict)
            if serializer.is_valid(raise_exception=True):
                serializer.save()

            try:
                admin_object = Admins.objects.get(uname=request.data.get('uname'))
            except Admins.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

            try:
                admin_object.email_token = generate_token(32)
                admin_object.save()
                send_mail(
                    subject='Password creation for admin',
                    message='A new admin account has been created, kindly use this' + '\n' +
                            'http://localhost:3000/passwordhandler/admin/complete?uname=' +
                            admin_object.uname + '&token=' +  str(admin_object.email_token) + '\n' + 
                            'link to complete the account \n' +
                            'Regards, The PasswordHandler Team!',
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[admin_object.email],
                    fail_silently=False,
                )
                
            except SMTPException:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            
            return Response(status=status.HTTP_200_OK)


class SuperAdminsApiView(APIView):
    serializer_class = SuperAdminsApiSerializer

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

            return Response(status=status.HTTP_201_CREATED)


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

    

    def post(self, request, uname, format=None):

        serializer_class = PasswordsApiSerializer

        try:
            user_object = Users.objects.get(uname=uname)
        except Users.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        userToken = request.headers.get("user-token")
        if userToken != user_object.token:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        valid_token = check_token_validity_by_timestamp(user_object, False)
        if valid_token != True:
            return Response(status=status.HTTP_403_FORBIDDEN)
        

        if request.method == 'POST':

            temp_dict = {}
            temp_dict = request.data.copy()

            masterpwd_decrypted = temp_dict.get('password')
            masterpwd_hashed = hash_password_salt(masterpwd_decrypted, user_object.salt_1)
            masterpwd_hashedhashed = hash_password_salt(masterpwd_hashed, user_object.salt_2)

            if (masterpwd_hashedhashed != user_object.hashedhashed_masterpwd):
                return Response(status=status.HTTP_403_FORBIDDEN)

            key = codecs.decode(user_object.encrypted_key, 'hex_codec')  # from hex to byte
            iv = codecs.decode(user_object.iv, 'hex_codec')

            new_iv = generate_iv()

            decrypted_key = decrypt_data(key, masterpwd_hashed.encode(), iv)
            encrypted_password = encrypt_data(get_password(10), decrypted_key, new_iv)

            temp_dict['encrypted_pwd'] = encrypted_password.hex()
            temp_dict['iv'] = new_iv.hex()
            temp_dict['uname'] = user_object.uname

            # Add all the fields from the API call to the database
            serializer = PasswordsSerializer(data=temp_dict)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, uname, format=None):

        try:
            user_object = Users.objects.get(uname=uname)
        except Users.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        userToken = request.headers.get("user-token")
        if userToken != user_object.token:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        valid_token = check_token_validity_by_timestamp(user_object, False)
        if valid_token != True:
            return Response(status=status.HTTP_403_FORBIDDEN)

        
        if request.method == 'PUT':
            try:
                password = Passwords.objects.get(uname=user_object.uname, 
                                                    website_url=request.data.get('website_url'), 
                                                    website_uname=request.data.get('website_uname'))
            except Passwords.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

            temp_dict = {}
            temp_dict = request.data.copy()

            masterpwd_decrypted = temp_dict.get('password')
            masterpwd_hashed = hash_password_salt(masterpwd_decrypted, user_object.salt_1)
            masterpwd_hashedhashed = hash_password_salt(masterpwd_hashed, user_object.salt_2)

            if (masterpwd_hashedhashed != user_object.hashedhashed_masterpwd):
                return Response(status=status.HTTP_403_FORBIDDEN)

            key = codecs.decode(user_object.encrypted_key, 'hex_codec')  # from hex to byte
            iv = codecs.decode(user_object.iv, 'hex_codec')

            website_password_iv = codecs.decode(password.iv, 'hex_codec')
            decrypted_key = decrypt_data(key, masterpwd_hashed.encode(), iv)
            decrypted_website_password = b64encode(decrypt_data(password.encrypted_pwd.encode(), decrypted_key, website_password_iv)).decode("utf-8")

            temp_dict['website_password'] = decrypted_website_password
            serializer = GetPasswordApiSerializer(temp_dict)
            return Response(serializer.data, status=status.HTTP_200_OK)


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


""" Maybe remove? See put method in class NewWebsitePasswordsApiView """
class ChangeUserPasswordApiView(APIView):

    serializer_class = ChangePasswordUserApiSerializer

    def post(self, request):
        if request.method == 'POST':
            try:
                user_object = Users.objects.get(token=request.data.get('token'))
                user_object_passwords = Passwords.objects.filter(uname=user_object.uname)
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            valid_token = check_token_validity_by_timestamp(Users.objects.get(token=request.data.get('token')), False)
            if valid_token != True:
                return Response(valid_token, status=status.HTTP_200_OK)
            
            temp_dict = {}
            temp_dict = request.data.copy()

            old_masterpwd_decrypted = temp_dict.get('password')
            old_masterpwd_hashed = hash_password_salt(old_masterpwd_decrypted, user_object.salt_1)
            old_masterpwd_hashedhashed = hash_password_salt(old_masterpwd_hashed, user_object.salt_2)

            if (old_masterpwd_hashedhashed != user_object.hashedhashed_masterpwd):
                return Response(status=status.HTTP_409_CONFLICT)

            hashed_password = hash_password(temp_dict.get("newPassword"))
            hashed_hashed_password = hash_password(hashed_password[0])

            key = codecs.decode(user_object.encrypted_key, 'hex_codec')
            iv = codecs.decode(user_object.iv, 'hex_codec')
            decrypted_key = decrypt_data(key, old_masterpwd_hashed.encode(), iv)
            encrypted_key = encrypt_data(decrypted_key, hashed_password[0].encode(), iv)

            for password in user_object_passwords:

                website_password_iv = codecs.decode(password.iv, 'hex_codec')

                dehexed_password = codecs.decode(password.encrypted_pwd, 'hex_codec')
                decrypted_website_password = decrypt_data(dehexed_password, decrypted_key, website_password_iv)
                encrypted_website_password = encrypt_data(decrypted_website_password, decrypted_key, website_password_iv)
                password.encrypted_pwd = encrypted_website_password.hex()
                password.save()

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
            encrypted_password = encrypt_data(get_password(10), decrypted_key, iv_password) #No hex

            # ORM did not work. Manually constructed a query for updating an existing password for a website.
            # TODO: Check for alternate solution or why ORM doesn't work
            cursor.execute('UPDATE passwords SET encrypted_pwd = %s WHERE uname = %s AND website_url = %s AND website_uname = %s', 
            [encrypted_password.hex(), request.data.get('uname'), request.data.get('website_url'), request.data.get('website_uname')])
            connection.commit()
            return Response(status=status.HTTP_200_OK)

#använder
class GetUnameView(APIView):

    def get(self, request, identification, format=None):

        if request.method == 'GET':
            temp_dict = {}
            temp_dict = request.data.copy()

            try:
                user_object = Users.objects.get(uname=identification)
                # temp_dict['uname'] = request.data.get('identification')
                temp_dict['uname'] = user_object.uname
            except Users.DoesNotExist:
                user_object = Users.objects.get(email=identification)
                temp_dict['uname'] = user_object.uname
            except:
                return Response(status=status.HTTP_404_NOT_FOUND)
            serializer = GetUserSerializer(temp_dict)
            
            return Response(serializer.data, status=status.HTTP_200_OK)

#använder
class LoginApiView(APIView):

    serializer_class = LoginApiSerializer

    def post(self, request, uname, format=None):

        cursor = connection.cursor()

    
        if request.method == 'POST':
            temp_dict = {}
            temp_dict = request.data.copy()

            admin = False
            if 'admin' in request.META['PATH_INFO']:
                try:
                    user_object = Admins.objects.get(uname=uname)
                    admin = True
                except Users.DoesNotExist:
                    return Response(status=status.HTTP_404_NOT_FOUND)
            else:
                try:
                    user_object = Users.objects.get(uname=uname)
                except:
                    return Response(status=status.HTTP_404_NOT_FOUND)

            
            if admin==False:
                masterpwd_decrypted = request.data.get('password')
                masterpwd_hashed = hash_password_salt(masterpwd_decrypted, user_object.salt_1)
                masterpwd_hashedhashed = hash_password_salt(masterpwd_hashed, user_object.salt_2)

                if (masterpwd_hashedhashed != user_object.hashedhashed_masterpwd):
                    return Response(status=status.HTTP_403_FORBIDDEN)

            else:
                masterpwd_decrypted = request.data.get('password')
                masterpwd_hashed = hash_password_salt(masterpwd_decrypted, user_object.salt)

                if (masterpwd_hashed != user_object.hashed_pwd):
                    return Response(status=status.HTTP_403_FORBIDDEN)

            if admin==False:
                cursor.execute('SELECT ip FROM ips WHERE uname = %s ', [user_object.uname])
            else:
                cursor.execute('SELECT ip FROM admin_ips WHERE uname = %s ', [user_object.uname])
            
            all_user_ips = cursor.fetchall()

            ip_exist = False
            for ip in all_user_ips:
                if ip[0] == request.data.get('ip'):
                    ip_exist = True
    
            if(ip_exist == False):
                try:
                    user_object.email_token = generate_token(32)
                    user_object.save()
                    
                    if admin == False:
                        send_mail(
                            subject='New login location detected',
                            message='Hi ' + user_object.uname + ',' + '\n' +
                                    'We are confirming that a new login location has been detected for ' +
                                    user_object.uname + ' with this IP-address ' + request.data.get('ip') + '.' + '\n' +
                                    'Click the link and follow the instructions to verify the login. \n' +
                                    'Link: ' + 'http://localhost:3000/passwordhandler/confirmIP?uname=' + 
                                    user_object.uname + '&token=' +  str(user_object.email_token) + '&ip=' + request.data.get('ip') + '\n' +
                                    'Regards, The PasswordHandler Team!',
                            from_email=settings.EMAIL_HOST_USER,
                            recipient_list=[user_object.email],
                            fail_silently=False,
                        )
                    
                    else:
                        send_mail(
                            subject='New login location detected',
                            message='Hi ' + user_object.uname + ',' + '\n' +
                                    'We are confirming that a new login location has been detected for ' +
                                    user_object.uname + ' with this IP-address ' + request.data.get('ip') + '.' + '\n' +
                                    'Click the link and follow the instructions to verify the login. \n' +
                                    'Link: ' + 'http://localhost:3000/passwordhandler/confirmIP?uname=' + 
                                    user_object.uname + '&admin-token=' +  str(user_object.email_token) + '&ip=' + request.data.get('ip') + '\n' +
                                    'Regards, The PasswordHandler Team!',
                            from_email=settings.EMAIL_HOST_USER,
                            recipient_list=[user_object.email],
                            fail_silently=False,
                        )
                  
                except SMTPException:
                    return Response(status=status.HTTP_400_BAD_REQUEST)
                return Response(status=status.HTTP_401_UNAUTHORIZED)  
            else:
                token = generate_token(32)
                user_object.token = token
                user_object.token_timestamp = None
                user_object.save()

                response = Response(status=status.HTTP_200_OK)
                if(admin==False): 
                    response.headers['user-token'] = token
                else:
                    response.headers['admin-token'] = token

                return response


class LogoutApiView(APIView):
    
    def get(self, request, uname, format=None):
        
        if request.method == 'GET':
            admin = False
            try:
                user_object = Users.objects.get(uname=uname)
            except Users.DoesNotExist:
                user_object = Admins.objects.get(uname=uname)
                admin = True
            except:
                return Response(status=status.HTTP_404_NOT_FOUND)
            
            if admin == False:
                userToken = request.headers.get("user-token")
            else:
                userToken = request.headers.get("admin-token")

            if userToken != user_object.token:
                return Response(status=status.HTTP_403_FORBIDDEN)
            
            user_object.token = None
            user_object.save()

            temp_dict = {}
            temp_dict = request.data.copy()
            temp_dict["error"] = "INVALID_TOKEN"

            return Response(temp_dict, status=status.HTTP_200_OK)


class ConfirmIpApiView(APIView):

    serializer_class = ConfirmIpApiSerializer

    def post(self, request, uname, format=None):
        
        if request.method == 'POST':
            admin = False
            try:
                user_object = Users.objects.get(uname=uname)
            except Users.DoesNotExist:
                user_object = Admins.objects.get(uname=uname)
                admin = True
            except:
                return Response(status=status.HTTP_404_NOT_FOUND)

            valid_email_token = check_email_token_validity_by_timestamp(user_object, admin)
            if valid_email_token != True:
                return Response(valid_email_token, status=status.HTTP_403_FORBIDDEN)

            emailToken = request.headers.get("email-token")
            if emailToken != user_object.email_token:
                return Response(status=status.HTTP_403_FORBIDDEN)

            temp_dict = {}
            temp_dict = request.data.copy()
            temp_dict["uname"] = user_object.uname

            if admin==False:
                serializer = IpsSerializer(data=temp_dict)
            else:
                serializer = AdminsIpsSerializer(data=temp_dict)

            try:
                if serializer.is_valid(raise_exception=True):
                    serializer.save()
                    return Response(status=status.HTTP_200_OK)
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)


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


class ReadAllUserPasswordsView(APIView):

    serializer_class = ReadAllUserPasswordsSerializer

    def get(self, request, uname, format=None):

        try:
            user_object = Users.objects.get(uname=uname)
        except Users.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        userToken = request.headers.get("user-token")
        if userToken != user_object.token:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        valid_token = check_token_validity_by_timestamp(user_object, False)
        if valid_token != True:
            return Response(valid_token, status=status.HTTP_403_FORBIDDEN)
       
        if request.method == 'GET':
            try:
                passwords = Passwords.objects.filter(uname=user_object.uname)
            except Passwords.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

            serializer = ReadPasswordsSerializer(passwords, context={'request': request}, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)


class GetWebsitePasswordsApiView(APIView):

    serializer_class = GetPasswordApiSerializer

    def post(self, request):
        if request.method == 'POST':
           
            try:
                user_object = Users.objects.get(token=request.data.get('token'))
                password = Passwords.objects.get(uname=user_object.uname, 
                                                    website_url=request.data.get('website_url'), 
                                                    website_uname=request.data.get('website_uname'))
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            valid_token = check_token_validity_by_timestamp(user_object, False)
            if valid_token != True:
                return Response(valid_token, status=status.HTTP_200_OK)

            temp_dict = {}
            temp_dict = request.data.copy()

            masterpwd_decrypted = temp_dict.get('password')
            masterpwd_hashed = hash_password_salt(masterpwd_decrypted, user_object.salt_1)
            masterpwd_hashedhashed = hash_password_salt(masterpwd_hashed, user_object.salt_2)

            if (masterpwd_hashedhashed != user_object.hashedhashed_masterpwd):
                return Response(status=status.HTTP_409_CONFLICT)

            key = codecs.decode(user_object.encrypted_key, 'hex_codec')  # from hex to byte
            iv = codecs.decode(user_object.iv, 'hex_codec')

            website_password_iv = codecs.decode(password.iv, 'hex_codec')
            decrypted_key = decrypt_data(key, masterpwd_hashed.encode(), iv)
            decrypted_website_password = b64encode(decrypt_data(password.encrypted_pwd.encode(), decrypted_key, website_password_iv)).decode("utf-8")

            temp_dict['website_password'] = decrypted_website_password

            serializer = GetPasswordApiSerializer(temp_dict)
            return Response(serializer.data, status=status.HTTP_200_OK)
