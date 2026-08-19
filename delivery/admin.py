from django.contrib import admin

from .models import Customer, Item, Restaurant

admin.site.register(Customer)
admin.site.register(Restaurant)
admin.site.register(Item)

# Register your models here.
