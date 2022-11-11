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
    hashed_pwd = models.CharField(max_length=32)
    salt = models.CharField(max_length=32)

    class Meta:
        managed = False
        db_table = 'admins'


class Feedback(models.Model):
    id = models.BigAutoField(primary_key=True)
    uname = models.ForeignKey('Users', models.DO_NOTHING, db_column='uname')
    feedback = models.CharField(max_length=256)

    class Meta:
        managed = False
        db_table = 'feedback'


class Ips(models.Model):
    uname = models.OneToOneField('Users', models.DO_NOTHING, db_column='uname', primary_key=True)
    ip = models.CharField(max_length=128)

    class Meta:
        managed = False
        db_table = 'ips'
        unique_together = (('uname', 'ip'),)


class Passwords(models.Model):
    uname = models.OneToOneField('Users', models.DO_NOTHING, db_column='uname', primary_key=True)
    website_url = models.CharField(max_length=128)
    website_uname = models.CharField(max_length=128)
    encrypted_pwd = models.CharField(max_length=256)

    class Meta:
        managed = False
        db_table = 'passwords'
        unique_together = (('uname', 'website_url', 'website_uname'),)


class SuperAdmins(models.Model):
    uname = models.CharField(primary_key=True, max_length=128)
    email = models.CharField(unique=True, max_length=128)
    hashed_pwd = models.CharField(max_length=32)
    salt = models.CharField(max_length=32)

    class Meta:
        managed = False
        db_table = 'super_admins'


class Users(models.Model):
    uname = models.CharField(primary_key=True, max_length=128)
    email = models.CharField(unique=True, max_length=128)
    hashedhashed_masterpwd = models.CharField(max_length=32)
    salt_1 = models.CharField(max_length=32)
    salt_2 = models.CharField(max_length=32)
    encrypted_key = models.CharField(max_length=128)
    iv = models.CharField(max_length=128)

    class Meta:
        managed = False
        db_table = 'users'
        
class UsersApi(models.Model):
    uname = models.CharField(primary_key=True, max_length=128)
    email = models.CharField(unique=True, max_length=128)
    password = models.CharField(max_length=32)

class UserApi(models.Model):
    uname = models.CharField(primary_key=True, max_length=128)
    email = models.CharField(unique=True, max_length=128)
    password = models.CharField(max_length=32)


class UserChangePasswordApi(models.Model):
    uname = models.CharField(primary_key=True, max_length=128)
    newPassword = models.CharField(max_length=32)

    class Meta:
        managed = False
        db_table = 'users'
