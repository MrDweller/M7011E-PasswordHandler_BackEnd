from django.urls import path
from . import views

app_name = 'database_handler'
urlpatterns = [
    # USERS
    path('addUser', views.UserApiView.as_view(), name="user"),
    path('getUsers', views.UsersApiView.as_view(), name="get_users"),
    path('readUserName', views.GetUserApiView.as_view(), name="get_user"),
    path('removeUser', views.RemoveUserApiView.as_view(), name="remove_user"),
    path('authenticate', views.LoginApiView.as_view(), name="login"),

    # ADMINS
    path('addAdmin', views.AdminApiView.as_view(), name="admin"),
    path('getAdmins', views.AdminsApiView.as_view(), name="get_admins"),
    path('removeAdmin', views.RemoveAdminApiView.as_view(), name="remove_admin"),
    path('addSuperAdmin', views.SuperAdminsApiView.as_view(), name="super_admin"),

    # IP, TODO: getIps needs work.
    path('addIp', views.IpApiView.as_view(), name="ip"),
    path('getIps', views.IpsApiView.as_view(), name="get_ips"),
    path('removeIp', views.RemoveIpsApiView.as_view(), name="remove_ip"),
    path('removeUserFromIps', views.RemoveUserFromIpsApiView.as_view(), name="remove_user_from_ip"),

    # FEEDBACK
    path('addFeedback', views.FeedbackApiView.as_view(), name="feedback"),
    path('getFeedbacks', views.FeedbacksApiView.as_view(), name="get_feedback"),
    path('removeFeedback', views.RemoveFeedbackApiView.as_view(), name="remove_feedback"),

    # PASSWORD
    path('addNewWebsitePassword', views.NewWebsitePasswordsApiView.as_view(), name="add_new_website_password"),
    path('changePasswordUser', views.ChangeUserPasswordApiView.as_view(), name="change_user_password"),
    path('changePasswordWebsite', views.ChangeWebsitePasswordsApiView.as_view(), name="change_website_password"),
    path('sendResetEmail', views.SendPasswordResetMailApiView.as_view(), name="send_password_reset_mail"),
    path('resetUserPassword', views.ResetUserPasswordApiView.as_view(), name="reset_user_password"),
    path('readAllPasswords', views.ReadAllUserPasswordsView.as_view(), name="read_all_passwords"),
    path('readPassword', views.GetWebsitePasswordsApiView.as_view(), name="get_website_password"),

    

    
]