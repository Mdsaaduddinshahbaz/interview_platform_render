from pymongo import MongoClient
from dotenv import load_dotenv
import jwt
from bson import ObjectId
from datetime import datetime
load_dotenv(override=True)
import os
uri=os.getenv("MONGO_URI")
client = MongoClient(uri)
try:
    client.admin.command('ping')
    print("Connected successfullyto MongoDB Atlas!")
except Exception as e:
    print("Connection failed:", e)
db=client["Interview"]
users=db["Users"]
meetings=db["meetings"]
messages=db["messsages"]
llm_results=db["llm_results"]
def create_new_meeting(participants_name:list ,partcipants:list):
    print("participants in database.py",partcipants)
    meet_id=meetings.insert_one({"participants_name":participants_name,"participants":partcipants,"created_time":datetime.utcnow()})
    print(meet_id.inserted_id)
    return meet_id.inserted_id
def update_participants_in_meeting(userid, meet_id,username):
    res=meetings.update_one(
        {"_id": ObjectId(meet_id)},
        {"$addToSet": {"participants": userid,"participants_name":username}},
    )
    print(res.acknowledged)
def update_messages(meet_id,sender_id,message):
    res=messages.insert_one({"meet_id":meet_id,"sender_id":sender_id,"text":message,"timestamp":datetime.utcnow()})
    print("messageupdated",res.acknowledged)
def list_previous_meetings(userid):
    meetings.delete_many({
    "$and": [
        {"participants": userid},
        {"participants": {"$size": 1}}
    ]
    })

    results=meetings.find({"participants":userid})
    meetings_list=[]
    for m in results:
        meetings_list.append({
            "meet_id": str(m["_id"]),
            "participants_name":m["participants_name"],
            "participants": m["participants"],
            "created_time": m["created_time"].isoformat()
        })
    return meetings_list
    # return list(results)
def delete_meetings(meetid):
    # meetid=ObjectId(meetid)
    response=messages.delete_many({"meet_id":meetid})
    if (response):
        res = meetings.find_one_and_delete({"_id": ObjectId(meetid)})
        if res:
            return True
        else:
            return False
    else:
        return False
    
def read_messages(meet_id):
    result=messages.find({"meet_id":meet_id}).sort("timestamp",1)
    # print(result.acknowledged)
    return result.to_list()
def list_messages(meet_id):
    # meet_id=ObjectId(meet_id)
    result=messages.find({"meet_id":meet_id}).sort("timestamp",1)
    meetings_list=[]
    for m in result:
        meetings_list.append({
            "meet_id": str(m["_id"]),
            "sender_id": m["sender_id"],
            "text":m["text"],
            "created_time": m["timestamp"].isoformat()
        })
    return meetings_list

def create_new_user(email, password,username):
    user = users.find_one({"email": email})

    if user is None:
        users.insert_one({
            "email": email,
            "username":username,
            "password": password
        })
        return True
    else:
        return False
def check_existing_user(email,password):
    user=users.find_one({"email":email})
    print(user)
    if(user): 
        if(user["password"]==password):
            return ({"success":True,"userid":user["_id"],"username":user["username"]})
        else:
            return {"success":False}
    else: return {"success":404}
def read(email):
    user=users.find_one({"email":email})
    print(user["_id"])
def update(email):
    result=users.update_one({"email":email},{"$set":{"password":5784}})
    print(result.matched_count)
def save_key(userid,api_key):
    print("in savkey")
    userid=ObjectId(userid)
    print(userid)
    result = users.update_one(
            {"_id": userid},
            {"$set": {"api_key": api_key}}
        )
        
    return result.modified_count > 0
def add_llm_result_response(meet_id,mistakes,Rating,Areas_to_improve,Feedback):
    llm_results.insert_one({"meet_id":meet_id,"mistakes":mistakes,"Rating":Rating,"Areas_to_improve":Areas_to_improve,"Feedback":Feedback})

# list_previous_meetings("69a959defa10620eb63cf31d")