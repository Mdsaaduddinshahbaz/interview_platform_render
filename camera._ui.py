# import cv2
# cap=cv2.VideoCapture(0)

# while True:
#     init,frame=cap.read()
#     cv2.imshow("Camera Feed", frame)

#     # Press 'q' to exit
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break
# cap.release()
# cv2.destroyAllWindows()

import speech_recognition as sr
# import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.chat_history import InMemoryChatMessageHistory
# r = sr.Recognizer()

# with sr.Microphone() as source:
#     print("Speak...")
#     audio = r.listen(source)

# try:
#     text = r.recognize_google(audio)
#     print("You said:", text)
# except:
#     print("Could not understand audio")
prompt="hello"
llm=ChatGoogleGenerativeAI(model="gemini-3-flash-preview",google_api_key="AIzaSyA8Tv_4hjsxgz2XivgdTUYDwb09XFrSgFg")

response=llm.invoke(prompt)
print(response.text)
