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


class GetUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["uname"]


class ChangeUsernameApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChangeUsernameApi
        fields = ["token", "new_uname"]


class ChangeEmailApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChangeEmailApi
        fields = ["token", "new_email"]


class AdminsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admins
        fields = ["uname", "email", "hashed_pwd", "salt"]

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admins
        fields = ["uname", "email"]


class AdminsSerializerApi(serializers.ModelSerializer):
    class Meta:
        model = AdminsApi
        fields = ["uname", "email", "ip"]


class SuperAdminsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuperAdmins
        fields = ["uname"]


class SuperAdminsApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuperAdminsApi
        fields = ["uname"]


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
        fields = ["uname", "website_url", "website_uname", "encrypted_pwd", "iv"]


class PasswordsApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordsApi
        fields = ["password", "website_url", "website_uname"]
        

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


class ConfirmIpApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = IpConfirmation
        fields = ["ip"]


class ChangePasswordUserApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserChangePasswordApi
        fields = ["token", "password", "newPassword"]


class LoginApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginApi
        fields = ["password", "ip"]


class SendPasswordResetMailApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserApi
        fields = ["email"]


class ResetPasswordUserApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserResetPasswordApi
        fields = ["new_password", "confirm_new_password", "token"]


class UserTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["token", "token_timestamp"]


class UserEmailTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["email_token", "email_token_timestamp"]


class ReadAllUserPasswordsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["token"]


class ReadPasswordsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passwords
        fields = ["website_uname", "website_url"]


class GetPasswordApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsitePasswordApi
        fields = ["token", "website_uname", "website_url", "password"]

