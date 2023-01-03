from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

app_name = 'database_handler'
urlpatterns = [


    # USERS
    path('user', views.UserApiView.as_view(), name="user"),
    path('user/<str:uname>/login', views.LoginApiView.as_view(), name="login"),
    path('user/<str:identification>/uname', views.GetUnameView.as_view(), name="get_uname"),
    path('user/<str:uname>/logout', views.LogoutApiView.as_view(), name="logout"),
    path('user/<str:uname>/pfp', views.PFPView.as_view(), name="pfp"),
    path('user/<str:uname>', views.GetUserApiView.as_view(), name="get_user"),
    path('users', views.UsersApiView.as_view(), name="get_users"),


    # ADMINS
    path('admin', views.AdminApiView.as_view(), name="admin"),
    path('admin/<str:uname>/login', views.LoginApiView.as_view(), name="admin_login"),
    path('admin/<str:uname>/logout', views.LogoutApiView.as_view(), name="admin_logout"),
    path('admin/<str:uname>', views.GetUserApiView.as_view(), name="get_admin"),
    path('admins', views.AdminsApiView.as_view(), name="get_admins"),

    # IP
    path('user/<str:uname>/confirmIp', views.ConfirmIpApiView.as_view(), name="confirm_ip"),
    path('admin/<str:uname>/confirmIp', views.ConfirmIpApiView.as_view(), name="admin_confirm_ip"),
    


    # FEEDBACK
    path('addFeedback', views.FeedbackApiView.as_view(), name="feedback"),
    path('getFeedbacks', views.FeedbacksApiView.as_view(), name="get_feedback"),
    path('removeFeedback', views.RemoveFeedbackApiView.as_view(), name="remove_feedback"),


    # PASSWORD
    path('password/<str:uname>', views.NewWebsitePasswordsApiView.as_view(), name="create_password"),
    path('passwords/<str:uname>', views.ReadAllUserPasswordsView.as_view(), name="get_all_passwords"),

    
]

urlpatterns = format_suffix_patterns(urlpatterns)