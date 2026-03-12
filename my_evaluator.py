from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate,SystemMessagePromptTemplate,HumanMessagePromptTemplate
from datetime import datetime
from langchain_core.chat_history import InMemoryChatMessageHistory
import re ,json

llm=ChatGoogleGenerativeAI(model='gemini-2.5-flash',api_key="AIzaSyA8Tv_4hjsxgz2XivgdTUYDwb09XFrSgFg")

system_prompt2=SystemMessagePromptTemplate.from_template(
"""
You are an expert technical evaluator.

Your task is to evaluate a my answer to a given question.

Evaluation Instructions:
1. Carefully compare the my answer with the expected concepts.
2. Identify incorrect statements, missing concepts, or weak explanations.
3. Judge the answer based on:
   - Correctness
   - Completeness
   - Clarity of explanation
4. Be objective and constructive in your feedback.
5. Strictly ignore Typos

Scoring Guide:
10 = Perfect answer with complete explanation  
8-9 = Correct answer with minor missing details  
6-7 = Partially correct but missing important concepts  
4-5 = Significant gaps in understanding  
1-3 = Mostly incorrect or irrelevant answer  


Mistakes:
- list specific mistakes or missing points

Rating: X/10

Areas to Improve:
- list topics or concepts the user should study

Feedback:
- Provide constructive suggestions to help the user improve.

Return the evaluation strictly in JSON format.

{{
 "Mistakes":[] ,
 "Rating": 0,
 "Areas_to_Improve": [],
 "Feedback": ""
}}

Return ONLY valid JSON.
"""
)
system_prompt1=SystemMessagePromptTemplate.from_template(
"""
You are an expert technical evaluator.

Your task is to evaluate a user's answer to a given question.

Evaluation Instructions:
1. Carefully compare the user's answer with the expected concepts.
2. Identify incorrect statements, missing concepts, or weak explanations.
3. Judge the answer based on:
   - Correctness
   - Completeness
   - Clarity of explanation
4. Be objective and constructive in your feedback.

Scoring Guide:
10 = Perfect answer with complete explanation  
8-9 = Correct answer with minor missing details  
6-7 = Partially correct but missing important concepts  
4-5 = Significant gaps in understanding  
1-3 = Mostly incorrect or irrelevant answer  

Return the evaluation strictly in the following format:

Mistakes:
- list specific mistakes or missing points

Rating: X/10

Areas to Improve:
- list topics or concepts the user should study

Feedback:
- Provide constructive suggestions to help the user improve.
"""
)
# human_prompt = HumanMessagePromptTemplate.from_template(
# """
# Question:
# {question}

# User Answer:
# {answer}
# """
# )
human_prompt = HumanMessagePromptTemplate.from_template(
"""
User_response:{user_responses}
"""
)
system_prompt = SystemMessagePromptTemplate.from_template(
"""
You are an expert technical evaluator.

Your task is to evaluate a My answer to a given question.

Evaluation Instructions:
1. Carefully compare the My answer with the expected concepts.
2. Identify incorrect statements, missing concepts, or weak explanations.
3. Judge the answer based on:
   - Correctness
   - Completeness
   - Clarity of explanation
4. Be objective and constructive in your feedback.
5. Strictly ignore typos.

Scoring Guide:
10 = Perfect answer with complete explanation  
8-9 = Correct answer with minor missing details  
6-7 = Partially correct but missing important concepts  
4-5 = Significant gaps in understanding  
1-3 = Mostly incorrect or irrelevant answer  

Output Requirements (VERY IMPORTANT):

- The response MUST be valid JSON.
- Do NOT include explanations outside JSON.
- Each item in "Mistakes" MUST be a STRING.
- Do NOT use objects inside the Mistakes list.

Return the evaluation strictly in the following format:

{{
  "Mistakes": [
    "mistake 1",
    "mistake 2",
    "mistake 3"
  ],
  "Rating": 0,
  "Areas_to_Improve": [
    "topic 1",
    "topic 2"
  ],
  "Feedback": "constructive feedback here"
}}

Return ONLY valid JSON.
"""
)
chat_prompt = ChatPromptTemplate.from_messages(
    [system_prompt, human_prompt]
)
chain = chat_prompt | llm
start=datetime.now()
# response = chain.invoke({
#     "question": "What is overfitting in machine learning?",
#     "answer": "Overfitting is when model learns too much data"
# })
# total_time=datetime.now()-start
# print(total_time)
# text = response.content

# clean = re.sub(r"```json|```", "", text).strip()

# data = json.loads(clean)

# print(data["Mistakes"])
# print(data["Rating"])
# print(response.content)
def evaluate_responses(responses, api_key):

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        api_key=api_key
    )

    chain = chat_prompt | llm

    response = chain.invoke({"user_responses":responses})
    text = response.content

    clean = re.sub(r"```json|```", "", text).strip()

    data = json.loads(clean)

    print(data["Mistakes"])
    print(data["Rating"])

    return data
# result=llm.invoke("Question:what is machine learning \n Answer:machine learning is a field of statistics that tries to find the correlation between input and output features and it has two types supervised learning and unsupervised learning")
# print(result.content)

'''
const keys = Object.keys(qa_pair);
    const firstKey = keys[0];
    const secondKey = keys[1];
    const length = keys.length;
    if (firstKey === "question"&&secondKey==="answer"&&length===2) {
        console.log("First key is question");
    } else {
        console.log("First key is not question");
    }
    console.log(store_chats)'''