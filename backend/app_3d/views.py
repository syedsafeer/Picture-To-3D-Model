import os
import uuid
import shutil
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from django.conf import settings

# Hacker Tools
from gradio_client import Client, handle_file


@csrf_exempt
def upload_images(request):
    if request.method == 'POST':
        images = request.FILES.getlist('images')

        if len(images) > 0:
            print(f"Success! Backend received {len(images)} images.")

            # 1. Tasveerein PC mein save karna
            session_id = str(uuid.uuid4())[:8]
            save_path = os.path.join(settings.MEDIA_ROOT, 'uploads', session_id)
            os.makedirs(save_path, exist_ok=True)
            fs = FileSystemStorage(location=save_path)

            saved_paths = []
            for image in images:
                filename = fs.save(image.name, image)
                saved_paths.append(os.path.join(save_path, filename))

            print(f"Tasveerein yahan save ho gayin: {save_path}")

            # ==========================================
            # HACKER MODE: 2-STEP PIPELINE (Docs ke mutabiq)
            # ==========================================
            try:
                print("🕵️‍♂️ Hacker Mode: API Docs ke mutabiq 2-step process shuru...")
                client = Client("AleenDG/3DGenTripoSR")

                # Step 1: Preprocess (Background Remove Karna)
                print("⚙️ Step 1: Background remove ho raha hai...")
                processed_image = client.predict(
                    handle_file(saved_paths[0]),  # Tasveer bheji
                    True,  # Background remove: Yes
                    0.85,  # Foreground ratio
                    api_name="/preprocess"  # Endpoint 1
                )

                # Step 2: Generate (3D Model Banana)
                print("🪄 Step 2: 3D Model ban raha hai...")
                result = client.predict(
                    handle_file(processed_image),  # Saaf tasveer bheji
                    api_name="/generate"  # Endpoint 2
                )

                # AI aam tor par 2 files deta hai (.obj aur .glb), humein .glb chahiye
                temp_model_path = None
                if isinstance(result, tuple) or isinstance(result, list):
                    for item in result:
                        if isinstance(item, str) and (item.endswith('.glb') or item.endswith('.obj')):
                            temp_model_path = item
                            break
                    if not temp_model_path:
                        temp_model_path = result[0]
                else:
                    temp_model_path = result

                # File ko apne Media folder mein copy karna
                file_ext = os.path.basename(temp_model_path).split('.')[-1]
                final_model_name = f"my_3d_model.{file_ext}"
                final_model_path = os.path.join(save_path, final_model_name)

                shutil.copy(temp_model_path, final_model_path)

                # Mobile App ke liye URL banana
                model_url = f"http://127.0.0.1:8000/{settings.MEDIA_URL}uploads/{session_id}/{final_model_name}"

                print("✅ Jadoo! Asli 3D Model Tayyar hai:", model_url)
                return JsonResponse({
                    "message": "3D Model created successfully!",
                    "model_url": model_url,
                    "session_id": session_id
                }, status=200)

            except Exception as e:
                print("❌ Server masla kar raha hai:", str(e))
                print("⚠️ App ko crash hone se bachanay ke liye Fallback (Dummy) model bhej rahe hain...")
                return JsonResponse({
                    "message": "AI Server down, using fallback",
                    "model_url": "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
                    "session_id": session_id
                }, status=200)

        else:
            return JsonResponse({"error": "No images received"}, status=400)

    return JsonResponse({"error": "Only POST method allowed"}, status=405)