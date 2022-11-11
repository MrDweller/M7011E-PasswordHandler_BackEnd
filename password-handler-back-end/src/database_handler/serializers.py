from rest_framework import serializers
from . models import *

class UserSerializerApi(serializers.ModelSerializer):
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

class SuperAdminsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuperAdmins
        fields = ["uname", "email", "hashed_pwd", "salt"]

        model = Users
        fields = ["uname", "email", "hashedhashed_masterpwd", "salt_1", "salt_2", "encrypted_key", "iv"]

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["id", "uname", "feedback"]
        
class IpsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ips
        fields = ["uname", "ip"]
        
class RemoveUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["uname"]

class RemoveAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admins
        fields = ["uname"]

class RemoveFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["id"]

class RemoveIpsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ips
        fields = ["uname"]

class ChangePasswordUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserChangePasswordApi
        fields = ["uname", "newPassword"]
