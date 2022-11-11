from django.urls import path
from . import views

app_name = 'database_handler'
urlpatterns = [
    path('addUser/', views.UserApiView.as_view(), name="user"),
    path('getUsers/', views.UsersApiView.as_view(), name="users"),
    path('addAdmin/', views.AdminsApiView.as_view(), name="admins"),
    path('addSuperAdmin/', views.SuperAdminsApiView.as_view(), name="super_admins"),
    path('addIP/', views.IpsApiView.as_view(), name="ips"),
    path('addFeedback/', views.FeedbacksApiView.as_view(), name="feedbacks"),
    path('removeUser/', views.RemoveUserApiView.as_view(), name="removeUser"),
    path('removeAdmin/', views.RemoveAdminApiView.as_view(), name="removeAdmin"),
    path('removeFeedback/', views.RemoveFeedbackApiView.as_view(), name="removeFeedback"),
    path('removeIps/', views.RemoveIpsApiView.as_view(), name="removeIps"),
    path('changeUserPassword/', views.ChangeUserPasswordApiView.as_view(), name="changeUserPassword"),
]