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
def create_new_meeting(partcipants:list):
    print("participants in database.py",partcipants)
    meet_id=meetings.insert_one({"participants":partcipants,"created_time":datetime.utcnow()})
    print(meet_id.inserted_id)
    return meet_id.inserted_id
def update_participants_in_meeting(userid, meet_id):
    res=meetings.update_one(
        {"_id": ObjectId(meet_id)},
        {"$addToSet": {"participants": userid}}
    )
    print(res.acknowledged)
def update_messages(meet_id,sender_id,message):
    res=messages.insert_one({"meet_id":meet_id,"sender_id":sender_id,"text":message,"timestamp":datetime.utcnow()})
    print("messageupdated",res.acknowledged)
def read_messages(meet_id):
    result=messages.find({"meet_id":meet_id}).sort("timestamp",1)
    # print(result.acknowledged)
    return result.to_list()
def create_new_user(email,password):
    user=users.find_one({"email":email})
    if(user==None):
        users.insert_one({"email":email,"pasword":password})
    else:
        return 1
    return 1
def check_existing_user(email,password):
    user=users.find_one({"email":email})
    if(user): return user["_id"]
    else: return 0
def read(email):
    user=users.find_one({"email":email})
    print(user["_id"])
def update(email):
    result=users.update_one({"email":email},{"$set":{"password":5784}})
    print(result.matched_count)
