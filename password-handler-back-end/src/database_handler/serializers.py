from rest_framework import serializers
from . models import *

class UserApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserApi
        fields = ["uname", "email", "password"]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["uname", "email", "hashedhashed_masterpwd", "salt_1", "salt_2", "encrypted_key", "iv"]

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["uname", "email"]

class AdminsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admins
        fields = ["uname", "email", "hashed_pwd", "salt"]

class AdminsSerializerApi(serializers.ModelSerializer):
    class Meta:
        model = AdminsApi
        fields = ["uname", "email", "password"]

class SuperAdminsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuperAdmins
        fields = ["uname", "email", "hashed_pwd", "salt"]

class SuperAdminsSerializerApi(serializers.ModelSerializer):
    class Meta:
        model = SuperAdminsApi
        fields = ["uname", "email", "password"]

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["id", "feedback"]
        
class IpsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ips
        fields = ["uname", "ip"]

class PasswordsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passwords
        fields = ["uname", "website_url", "website_uname", "encrypted_pwd"]

class PasswordsApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordsApi
        fields = ["uname", "yourPassword", "website_url", "website_uname", "password"]
        
class RemoveUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["uname"]

class RemoveAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admins
        fields = ["uname"]

class RemoveFeedbackApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackApi
        fields = ["id"]

class RemoveIpsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ips
        fields = ["uname"]

class ChangePasswordUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserChangePasswordApi
        fields = ["uname", "oldPassword","newPassword"]

