from django.contrib.auth.models import User
from rest_framework import status

@api_view(['POST'])
def register_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    # Profile pic will come later, let's start with these two
    
    if not email or not password:
        return Response({"error": "Send both email and password"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=email).exists():
        return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=email, email=email, password=password)
    return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)