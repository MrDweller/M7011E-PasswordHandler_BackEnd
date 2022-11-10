from rest_framework import serializers
from . models import *

class AdminsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admins
        fields = ["uname", "email", "hashed_pwd", "salt"]

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["uname", "email", "hashedhashed_masterpwd", "salt_1", "salt_2", "encrypted_key", "iv"]