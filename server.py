from flask import render_template ,Flask,redirect,url_for,request
from flask_socketio import SocketIO, join_room, emit
from database import create_new_user,check_existing_user,create_new_meeting,update_participants_in_meeting,update_messages,read_messages,list_previous_meetings,list_messages,delete_meetings,save_key,add_llm_result_response
import uuid
from evaluator import evaluate_responses
from datetime import datetime
import os
app=Flask(__name__)
socketio = SocketIO(app)
random_string=""
chat_rooms = {}
def generate_meet_id():
    return str(uuid.uuid4())[:8]


@app.route("/home")
def home():
    try:
        return render_template("index.html")
    except:
        return({"success":False})

@app.route("/login")
def login():
    try:
        return render_template("auth.html")
    except:
        return({"success":False})
@app.route("/signup")
def signup():
    try:
        return render_template("signup.html")
    except:
        return({"success":False})
@app.post("/signup_user")
def signup_user():
    try:
        # print(signup)
        data=request.get_json()
        print("data in signup",data)
        email=data["email"]
        password=data["password"]
        username=data["username"]
        # print(email)
        res=create_new_user(email,password,username)
        if(res):
            return ({"success":True})
        else:
            return ({"success":False})
    except:
        return({"success":False})
@app.post("/validate")
def validate():
    try:
        data=request.get_json()
        if not data:
            return ({"success":False})
        print(data)
        res=check_existing_user(data["email"],data["password"])
        print(res)
        if(res["success"]==False): return({"success":False})
        elif(res["success"]==True): 
            userid=str(res["userid"])
            username=res["username"]
            print(userid)
            return ({"success":True,"user_id":userid,"username":username})
        else: return({"success":"Not_found"})
    except:
        return({"success":False})
@app.post("/validate_meet")
def validate_meet_request():
    try:
        data=request.get_json()
        if not data : return ({"success":False})
        print("data in validate_meet",data)
        meetid=create_new_meeting(data["participants_name"],data["participants"])
        meetid=str(meetid)
        return ({"success":True,"meet_id":meetid})
    except:
        return({"success":False})



# Create new meet
@app.route("/meet")
def create_meet():
    try:
        meet_id = generate_meet_id()
        chat_rooms[meet_id] = []
        return redirect(url_for("join_meet", meet_id=meet_id))
    except:
        return({"success":False})


@app.route("/meet/<meet_id>")
def join_meet(meet_id):
    try:
        # if meet_id not in chat_rooms:
        #     chat_rooms[meet_id] = []

        return render_template("session.html", meet_id=meet_id)
    except:
        return({"success":False})

@socketio.on("join")
def handle_join(data):
    try:
        print("new user connected")
        meet_id = data["meet_id"]
        user_id=data["userid"]
        username=data["username"]
        join_room(meet_id)
        print("userid=",user_id)
        update_participants_in_meeting(user_id,meet_id,username)
        # Send previous messages to new user
        result=read_messages(meet_id)
        # for msg in result:
        #     print(msg["text"])
        #     emit("receive_message", msg["text"])
        for msg in result:
            emit("receive_message", {
                "sender":"user",
                "userId": msg["sender_id"],
                "message": msg["text"]
            })
        # for msg in chat_rooms.get(meet_id, []):
        #     emit("receive_message", msg)
    except:
        return({"success":False})


@socketio.on("send_message")
def handle_message(data):
    try:
        print("in handle messages")
        meet_id = data["meet_id"]

        message_obj = {
            "sender": data["sender"],
            "message": data["message"],
            "userId":data["userId"]
        }

        # Save in memory
        # chat_rooms[meet_id].append(message_obj)
        update_messages(meet_id,data["userId"],data["message"])
        

        # Broadcast to everyone in room
        emit("receive_message", message_obj, room=meet_id)
    except:
        return({"success":False})



# @socketio.on("push_message")
@app.post("/list_meetings")
def list_meetingss():
    try:
        data=request.get_json()
        userid=data["userid"]
        res=list_previous_meetings(userid)
        # if not res:
        #     return {"success":False}
        # else:
        if res:
            return {"success":True,"results":res}
        return {"success":False}
    except:
        return({"success":False})
@app.post("/list_messages")
def messaged():
    try:
        data=request.get_json()
        meet_id=data["meetid"]
        print("meet_id=",meet_id)
        results=list_messages(meet_id)
        print("results=",results)
        if(results):
            return ({"success":True,"results":results})
        return ({"success":False})
    except:
        return({"success":False})
@app.post("/delete_meeting")
def delete_meet():
    try:
        data=request.get_json()
        meet_id=data["meetid"]
        res=delete_meetings(meet_id)
        if(res):
            return ({"success":True})
        else:
            return ({"success":False})
    except:
        return ({"success":False})

@app.post("/llm_call")
def fetch_llm_response():
    # try:
    data=request.get_json()
    user_data=data["user_chats"]
    api=data["api"]
    # meet_id=data["meetid"]
    print(user_data)
    responses=[]
    # for response in user_data:
    #     print("response=",type(response))
    #     responses.append(evaluate_responses(response["question"],response["answer"],api))
    responses.append(evaluate_responses(user_data,api))
    if(responses):
        # add_llm_result_response(meet_id,responses["Mistakes"],responses["Rating"],responses["Areas_to_Improve"],responses["Feedback"])
        return({"success":True,"result":responses})
    return({"success":False})
    # except:
    #     return ({"success":False})
@app.post("/save_key")
def savekey():
    try:
        data=request.get_json()
        user_id=data["userid"]
        api_key=data["api_key"]
        print("use",user_id)
        res=save_key(user_id,api_key)
        print(res)
        if(res):
            return ({"success":True})
        else:
            return ({"success":False})
    except:
        return ({"success":False})
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port, allow_unsafe_werkzeug=True)
