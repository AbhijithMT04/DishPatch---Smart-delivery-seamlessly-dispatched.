from django.db import models

# Create your models here.
class Customer(models.Model):
    username = models.CharField(max_length = 20)
    password = models.CharField(max_length = 20)
    email = models.CharField(max_length = 20)
    mobile = models.CharField(max_length = 10)
    address = models.CharField(max_length = 50)

class Restaurant(models.Model):
    name = models.CharField(max_length = 20)
    picture = models.CharField(max_length = 300, default="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkGDZhFXH3-X5rNYfs8UjxfNCI-EWnsjhNA7TdMrFMVA&s=10")
    cuisine = models.CharField(max_length = 200)
    rating = models.CharField(max_length = 20)

class Item(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="items")
    name = models.CharField(max_length=20)
    description = models.CharField(max_length=200)
    price = models.FloatField()
    vegetarian = models.BooleanField(default=False)
    picture = models.URLField(max_length=400, default="https://cdn.pixabay.com/photo/2023/05/30/16/56/food-8029158_640.png")
