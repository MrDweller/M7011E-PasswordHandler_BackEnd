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

class UserApiView(APIView):

    # A new serializer is created for API input
    serializer_class = UserApiSerializer

    def post(self, request):

        if request.method == 'POST':

            temp_dict = {}
            temp_dict = request.data.copy()
            print(temp_dict)
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
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        if admin == False:
            userToken = request.headers.get("user_token")
        else:
            userToken = request.headers.get("admin_token")
            
        if userToken != user_object.token:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        valid_token = check_token_validity_by_timestamp(user_object)
        if valid_token != True:
            return Response(valid_token, status=status.HTTP_200_OK)

        if request.method == 'GET': 
            if admin == False:
                serializer = UsersSerializer(user_object)
            else:
                serializer = AdminSerializer(user_object)
            return Response(serializer.data)

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
            userToken = request.headers.get("user_token")
        else:
            userToken = request.headers.get("admin_token")
            
        if userToken != user_object.token:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        valid_token = check_token_validity_by_timestamp(user_object)
        if valid_token != True:
            return Response(valid_token, status=status.HTTP_200_OK)

        if request.method == 'PUT': 
            if request.data.get('uname') != None:
                user_object.uname = request.data.get('uname')
                user_object.save()
                return Response(status=status.HTTP_200_OK)
            
            if request.data.get('email') != None:
                user_object.email = request.data.get('email')
                user_object.save()
                return Response(status=status.HTTP_200_OK)

            if request.data.get('password') != None:
                try:
                    user_object_passwords = Passwords.objects.filter(uname=user_object.uname)
                except Passwords.DoesNotExist:
                    return Response(status=status.HTTP_400_BAD_REQUEST)
                
                temp_dict = {}
                temp_dict = request.data.copy()

                if admin==False:
                    old_masterpwd_decrypted = temp_dict.get('password')
                    old_masterpwd_hashed = hash_password_salt(old_masterpwd_decrypted, user_object.salt_1)
                    old_masterpwd_hashedhashed = hash_password_salt(old_masterpwd_hashed, user_object.salt_2)

                    if (old_masterpwd_hashedhashed != user_object.hashedhashed_masterpwd):
                        return Response(status=status.HTTP_400_BAD_REQUEST)

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
                        return Response(status=status.HTTP_400_BAD_REQUEST)
                    
                    hashed_password = hash_password(temp_dict.get("password"))
                    user_object.pwd = hashed_password[0]
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
        
        if admin == False:
            userToken = request.headers.get("user_token")
        else:
            userToken = request.headers.get("admin_token")
            
        if userToken != user_object.token:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        valid_token = check_token_validity_by_timestamp(user_object)
        if valid_token != True:
            return Response(valid_token, status=status.HTTP_200_OK)


        if request.method == 'DELETE':
            user_object.delete()
            return Response(status=status.HTTP_200_OK)


class UsersApiView(APIView):

    def get(self, request):
        if request.method == 'GET':
            data = Users.objects.all()
            serializer = UsersSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)


class ChangeUsernameApiView(APIView):

    serializer_class = ChangeUsernameApiSerializer

    def post(self, request):
        if request.method == 'POST':
            try:
                valid_token = check_token_validity_by_timestamp(Users.objects.get(token=request.data.get('token')))
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
                valid_token = check_token_validity_by_timestamp(Users.objects.get(token=request.data.get('token')))
                if valid_token != True:
                    return Response(valid_token, status=status.HTTP_200_OK)

                Users.objects.filter(token=request.data.get('token')).update(email=request.data.get('new_email'))
            except Users.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
                
            return Response(status=status.HTTP_200_OK)


class AdminsApiView(APIView):

    def get(self, request):
        if request.method == 'GET':
            data = Admins.objects.all()
            serializer = AdminsSerializer(data, context={'request': request}, many=True)
            return Response(serializer.data)


#On hold, not decided what to do with password yet
class AdminApiView(APIView):

    serializer_class = AdminsSerializerApi

    def post(self, request):
        superAdminToken = request.headers.get("super_admin_token")

        try:
            admin_object = Admins.objects.get(token=superAdminToken)
            superAdmin_object = SuperAdmins.objects.get(uname=admin_object.uname)
        except Admins.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if superAdminToken != admin_object.token:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        valid_token = check_token_validity_by_timestamp(admin_object)
        if valid_token != True:
            return Response(valid_token, status=status.HTTP_200_OK)

        if request.method == 'POST':

            temp_dict = {}
            temp_dict = request.data.copy()

            hashed_password = hash_password(request.data.get('password'))

            temp_dict['hashed_pwd'] = hashed_password[0]
            temp_dict['salt'] = hashed_password[1]

            temp_dict["ip"] = request.data.get('ip')

            serializer = AdminsSerializer(data=temp_dict)

            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            
            serializer = IpsSerializer(data=temp_dict)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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


