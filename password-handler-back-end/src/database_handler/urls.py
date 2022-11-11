from django.urls import path
from . import views

app_name = 'database_handler'
urlpatterns = [
    path('addUser/', views.UsersApiView.as_view(), name="users"),
    path('removeUser/', views.RemoveUserApiView.as_view(), name="removeUser"),
    path('removeAdmin/', views.RemoveAdminApiView.as_view(), name="removeAdmin"),
    path('removeFeedback/', views.RemoveFeedbackApiView.as_view(), name="removeFeedback"),
    path('removeIps/', views.RemoveIpsApiView.as_view(), name="removeIps"),
    path('changeUserPassword/', views.ChangeUserPasswordApiView.as_view(), name="changeUserPassword"),
]