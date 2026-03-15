from django.urls import path
from . import views

urlpatterns = [
    # Yeh exact wahi URL hai jis par React Native tasveerein POST kar raha hai
    path('api/3d/upload/', views.upload_images, name='upload_images'),
]