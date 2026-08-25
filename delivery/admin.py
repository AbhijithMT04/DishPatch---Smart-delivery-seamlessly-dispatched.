from django.contrib import admin

from .models import Cart, Customer, Item, Restaurant

admin.site.register(Customer)
admin.site.register(Restaurant)
admin.site.register(Item)
admin.site.register(Cart)

# Register your models here.
