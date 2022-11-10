from rest_framework import serializers
from . models import *

class UserSerializerApi(serializers.ModelSerializer):
    class Meta:
        model = UserApi
        fields = ["uname", "email", "password"]

# class UsersSerializerApi(serializers.ModelSerializer):
#     class Meta:
#         model = UsersApi
#         fields = ["uname", "email", "password"]


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


class IpsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ips
        fields = ["uname", "ip"]

class FeedbacksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["id", "uname", "feedback"]
