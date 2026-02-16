from django.urls import path
from .views import check_email, login_user, signup_user, user_likes, get_properties

urlpatterns = [
    path('check-email/', check_email, name='check_email'),
    path('login/', login_user, name='login'),
    path('signup/', signup_user, name='signup'),
    path('likes/', user_likes, name='user_likes'),
    path('properties/', get_properties, name='get_properties'),
]