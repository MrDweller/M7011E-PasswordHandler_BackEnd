from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

app_name = 'database_handler'
urlpatterns = [


    # USERS
    path('user', views.UserApiView.as_view(), name="user"),
    path('user/<str:uname>/login', views.LoginApiView.as_view(), name="login"),
    path('user/<str:uname>/logout', views.LogoutApiView.as_view(), name="logout"),
    path('user/<str:uname>', views.GetUserApiView.as_view(), name="get_user"),
    path('getUsers', views.UsersApiView.as_view(), name="get_users"),
    path('removeUser', views.RemoveUserApiView.as_view(), name="remove_user"),
    path('changeUname', views.ChangeUsernameApiView.as_view(), name="change_uname"),


    # ADMINS
    path('admin', views.AdminApiView.as_view(), name="admin"),
    path('admin/<str:uname>/login', views.LoginApiView.as_view(), name="admin_login"),
    path('admin/<str:uname>/logout', views.LogoutApiView.as_view(), name="admin_logout"),
    path('admin/<str:uname>', views.GetUserApiView.as_view(), name="get_admin"),
    path('getAdmins', views.AdminsApiView.as_view(), name="get_admins"),
    path('removeAdmin', views.RemoveAdminApiView.as_view(), name="remove_admin"),
    path('addSuperAdmin', views.SuperAdminsApiView.as_view(), name="super_admin"),


    # IP
    path('user/<str:uname>/confirmIp', views.ConfirmIpApiView.as_view(), name="confirm_ip"),
    path('admin/<str:uname>/confirmIp', views.ConfirmIpApiView.as_view(), name="admin_confirm_ip"),
    path('addIp', views.IpApiView.as_view(), name="ip"),
    path('getIps', views.IpsApiView.as_view(), name="get_ips"),
    path('removeIp', views.RemoveIpsApiView.as_view(), name="remove_ip"),
    path('removeUserFromIps', views.RemoveUserFromIpsApiView.as_view(), name="remove_user_from_ip"),


    # FEEDBACK
    path('addFeedback', views.FeedbackApiView.as_view(), name="feedback"),
    path('getFeedbacks', views.FeedbacksApiView.as_view(), name="get_feedback"),
    path('removeFeedback', views.RemoveFeedbackApiView.as_view(), name="remove_feedback"),


    # PASSWORD
    path('password/<str:uname>', views.NewWebsitePasswordsApiView.as_view(), name="create_password"),
    path('passwords/<str:uname>', views.ReadAllUserPasswordsView.as_view(), name="get_all_passwords"),
    path('changeMasterPassword', views.ChangeUserPasswordApiView.as_view(), name="change_master_password"),
    path('changePasswordWebsite', views.ChangeWebsitePasswordsApiView.as_view(), name="change_website_password"),
    path('sendResetEmail', views.SendPasswordResetMailApiView.as_view(), name="send_password_reset_mail"),
    path('resetUserPassword', views.ResetUserPasswordApiView.as_view(), name="reset_user_password"),
    path('readPassword', views.GetWebsitePasswordsApiView.as_view(), name="get_website_password"),

    
]

urlpatterns = format_suffix_patterns(urlpatterns)