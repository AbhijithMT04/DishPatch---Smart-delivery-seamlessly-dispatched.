from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404

from .models import Cart, Customer, Restaurant, Item, Order

import razorpay
from django.conf import settings


# Create your views here.

def sayhello(request):
    # return HttpResponse("Say hello , my app is working")
    return render (request, "index.html")

def open_signin(request):
    return render(request, "signin.html")

def open_signup(request):
    return render(request, "signup.html")

def signup(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        email = request.POST.get('email')
        mobile = request.POST.get('mobile')
        address = request.POST.get('address')
        try:
            Customer.objects.get(username = username)
            return HttpResponse("Duplicate Username!")
        except:
            Customer.objects.create(
                username = username,
                password = password,
                email = email,
                mobile = mobile,
                address = address,
            )
        return render(request, 'signin.html')

def signin(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

    try:
        Customer.objects.get(username = username, password = password)
        if username == 'admin':
            return render(request, 'admin_home.html')
        else:
            restaurantList = Restaurant.objects.all()
            return render(request, 'customer_home.html', {"restaurantList": restaurantList, "username": username})
    except Customer.DoesNotExist:
        return render(request, 'fail.html')

def open_add_restaurant(request):
    return render(request, 'add_restaurant.html')

def add_restaurant(request):
    if(request.method == 'POST'):
        name = request.POST.get('name')
        picture = request.POST.get('picture')
        cuisine = request.POST.get('cuisine')
        rating = request.POST.get('rating')

    
        if (Restaurant.objects.filter(name = name).exists()):
            return HttpResponse("Duplicate restaurant")

        Restaurant.objects.create(
            name = name,
            picture = picture,
            cuisine = cuisine,
            rating = rating
        )

    return render(request, 'admin_home.html')

def open_show_restaurant(request):
    restaurantList = Restaurant.objects.all()
    return render(request, 'show_restaurant.html', {"restaurantList":restaurantList})

def open_update_restaurant(request, restaurant_id):
    restaurant = Restaurant.objects.get(id = restaurant_id)
    return render(request, 'update_restaurant.html', {"restaurant": restaurant})

def update_restaurant(request, restaurant_id):
    restaurant = Restaurant.objects.get(id = restaurant_id)
    if request.method == 'POST':
        name = request.POST.get('name')
        picture = request.POST.get('picture')
        cuisine = request.POST.get('cuisine')
        rating = request.POST.get('rating')

        restaurant.name = name
        restaurant.picture = picture
        restaurant.cuisine = cuisine
        restaurant.rating = rating

        restaurant.save()

        restaurantList = Restaurant.objects.all()
        return render(request, 'show_restaurant.html', {"restaurantList":restaurantList})

def delete_restaurant(request, restaurant_id):
    restaurant = Restaurant.objects.get(id = restaurant_id)
    restaurant.delete()

    restaurantList = Restaurant.objects.all()
    return render(request, 'show_restaurant.html', {"restaurantList":restaurantList})

def open_update_menu(request, restaurant_id):
    restaurant = Restaurant.objects.get(id = restaurant_id)
    itemList = restaurant.items.all()
    return render(request, 'update_menu.html', {"itemList" : itemList, "restaurant": restaurant})   

def update_menu(request, restaurant_id):
    restaurant = Restaurant.objects.get(id = restaurant_id)

    if request.method == 'POST':
        name = request.POST.get('name')
        description = request.POST.get('description') 
        price = request.POST.get('price')
        vegetarian = request.POST.get('vegetarian') == 'on'
        picture = request.POST.get('picture')

        try:
            Item.objects.get(name = name)
            return HttpResponse("Duplicate Item!")
        except:
            Item.objects.create(
                restaurant = restaurant,
                name = name,
                description = description,
                price = price,
                vegetarian = vegetarian,
                picture = picture
            )

    itemList = restaurant.items.all()
    return render(request, 'update_menu.html', {"itemList": itemList, "restaurant": restaurant} )

def view_menu(request, restaurant_id, username):
    restaurant = Restaurant.objects.get(id = restaurant_id)
    itemList = restaurant.items.all()
    # itemList = Item.objects.all()
    return render(request, 'customer_menu.html', {
        "itemList": itemList,
        "restaurant": restaurant,
        "username": username
    })

def add_to_cart(request, item_id, username):
    item = Item.objects.get(id = item_id)
    customer = Customer.objects.get(username = username)

    cart, created = Cart.objects.get_or_create(customer = customer)

    cart.items.add(item)
    
    return HttpResponse('added to cart')

def show_cart(request, username):
    customer = Customer.objects.get(username = username)
    cart = Cart.objects.filter(customer = customer).first()
    items = cart.items.all() if cart else []
    total_price = cart.total_price() if cart else 0

    return render(request, 'cart.html', {"itemList": items, "total_price": total_price, "username": username})

def checkout(request, username):
    customer = Customer.objects.get(username = username)
    cart = Cart.objects.filter(customer = customer).first()
    items = cart.items.all() if cart else []
    total_price = cart.total_price() if cart else 0

    if total_price == 0:
        return render(request, 'checkout.html', {'error': 'Your cart is empty', 'username': username})

    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    client.session.trust_env = False        

    order_data = {
        'amount': int(total_price * 100),  # Amount in paisa
        'currency': 'INR',
        'payment_capture': '1',  # Automatically capture payment
    }

    try:   
        order = client.order.create(data=order_data)
    except:
        # Pass the order details to the frontend
        return render(request, 'checkout.html', {
            'username': username,
            'cart_items': items,
            'total_price': total_price,
            'error': 'Payment service is currently unreachable. Please check your internet/proxy settings and try again.'
        })

    return render(request, 'checkout.html', {
        'username': username,
        'cart_items': items,
        'total_price': total_price,
        'razorpay_key_id': settings.RAZORPAY_KEY_ID,
        'order_id': order['id'],  # Razorpay order ID
        'amount': total_price,
    })


def orders(request, username):
    customer = get_object_or_404(Customer, username=username)
    latest_order = Order.objects.filter(customer=customer).order_by('-created_at').first()

    return render(request, 'orders.html', {
        'username': username,
        'customer': customer,
        'order': latest_order,
    })


def verify_payment(request, username):
    if request.method == 'POST':
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        params = {
            'razorpay_order_id': request.POST.get('razorpay_order_id'),
            'razorpay_payment_id': request.POST.get('razorpay_payment_id'),
            'razorpay_signature': request.POST.get('razorpay_signature'),
        }
        try:
            client.utility.verify_payment_signature(params)
        except razorpay.errors.SignatureVerificationError as e:
            return HttpResponse(f"Signature check failed: {e}", status=400)

        try:
            customer = Customer.objects.get(username=username)
            cart = Cart.objects.filter(customer=customer).first()
            Order.objects.create(
                customer=customer,
                total_price=cart.total_price(),
                payment_id=params['razorpay_payment_id'],
            )
            cart.items.clear()
        except Exception as e:
            return HttpResponse(f"Order save failed: {e}", status=500)

        return redirect('orders', username)
    return HttpResponse("Invalid request", status=400)