class   IpsApiView(APIView):

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

    serializer_class = PasswordsApiSerializer

    def post(self, request, uname, format=None):

        try:
            user_object = Users.objects.get(uname=uname)
        except Users.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        userToken = request.headers.get("user_token")
        if userToken != user_object.token:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        valid_token = check_token_validity_by_timestamp(user_object)
        if valid_token != True:
            return Response(valid_token, status=status.HTTP_200_OK)
        

        if request.method == 'POST':

            temp_dict = {}
            temp_dict = request.data.copy()

            masterpwd_decrypted = temp_dict.get('password')
            masterpwd_hashed = hash_password_salt(masterpwd_decrypted, user_object.salt_1)
            masterpwd_hashedhashed = hash_password_salt(masterpwd_hashed, user_object.salt_2)

            if (masterpwd_hashedhashed != user_object.hashedhashed_masterpwd):
                return Response(status=status.HTTP_400_CONFLICT)

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
            return Response(status=status.HTTP_400_BAD_REQUEST)

        userToken = request.headers.get("user_token")
        if userToken != user_object.token:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        valid_token = check_token_validity_by_timestamp(user_object)
        if valid_token != True:
            return Response(valid_token, status=status.HTTP_200_OK)

        
        if request.method == 'PUT':
            try:
                password = Passwords.objects.get(uname=user_object.uname, 
                                                    website_url=request.data.get('website_url'), 
                                                    website_uname=request.data.get('website_uname'))
            except Passwords.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

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

            temp_dict['password'] = decrypted_website_password

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

            valid_token = check_token_validity_by_timestamp(Users.objects.get(token=request.data.get('token')))
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


class LoginApiView(APIView):

    serializer_class = LoginApiSerializer

    def post(self, request, uname, format=None):

        cursor = connection.cursor()

        if request.method == 'POST':
            temp_dict = {}
            temp_dict = request.data.copy()

            admin=False
            try:
                user_object = Users.objects.get(uname=uname)
            except Users.DoesNotExist:
                user_object = Admins.objects.get(uname=uname)
                admin = True
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            masterpwd_decrypted = request.data.get('password')
            masterpwd_hashed = hash_password_salt(masterpwd_decrypted, user_object.salt_1)
            masterpwd_hashedhashed = hash_password_salt(masterpwd_hashed, user_object.salt_2)

            if (masterpwd_hashedhashed != user_object.hashedhashed_masterpwd):
                return Response(status=status.HTTP_409_CONFLICT)

            cursor.execute('SELECT ip FROM ips WHERE uname = %s ', [user_object.uname])
            all_user_ips = cursor.fetchall()

            ip_exist = False
            for ip in all_user_ips:
                if ip[0] == request.data.get('ip'):
                    ip_exist = True
    
            if(ip_exist == False):
                try:
                    user_object.email_token = generate_token(32)
                    user_object.save()
                    send_mail(
                        subject='New login location detected',
                        message='Hi ' + user_object.uname + ',' + '\n' +
                                'We are confirming that a new login location has been detected for ' +
                                user_object.uname + ' with this IP-address ' + request.data.get('ip') + '.' + '\n' +
                                'Click the link and follow the instructions to verify the login. \n' +
                                'Link: ' + 'http://localhost:3000/passwordhandler/confirmIP?token=' + 
                                str(user_object.email_token) + '&ip=' + request.data.get('ip') + '\n' +
                                'Regards, The PasswordHandler Team!',
                        from_email=settings.EMAIL_HOST_USER,
                        recipient_list=[user_object.email],
                        fail_silently=False,
                    )
                  
                except SMTPException:
                    return Response(status=status.HTTP_404_NOT_FOUND)
                return Response(status=status.HTTP_200_OK)
            else:
                token = generate_token(32)
                user_object.token = token
                user_object.token_timestamp = None
                user_object.save()

                response = Response(status=status.HTTP_200_OK)
                if(admin==False): 
                    response['user_token'] = token
                else:
                    response['admin_token'] = token
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
                return Response(status=status.HTTP_400_BAD_REQUEST)
            
            if admin == False:
                userToken = request.headers.get("user_token")
            else:
                userToken = request.headers.get("admin_token")

            if userToken != user_object.token:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            
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
                admin =True
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            valid_email_token = check_email_token_validity_by_timestamp(user_object)
            if valid_email_token != True:
                return Response(valid_email_token, status=status.HTTP_200_OK)

            emailToken = request.headers.get("email_token")
            if emailToken != user_object.email_token:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            temp_dict = {}
            temp_dict = request.data.copy()
            temp_dict["uname"] = user_object.uname

            serializer = IpsSerializer(data=temp_dict)
            
            try:
                if serializer.is_valid(raise_exception=True):
                    serializer.save()
                    return Response(status=status.HTTP_201_CREATED)
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
            return Response(status=status.HTTP_400_BAD_REQUEST)

        userToken = request.headers.get("user_token")
        if userToken != user_object.token:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        valid_token = check_token_validity_by_timestamp(user_object)
        if valid_token != True:
            return Response(valid_token, status=status.HTTP_200_OK)
       
        if request.method == 'GET':
            try:
                passwords = Passwords.objects.filter(uname=user_object.uname)
            except Passwords.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            serializer = ReadPasswordsSerializer(passwords, context={'request': request}, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)


class GetWebsitePasswordsApiView(APIView):

    serializer_class = GetPasswordApiSerializer

    def post(self, request):
        print(request.data)

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

            valid_token = check_token_validity_by_timestamp(user_object)
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

            temp_dict['password'] = decrypted_website_password

            serializer = GetPasswordApiSerializer(temp_dict)
            return Response(serializer.data, status=status.HTTP_200_OK)
