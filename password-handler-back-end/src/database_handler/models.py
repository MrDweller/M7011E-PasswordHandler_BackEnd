# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Admins(models.Model):
    uname = models.CharField(primary_key=True, max_length=128)
    email = models.CharField(unique=True, max_length=128)
    hashed_pwd = models.CharField(max_length=128)
    salt = models.CharField(max_length=128)
    token = models.CharField(max_length=256)
    token_timestamp = models.DateTimeField()
    email_token = models.CharField(max_length=256)
    email_token_timestamp = models.CharField(max_length=256)

    class Meta:
        managed = False
        db_table = 'admins'


class AdminsApi(models.Model):
    uname = models.CharField(primary_key=True, max_length=128)
    email = models.CharField(unique=True, max_length=128)


class Feedback(models.Model):
    id = models.BigAutoField(primary_key=True)
    feedback = models.CharField(max_length=512)

    class Meta:
        managed = False
        db_table = 'feedback'


class FeedbackApi(models.Model):
    id = models.IntegerField(primary_key=True)


class Ips(models.Model):
    uname = models.ForeignKey('Users', models.DO_NOTHING, db_column='uname')
    ip = models.CharField(max_length=128)

    class Meta:
        managed = False
        db_table = 'ips'
        constraints = [
            models.UniqueConstraint(fields=['uname', 'ip'], name='unique_constraint')
        ]

class AdminsIps(models.Model):
    uname = models.ForeignKey('Admins', models.DO_NOTHING, db_column='uname')
    ip = models.CharField(max_length=128)

    class Meta:
        managed = False
        db_table = 'admin_ips'
        constraints = [
            models.UniqueConstraint(fields=['uname', 'ip'], name='unique_constraint_admins')
        ]


class IpConfirmation(models.Model):
    ip = models.CharField(max_length=128)


class Passwords(models.Model):
    uname = models.ForeignKey('Users', models.DO_NOTHING, db_column='uname')
    website_url = models.CharField(max_length=128)
    website_uname = models.CharField(max_length=128)
    encrypted_pwd = models.CharField(max_length=256, primary_key=True)
    iv = models.CharField(max_length=128)

    class Meta:
        managed = False
        db_table = 'passwords'
        unique_together = (('uname', 'website_url', 'website_uname'),)


class PasswordsApi(models.Model):
    password = models.CharField(max_length=256)
    website_url = models.CharField(max_length=128)
    website_uname = models.CharField(max_length=128)


class SuperAdmins(models.Model):
    uname = models.ForeignKey(Admins, models.DO_NOTHING, db_column='uname', primary_key=True)

    class Meta:
        managed = False
        db_table = 'super_admins'


class SuperAdminsApi(models.Model):
    uname = models.CharField(primary_key=True, max_length=128)


class Users(models.Model):
    uname = models.CharField(primary_key=True, max_length=128)
    email = models.CharField(unique=True, max_length=128)
    hashedhashed_masterpwd = models.CharField(max_length=128)
    salt_1 = models.CharField(max_length=128)
    salt_2 = models.CharField(max_length=128)
    encrypted_key = models.CharField(max_length=128)
    iv = models.CharField(max_length=128)
    token = models.CharField(max_length=256)
    token_timestamp = models.DateTimeField()
    email_token = models.CharField(max_length=256)
    email_token_timestamp = models.CharField(max_length=256)
    pfpid = models.CharField(max_length=128)
    pfpURL =models.CharField(max_length=128)

    class Meta:
        managed = False
        db_table = 'users'


class UsersApi(models.Model):
    uname = models.CharField(primary_key=True, max_length=128)
    email = models.CharField(unique=True, max_length=128)
    password = models.CharField(max_length=128)


class UserApi(models.Model):
    uname = models.CharField(primary_key=True, max_length=128)
    email = models.CharField(unique=True, max_length=128)
    password = models.CharField(max_length=128)


class UserChangePasswordApi(models.Model):
    token = models.CharField(primary_key=True, max_length=128)
    password = models.CharField(max_length=128)
    newPassword = models.CharField(max_length=128)


class ChangeUsernameApi(models.Model):
    token = models.CharField(max_length=256)
    new_uname = models.CharField(max_length=128)


class ChangeEmailApi(models.Model):
    token = models.CharField(max_length=256)
    new_email = models.CharField(max_length=128)


class LoginApi(models.Model):
    password = models.CharField(max_length=128)
    ip = models.CharField(max_length=128)


class UserResetPasswordApi(models.Model):
    new_password = models.CharField(max_length=128)
    confirm_new_password = models.CharField(max_length=128)
    token = models.CharField(max_length=256)


class UserTokenApi(models.Model):
    token = models.CharField(max_length=128)
    token_timestamp = models.DateTimeField()


class WebsitePasswordApi(models.Model):
    website_url = models.CharField(max_length=128)
    website_uname = models.CharField(max_length=128)
    website_password = models.CharField(max_length=256)

class WriteAdminPasswordApi(models.Model):
    password = models.CharField(max_length=128)