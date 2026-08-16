class DebugMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print(f"DEBUG REQUEST: {request.path}")
        print(f"DEBUG AUTHORIZATION HEADER: {request.META.get('HTTP_AUTHORIZATION')}")
        response = self.get_response(request)
        return response
