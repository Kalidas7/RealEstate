from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from .models import UserProfile, UserLike
from .serializers import UserSerializer, UserLikeSerializer

@api_view(['POST'])
def check_email(request):
    """
    Checks if an email exists in the database.
    """
    email = request.data.get('email')
    if not email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    exists = User.objects.filter(email=email).exists()
    return Response({"exists": exists, "email": email}, status=status.HTTP_200_OK)

@api_view(['POST'])
def login_user(request):
    """
    Logs in a user with email and password.
    """
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    # Django's authenticate takes username, so we fetch the user by email first
    try:
        user_obj = User.objects.get(email=email)
        user = authenticate(username=user_obj.username, password=password)
        
        if user:
            serializer = UserSerializer(user)
            return Response({"message": "Login successful", "user": serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def signup_user(request):
    """
    Creates a new user with profile details.
    """
    email = request.data.get('email')
    password = request.data.get('password')
    contact_number = request.data.get('contact_number')
    profile_pic = request.FILES.get('profile_pic')

    if not email or not password:
        return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "User with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create User
        user = User.objects.create_user(username=email, email=email, password=password)
        
        # Create UserProfile
        UserProfile.objects.create(
            user=user,
            contact_number=contact_number,
            profile_pic=profile_pic
        )
        
        serializer = UserSerializer(user)
        return Response({"message": "User created successfully", "user": serializer.data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
def user_likes(request):
    """
    GET: List all likes for a user (query param user_id or email).
    POST: Add a like for a user.
    """
    if request.method == 'GET':
        email = request.query_params.get('email')
        if not email:
             return Response({"error": "Email query param required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            likes = UserLike.objects.filter(user=user)
            serializer = UserLikeSerializer(likes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
             return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'POST':
        email = request.data.get('email')
        liked_item_id = request.data.get('liked_item_id')
        
        if not email or not liked_item_id:
             return Response({"error": "Email and liked_item_id required"}, status=status.HTTP_400_BAD_REQUEST)
             
        try:
            user = User.objects.get(email=email)
            # Check if already liked to avoid duplicates if desired, or allow multiples
            like, created = UserLike.objects.get_or_create(user=user, liked_item_id=liked_item_id)
            if created:
                return Response({"message": "Like added"}, status=status.HTTP_201_CREATED)
            else:
                return Response({"message": "Already liked"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
             return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)