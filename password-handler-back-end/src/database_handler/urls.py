from django.urls import path
from . import views

app_name = 'database_handler'
urlpatterns = [
    path('addUser/', views.UsersApiView.as_view(), name="users"),
]