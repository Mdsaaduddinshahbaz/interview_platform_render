from flask import render_template ,Flask,redirect,url_for,request
from flask_socketio import SocketIO, join_room, emit
from database import create_new_user,check_existing_user,create_new_meeting,update_participants_in_meeting,update_messages,read_messages,list_previous_meetings,list_messages
import uuid
from datetime import datetime
app=Flask(__name__)
socketio = SocketIO(app)
random_string=""
chat_rooms = {}
def generate_meet_id():
    return str(uuid.uuid4())[:8]


@app.route("/home")
def home():
    return render_template("index.html")

@app.route("/login")
def login():
    return render_template("auth.html")
@app.route("/signup")
def signup():
    return render_template("signup.html")
@app.post("/validate")
def validate():
    data=request.get_json()
    if not data:
       return ({"success":False})
    print(data)
    userid=check_existing_user(data["username"],data["password"])
    userid=str(userid)
    print(userid)
    if(userid==0):
        return ({"success":False})
    return ({"success":True,"user_id":userid})
@app.post("/validate_meet")
def validate_meet_request():
    data=request.get_json()
    if not data : return ({"success":False})
    print("data in validate_meet",data)
    meetid=create_new_meeting(data["participants"])
    meetid=str(meetid)
    return ({"success":True,"meet_id":meetid})



# Create new meet
@app.route("/meet")
def create_meet():
    meet_id = generate_meet_id()
    chat_rooms[meet_id] = []
    return redirect(url_for("join_meet", meet_id=meet_id))


@app.route("/meet/<meet_id>")
def join_meet(meet_id):
    # if meet_id not in chat_rooms:
    #     chat_rooms[meet_id] = []

    return render_template("session.html", meet_id=meet_id)

@socketio.on("join")
def handle_join(data):
    print("new user connected")
    meet_id = data["meet_id"]
    user_id=data["userid"]
    join_room(meet_id)
    print("userid=",user_id)
    update_participants_in_meeting(user_id,meet_id)
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


@socketio.on("send_message")
def handle_message(data):
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



# @socketio.on("push_message")
@app.post("/list_meetings")
def list_meetingss():
    data=request.get_json()
    userid=data["userid"]
    res=list_previous_meetings(userid)
    # if not res:
    #     return {"success":False}
    # else:
    if res:
        return {"success":True,"results":res}
    return {"success":False}
@app.post("/list_messages")
def messaged():
    data=request.get_json()
    meet_id=data["meetid"]
    results=list_messages(meet_id)
    if(results):
        return ({"success":True,"results":results})
    return ({"success":False})
if __name__ == "__main__":
    socketio.run(app, debug=True)